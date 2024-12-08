import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { Payment } from "../models/Payment";
import { Cart } from "../models/Cart";
import { getValidUpdates } from "../utils/validate-updates";
import { getPaginated } from "../utils/paginate";
import { stripe } from "../utils/stripe";
import { Vendor } from "../models/Vendor";
import { User } from "../models/User";
import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product";
export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      paymentMethod,
      paymentStatus,
      amount,
      transactionId,
      cartUniqueId,
    } = req.body;

    const cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cartUniqueId,
      },
    });
    if (!cart) {
      return res.status(403).send({ message: "Cart not found." });
    }
    const payment = await Payment.create({
      paymentMethod,
      paymentStatus,
      amount,
      transactionId,
      CartId: cart.id,
    });

    delete payment.dataValues.id;
    delete payment.dataValues.CartId;
    res.status(201).send({
      message: "Success",
      data: payment,
    });
  } catch (error: any) {
    next(error);
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = [
      "paymentMethod",
      "paymentStatus",
      "amount",
      "transactionId",
    ];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    const result = await Payment.update(
      { ...validBody },
      {
        where: {
          uuid: uid,
        },
      }
    );
    if (!result[0]) {
      const err = new BadRequestError("Could not update data");
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: result });
  } catch (error) {
    next(error);
  }
};
export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // uid of the payment

    const result = await Payment.destroy({
      where: {
        uuid: uid,
      },
    });
    if (result === 1) {
      res.send({ message: "Success" });
    } else {
      const err = new BadRequestError("Bad Request");
      res.status(err.status).send({ message: err.message });
    }
  } catch (error) {
    next(error);
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params; // uuid of the product variant NOT the variant values

    const payment = await Payment.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    if (!payment) {
      const err = new BadRequestError("Bad Request");
      return res.status(err.status).send({ message: err.message });
    }
    res.send({
      message: "Success",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";
    const { count: total, rows: payment } = await Payment.findAndCountAll({
      offset: offset,
      limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: payment, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};

export const StripeCreateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.user.email;
  const vendor = req.user.Vendor?.uuid;
  try {
    const account = await stripe.accounts.create({
      email,
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
      },
    });

    const _vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: vendor,
      },
    });

    if (_vendor) {
      _vendor.stripeConnectId = account.id;
      await _vendor.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.DOMAIN}/vendor/payments/stripe-connect/refresh/${account.id}`,
      return_url: `${process.env.DOMAIN}/vendor/payments/stripe-connect/success/${account.id}`,
      type: "account_onboarding",
    });

    res.send({ message: "Success", data: { url: accountLink.url } });
  } catch (error) {
    next(error);
  }
};
export const StripeLinkAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accountId } = req.body;
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.DOMAIN}/vendor/payments/stripe-connnect/refresh/${accountId}`,
      return_url: `${process.env.DOMAIN}/vendor/payments/stripe-connnect/success/${accountId}`,
      type: "account_onboarding",
    });

    res.send({ message: "Success", data: { url: accountLink.url } });
  } catch (error) {
    next(error);
  }
};

export const StripeLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = req.user.Vendor;
    console.log(vendor);
    const accountId = vendor?.stripeConnectId!;
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    res.send({ message: "Success", data: { url: loginLink.url } });
  } catch (error) {
    next(error);
  }
};
export const StripeCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart } = req.body;
    const user = req.user.User?.uuid;
    const _user = await User.scope("withId").findOne({
      where: {
        uuid: user,
      },
    });

    const _cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cart,
        UserId: _user?.id,
        status: "CONFIRMED",
      },
    });

    if (!_cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const session = await checkoutStripe(req, res, { cart: _cart });
    if (session.url) {
      _cart.status = "AWAITING_PAYMENT";
      await _cart.save();
    }
    return res.send({
      message: "Success",
      data: {
        url: session.url,
        cart: _cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const StripeWebHook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-expect-error
  const rawBody = await req.text(); // Read the raw body of the request

  const sig = req.get("stripe-signature"); // Retrieve Stripe signature header
  if (!sig) {
    return res.status(400).send("Stripe signature missing");
  }

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET! // Ensure your Stripe webhook secret is set in the environment variables
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        const paymentFailed = event.data.object;

        console.log("Payment failed:", paymentFailed);
        break;
      case "checkout.session.async_payment_succeeded":
        const paymentSucceeded = event.data.object;

        console.log("Payment succeeded:", paymentSucceeded);
        break;
      case "checkout.session.completed":
        const sessionCompleted = event.data.object;
        const orderId = sessionCompleted?.metadata?.orderId;
        if (orderId) {
          const _cart = await Cart.findOne({
            where: {
              uuid: orderId as string,
            },
          });

          if (_cart) {
            _cart.status = "CONFIRMED";
            await _cart.save();
          }
        }
        if (sessionCompleted.payment_intent) {
          stripe.paymentIntents
            .retrieve(sessionCompleted.payment_intent as string)
            .then(async (paymentIntent) => {
              const chargeId = paymentIntent.latest_charge?.toString();
              if (paymentIntent.status === "succeeded") {
                // 1) Get order id from metadata
                const _cart = await Cart.scope("withId").findOne({
                  where: {
                    uuid: orderId,
                  },
                });

                if (_cart?.id) {
                  const _cartItems = await CartItem.findAll({
                    where: {
                      CartId: _cart?.id,
                    },
                    attributes: {
                      include: ["subTotal"],
                    },
                    include: [
                      {
                        model: Vendor,
                        as: "vendor",
                        attributes: ["uuid", "stripeConnectId"],
                      },
                    ],
                  });
                  _cartItems.map(async (item: any) => {
                    let payload: {
                      subTotal: number;
                      vendor: { uuid: string; stripeConnectId: string };
                    } = item;
                    // loop through order vendors and create charge for each vendor
                    const transfer = await stripe.transfers.create({
                      amount: payload.subTotal, // set to whatever the vendor should receive
                      currency: "usd",
                      source_transaction: chargeId,
                      destination: payload.vendor.stripeConnectId, // get from vendor,
                    });
                  });
                }
              }
            });
        }
        console.log("Payment session completed:", sessionCompleted);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Respond to Stripe to acknowledge receipt of the event
    return res.send({ message: "Success", data: { received: true } });
  } catch (error) {
    next(error);
  }
};

export const StripeRetrieveAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendor = req.user.Vendor?.uuid;
    let status = "not_connected";
    const _vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: vendor,
      },
    });
    if (!_vendor?.stripeConnectId) {
      return res.send({ message: "Success", data: { status } });
    }
    const account = await stripe.accounts.retrieve(_vendor?.stripeConnectId);

    const isComplete =
      (account.requirements?.currently_due &&
        account.requirements?.currently_due.length) === 0 &&
      account.requirements?.past_due &&
      account.requirements?.past_due.length === 0 &&
      (account.requirements?.pending_verification &&
        account.requirements?.pending_verification.length) === 0;
    if (isComplete) {
      status = "connected";
    }

    res.send({ message: "Success", data: { status } });
  } catch (error) {
    next(error);
  }
};

export const checkoutStripe = async (
  req: Request,
  res: Response,
  payload?: Record<string, any>
) => {
  const _cartItems: any = await CartItem.findAll({
    where: {
      CartId: payload?.cart.id,
    },
    attributes: ["ProductId", "ProductSkuId", "quantity", "subTotal"],
    include: [
      {
        model: Product,
        as: "product",
        attributes: {
          include: ["title"],
        },
      },
    ],
  });

  if (!_cartItems.length) {
    const err = new BadRequestError("Cart is empty!");
    return res.status(err.status).send({ message: err.message });
  }

  const line_items: any = _cartItems.map((item: any) => {
    console.log(item.dataValues);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.dataValues.title,
        },
        unit_amount: parseInt(item.dataValues.subTotal)*100,
      },
      quantity: parseInt(item.dataValues.quantity),
    };
  });

  let session = await stripe.checkout.sessions.create({
    line_items: line_items,
    payment_intent_data: {
      transfer_group: payload?.cart.uuid,
    },
    mode: "payment",
    success_url: `${process.env.DOMAIN}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      orderId: payload?.cart.uuid,
    },
  });
  let data: any = session ? session : null;
  return data;
};
