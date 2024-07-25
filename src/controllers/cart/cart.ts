import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { ProductTypes } from "../../models/ProductType";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";
import { CartItem } from "../../models/CartItem";
import { sequelize } from "../../config/db";
import { ProductImage } from "../../models/ProductImage";
import { Shipping } from "../../models/Shipping";
import { CouponCart } from "../../models/CouponCart";
import { Coupons } from "../../models/Coupon";
import { readFile } from "fs/promises";
import path from "path";
interface CartItemType {
  subTotal?: number;
  quantity?: number;
  ProductId?: number | null;
  CartId?: number | null;
  ProductSkuId?: number | null;
  ProductImageId?: number | null;
}
export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      cartUniqueId, // it is optional ( if cart is not created yet then it will be null or undefined )
    } = req.body;

    let cart = null;
    // if cart already exists
    if (cartUniqueId) {
      cart = await Cart.scope("withId").findOne({
        where: {
          uuid: cartUniqueId,
        },
      });
      if (cart) {
        return res.status(403).send({
          message: `Cart already exists`,
        });
      }
    }
    // creating new cart if not exists
    if (!cart || !cartUniqueId) {
      // initially cart has no products added or in other words cart is not created yet.
      cart = await Cart.create({
        totalPrice: 0,
        status: "PENDING",
      });
    }

    res.status(201).send({
      message: "Success",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).send({ message: error });
  }
};

export const CreateUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      // cart item related values
      // of single product we are adding to cart item
      quantity, // of single product...
      productUniqueId,
      cartUniqueId, // it is optional ( if cart is not created yet then it will be null or undefined )
      productSkuUniqueId, // if product sku unique id has different variants.
      cartItemUniqueId,
      productImageUniqueId,
    } = req.body;

    let subTotal = 0;

    const product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId,
      },
    });
    let productSku = null;
    if (productSkuUniqueId) {
      productSku = await ProductSkus.scope("withId").findOne({
        where: {
          uuid: productSkuUniqueId,
        },
      });
    }

    // if product has variant then it requires FE to send product sku unique id
    if (product?.multipart && !productSkuUniqueId) {
      return res.status(403).send({
        message: "productSkuUniqueId required",
      });
    }

    // calculating subtotal
    if (product?.multipart && productSku) {
      subTotal = productSku?.currentPrice * quantity;
    } else {
      subTotal = (product?.basePrice as number) * quantity;
    }

    let cart = null;
    // if cart already exists
    if (cartUniqueId) {
      cart = await Cart.scope("withId").findOne({
        where: {
          uuid: cartUniqueId,
        },
      });
      if (!cart) {
        return res.status(403).send({
          message: `cart with id ${cartUniqueId} not found`,
        });
      }
    }
    // creating new cart if not exists
    if (!cart || !cartUniqueId) {
      // initially cart has no products added or in other words cart is not created yet.
      cart = await Cart.create({
        totalPrice: 0,
        status: "PENDING",
      });
    }
    let CartId = cart.id;
    let cartItem = null;

    // if cart Item of a cart already exists
    if (cartItemUniqueId) {
      cartItem = await CartItem.scope("withId").findOne({
        where: {
          uuid: cartItemUniqueId,
        },
      });
      if (!cartItem) {
        return res.status(403).send({
          message: "invalid cart item id",
        });
      }
    } else {
      const productImage = await ProductImage.scope("withId").findOne({
        where: {
          uuid: productImageUniqueId,
        },
      });

      const cartItemPayload: CartItemType = {
        ProductImageId: productImage?.id,
        CartId,
        ProductId: product?.id,
        subTotal,
        quantity,
      };

      if (productSku && productSku.id) {
        cartItemPayload.ProductSkuId = productSku.id;
      }
      cartItem = await CartItem.create(cartItemPayload);
    }
    // if cart item already exists , update values:
    cartItem.subTotal = subTotal;
    cartItem.quantity = quantity;
    await cartItem.save();
    await cartItem.reload();

    // find total of all the products to update cart total price.
    let cartItems: any = await CartItem.findAll({
      where: {
        CartId,
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("subTotal")), "total_amount"],
      ],
      raw: true, //to directly get the value
    });
    let totalAmount = cartItems[0].total_amount;

    cart.totalPrice = totalAmount;

    await cart.save();
    await cart.reload();

    // return the cart and cart items information
    let cartItemData = await CartItem.findAll({
      where: {
        CartId,
      },
      include: [
        {
          model: ProductSkus,
        },
        {
          model: Product,
          attributes: {
            exclude: ["id", "specifications", "highlights"],
          },
        },
        {
          model: ProductImage,
        },
      ],
    });

    let cartData = await Cart.findOne({
      where: {
        id: CartId,
      },
    });

    res.status(201).send({
      message: "Success",
      data: {
        cart: cartData,
        cartItem: cartItemData,
      },
    });
  } catch (error: any) {
    res.status(500).send({ message: error });
  }
};

export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // uid of the cart

    const result = await Cart.destroy({
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
    res.status(500).send({ message: error });
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params; // uuid of the product variant NOT the variant values

    const cartData = await Cart.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    if (!cartData) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const cartItemData = await CartItem.findAll({
      where: {
        CartId: cartData.id,
      },
      include: [
        {
          model: ProductSkus,
        },
        {
          model: Product,
          attributes: {
            exclude: ["specifications", "highlights"],
          },
        },
        {
          model: ProductImage,
        },
      ],
    });

    delete cartData.dataValues.id;

    res.send({
      message: "Success",
      data: { cart: cartData, cartItem: cartItemData },
    });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartData = await Cart.findAll({
      include: [
        {
          model: CartItem,
        },
      ],
    });

    res.send({
      message: "Success",
      data: cartData,
    });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

export const CalculateTotal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cartUniqueId, country } = req.body;
    let shippingCost = 0;

    const cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cartUniqueId,
      },
    });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    // find total of all the products to update cart total price.
    let cartItems: any = await CartItem.findAll({
      where: {
        CartId: cart?.id,
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("subTotal")), "total_amount"],
      ],
      raw: true, //to directly get the value
    });

    // total price of cart without coupon,tax or shipping estimation
    let totalPrice = parseFloat(cartItems[0].total_amount);

    // calculating tax
    let selectedRegion = JSON.parse(
      await readFile(
        path.resolve(__dirname, "../../assets/region_countries.json"),
        "utf8"
      )
    ).filter(
      (item: any) =>
        item.countryName.toLocaleLowerCase().trim() ===
        country.toLocaleLowerCase().trim()
    )[0].countryShortCode;

    let taxRates = JSON.parse(
      await readFile(
        path.resolve(__dirname, "../../assets/sales_tax_rates.json"),
        "utf8"
      )
    );

    //calculate tax

    let taxRate = taxRates[selectedRegion].rate;

    let tax_amount = totalPrice * parseFloat(taxRate);
    totalPrice = totalPrice + tax_amount;

    let shipping = await Shipping.scope("withId").findOne({
      where: {
        CartId: cart.id,
      },
    });

    // lets suppose we set zero shippingCost for totalPrice greater than 500

    if (totalPrice && totalPrice <= 500) {
      shippingCost = 10;
    }
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 3);

    let EstimatedDeliveryTime = `${futureDate}`;

    if (shipping) {
      shipping.cost = shippingCost;
      // shipping.estimatedDeliveryTime = EstimatedDeliveryTime;

      await shipping.save();
      await shipping.reload();
    } else {
      shipping = await Shipping.create({
        cost: shippingCost,
        estimatedDeliveryTime: EstimatedDeliveryTime,
        CartId: cart.id,
      });
    }
    delete shipping.dataValues.CartId;
    delete shipping.dataValues.id;

    // calculate add shipping cost in total amount of cart
    totalPrice = totalPrice + shippingCost;


    // check if coupon is applied to this total amount then calculate coupon amount as well.
    let couponCart = await CouponCart.scope("withId").findOne({
      where: {
        CartId: cart.id as number,
      },
    });
    let coupon = null;

    if (couponCart) {
      coupon = await Coupons.scope("withId").findOne({
        where: {
          id: couponCart?.CouponId,
        },
      });

      if (coupon) {
        let discountAmount = coupon?.discountAmount;
        let discountType: "fixed" | "percentage" = coupon?.discountType as
          | "fixed"
          | "percentage"; // 'fixed' || 'percentage'

        const currentDate = new Date().getTime();
        const expirationDate = new Date(
          coupon?.expirationDate as string
        ).getTime();

        if (
          currentDate < expirationDate &&
          coupon.timesUsed < coupon.usageLimit &&
          cart
        ) {
          if (discountType === "fixed") {
            totalPrice = totalPrice - discountAmount;
          } else if (discountType === "percentage") {
            let discountAmountInPercentage =
              totalPrice * (discountAmount / 100);
            totalPrice = totalPrice - discountAmountInPercentage;
          }
        }
      }
    }
   

    cart.totalPrice = totalPrice;
    await cart.save();

    delete shipping.dataValues.id;
    delete cart.dataValues.id;
    if (coupon) {
      delete coupon.dataValues.id;
    }

    res.send({
      message: "Success",
      data: {
        shipping,
        cart,
        coupon,
      },
    });
  } catch (error: any) {
    res.status(500).send({ message: error });
  }
};

export const UpdateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cartUniqueId, status } = req.body;

    const cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cartUniqueId,
      },
    });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    cart.status = status;

    await cart.save();
    await cart.reload();
    delete cart.dataValues.id;
    res.status(201).send({
      message: "Success",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).send({ message: error });
  }
};
