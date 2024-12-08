import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../../utils/api-errors";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";
import { CartItem } from "../../models/CartItem";
import { sequelize } from "../../config/db";
import { Shipping } from "../../models/Shipping";
import { CouponCart } from "../../models/CouponCart";
import { Coupons } from "../../models/Coupon";
import { readFile } from "fs/promises";
import path from "path";
import { User } from "../../models/User";
import { Media } from "../../models/Media";
import { SkuVariations } from "../../models/SkuVariation";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { Option } from "../../models/Options";
import { Attribute } from "../../models/Attribute";
import { isValidUUID } from "../../utils/is-valid-uuid";
import { Op, QueryTypes } from "sequelize";
import { Vendor } from "../../models/Vendor";
import { generateOrderId } from "../../utils/generate-order-id";
import { checkoutStripe } from "../payment";

interface CartItemType {
  subTotal?: number;
  quantity?: number;
  ProductId?: number | null;
  CartId?: number | null;
  ProductSkuId?: number | null;
  VendorId: number;
  MediaId?: number | null;
}

// cart item create/update
export const CreateUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // cart item related values
    // of single product we are adding to cart item
    const {
      quantity, // of single product...
      product, // uuid of product
      cart, // uuid of cart
      productSku, // productSku (optional if available)
    } = req.body;

    let subTotal = 0;
    let _productSku = null;

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });

    if (productSku) {
      _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku,
        },
      });
    }

    // if product has variant then it requires FE to send product sku unique id
    if (_product?.hasVariants && !_productSku) {
      return res.status(403).send({
        message: "productSku required",
      });
    }

    let { _cart } = await getOrCreateCart({ uid: cart, user: req.user });

    const CartId = _cart.dataValues.id ? _cart.dataValues.id : _cart.id;

    const cartItemWhere: any = {
      CartId: CartId,
      ProductId: _product?.id,
    };
    if (_productSku) {
      cartItemWhere.ProductSkuId = _productSku?.id;
    }
    let _cartItem = await CartItem.findOne({
      where: cartItemWhere,
    });

    // if cart Item of a cart already exists
    if (_cartItem) {
      _cartItem.quantity = _cartItem.quantity + quantity;
      // calculating subtotal of existing cart item

      if (_product?.hasVariants && _productSku) {
        subTotal = (_productSku?.currentPrice * _cartItem.quantity!) as number;
        if (
          _productSku.quantity &&
          _cartItem.quantity &&
          _productSku.quantity >= _cartItem.quantity
        ) {
          _productSku.quantity = _productSku.quantity - _cartItem.quantity!;
          await _productSku.save();
          await _productSku.reload();
        }
      } else {
        subTotal = ((_product?.currentPrice as number) *
          _cartItem.quantity!) as number;
        if (
          _product &&
          _product.quantity &&
          _cartItem.quantity &&
          _product.quantity >= _cartItem.quantity
        ) {
          _product.quantity = _product.quantity - _cartItem.quantity!;
          await _product.save();
          await _product.reload();
        }
      }

      _cartItem.subTotal = subTotal;

      await _cartItem.save();
      await _cartItem.reload();
    } else {
      // calculating subtotal of new cart item
      if (_product?.hasVariants && _productSku) {
        subTotal = _productSku?.currentPrice * quantity;
      } else {
        subTotal = (_product?.currentPrice as number) * quantity;
      }

      const cartItemPayload: CartItemType = {
        // MediaId: _media?.id,
        CartId: CartId,
        ProductId: _product?.id,
        subTotal,
        quantity,
        VendorId: _product?.VendorId!,
      };
      if (_productSku && _productSku.id) {
        cartItemPayload.ProductSkuId = _productSku.id;
      }
      _cartItem = await CartItem.create(cartItemPayload);
    }

    // find total of all the products to update cart total price.
    // improve THIS PORTION with raw query
    let _cartItems: any = await CartItem.findAll({
      where: {
        CartId: CartId,
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("subTotal")), "total_amount"],
      ],
      raw: true, //to directly get the value
    });

    let totalAmount = _cartItems[0].total_amount;

    if (_cart && totalAmount) {
      _cart.subTotal = totalAmount;
      _cart.totalPrice =
        _cart.subTotal +
        _cart.shippingCost +
        _cart.taxAmount -
        _cart.discountAmount;

      await _cart?.save();
      await _cart?.reload();
    }
    let data = await Cart.scope("withId").findOne({
      where: {
        id: CartId,
      },
      include: [
        {
          model: CartItem,
          as: "cartItems",
          attributes: {
            exclude: ["id", "CartId", "ProductId", "ProductSkuId"],
          },
          include: [
            {
              model: ProductSkus,
              as: "sku",
              attributes: {
                exclude: ["id", "ProductId"],
              },
              include: [
                {
                  model: Media,
                  as: "media",
                  required: false,
                  where: {
                    default: true,
                  },
                  attributes: {
                    exclude: ["id", "mediaableId"],
                  },
                },
                {
                  model: SkuVariations,
                  attributes: {
                    exclude: [
                      "id",
                      "combinationIds",
                      "ProductSkuId",
                      "ProductVariantValueId",
                      "ProductId",
                    ],
                  },
                  include: [
                    {
                      model: ProductVariantValues,
                      attributes: {
                        exclude: ["id", "OptionId", "AttributeId"],
                      },
                      include: [
                        {
                          model: Attribute,
                          attributes: {
                            exclude: ["id"],
                          },
                          as: "attribute",
                          include: [
                            {
                              model: Option,
                              as: "options",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              model: Product,
              as: "product",
              attributes: {
                exclude: [
                  "id",
                  "OptionId",
                  "VendorId",
                  "CategoryId",
                  "specifications",
                  "highlights",
                ],
              },
              include: [
                {
                  model: Media,
                  as: "media",
                  required: false,
                  where: {
                    default: true,
                  },
                  attributes: {
                    exclude: ["id", "mediaableId"],
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    // return the cart and cart items information
    // let data = await CartItem.findAll({
    //   where: {
    //     CartId: CartId,
    //   },
    //   include: [
    //     {
    //       model: Cart,
    //     },
    //     {
    //       model: ProductSkus,
    //     },
    //     {
    //       model: Product,
    //     },
    //     {
    //       model: Media,
    //       where: {
    //         default: true,
    //       },
    //     },
    //   ],
    // });

    res.status(201).send({
      message: "Success",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params; // cart uuid (optional)
    const { _cart, data } = await getOrCreateCart({ uid, user: req.user });
    if (_cart.dataValues.id) {
      delete _cart.dataValues.id;
    }
    const resultData: any = data;
    res.send({
      message: "Success",

      data: resultData?.length ? resultData[0] : resultData,
    });
  } catch (error: any) {
    next(error);
  }
};
// export const OrderGet = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { uid } = req.params; // cart uuid (optional)
//     const { _cart, data } = await getCart({ uid, user: req.user });
//     if (_cart.dataValues.id) {
//       delete _cart.dataValues.id;
//     }
//     const resultData: any = data;
//     res.send({
//       message: "Success",

//       data: resultData?.length ? resultData[0] : resultData,
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };
// export const Create = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { cart } = req.body;
//     let _cart = null;
//     // if cart already exists
//     if (cart) {
//       _cart = await Cart.scope("withId").findOne({
//         where: {
//           uuid: cart,
//         },
//       });
//     }
//     // creating new cart if not exists
//     if (!_cart || !cart) {
//       // initially cart has no products added or in other words cart is not created yet.
//       _cart = await Cart.create({
//         totalPrice: 0,
//         shippingCost: 0,
//         subTotal: 0,
//         taxAmount: 0,
//         discountAmount: 0,
//         status: "IN_CART",
//       });
//       delete _cart.dataValues.UserId;
//       delete _cart.dataValues.id;
//     }

//     res.status(201).send({
//       message: "Success",
//       data: _cart,
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const AddUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params;
    const user = req.user.User?.uuid;
    const _user = await User.scope("withId").findOne({
      where: {
        uuid: user,
      },
    });
    const _cart = await Cart.findOne({
      where: {
        uuid: uid,
      },
    });
    if (_cart) {
      _cart.UserId = _user?.id;
      await _cart.save();
      await _cart.reload();
    }

    res.status(201).send({
      message: "Success",
      data: _cart,
    });
  } catch (error: any) {
    next(error);
  }
};

export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // uid of the cart
    const _cart = await Cart.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    await CartItem.destroy({
      where: {
        CartId: _cart?.id,
      },
    });

    await _cart?.destroy();
    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _cart = await Cart.findAll({
      include: [
        {
          model: CartItem,
        },
        {
          model: User,
        },
      ],
    });

    res.send({
      message: "Success",
      data: _cart,
    });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

export const PlaceOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentMethod } = req.body;
    const user = req.user.User?.uuid;
    const _user = await User.scope("withId").findOne({
      where: {
        uuid: user,
      },
    });
    const _cart = await Cart.scope("withId").findOne({
      where: {
        UserId: _user?.id,
        status: "IN_CART",
      },
    });

    if (!_cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    const _cartItem = await CartItem.findAll({
      where: {
        CartId: _cart.id,
      },
      attributes: ["ProductId", "ProductSkuId", "quantity"],
    });
    if (!_cartItem.length) {
      const err = new BadRequestError("Cart is empty!");
      return res.status(err.status).send({ message: err.message });
    }
    let data:any={
      cart:null,
      url:null
    }
    await sequelize.transaction(async (t) => {
      _cart.status = "PENDING";
      await Promise.all(
        _cartItem.map(async (item) => {
          if (item.ProductId) {
            const _product = await Product.scope("withId").findOne({
              where: {
                id: item.ProductId,
              },
            });

            if (_product && _product.quantity && item.quantity) {
              _product.quantity = _product?.quantity - item.quantity;
              await _product.save();
            }
          } else if (item.ProductSkuId) {
            const _productSku = await ProductSkus.findOne({
              where: {
                id: item.ProductSkuId,
              },
            });

            if (_productSku && _productSku.quantity && item.quantity) {
              _productSku.quantity = _productSku?.quantity - item.quantity;
              await _productSku.save();
            }
          }
        })
      );
      
      if (paymentMethod === "cash_on_delivery") {
        _cart.status = "CONFIRMED";
      } else {
        const session = await checkoutStripe(req, res, { cart: _cart });
        data.url=session.url
        _cart.status = "AWAITING_PAYMENT";
      }
      _cart.paymentMethod = paymentMethod;
      await _cart.save();
      await _cart.reload();
      delete _cart.dataValues.id;
      data.cart=_cart
    });

    res.status(201).send({
      message: "Success",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};

export const OrderList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { uid } = req.params;
    const vendor = req.user.Vendor?.uuid;

    const _vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: vendor,
      },
    });

    const query = `
    SELECT 
    au."avatar",
    u."firstName",
    u."lastName",
    c."uuid" AS "cartUniqueId",
    c."paymentMethod",
    c."status",
    vt."vendorTotal" AS "totalPrice",
    c."createdAt" AS "orderDate",
    array_agg(
        DISTINCT jsonb_build_object(
            'uuid', p."uuid",
            'title', p."title",
            'quantity', ci."quantity",
            'price', ci."subTotal",
            'attributeOptions', (
                        SELECT jsonb_agg(DISTINCT jsonb_build_object(
                            'attribute', a."title",
                            'value', o."value"
                        ))
                        FROM "SkuVariations" sv
                        JOIN "ProductVariantValues" pvv ON sv."ProductVariantValueId" = pvv."id"
                        JOIN "Options" o ON pvv."OptionId" = o."id"
                        JOIN "Attributes" a ON pvv."AttributeId" = a."id"
                        WHERE sv."ProductSkuId" = ps."id"
                    )
        )
    ) AS "items"
FROM "CartItem" AS ci
LEFT JOIN "Vendors" AS v ON v."id" = ci."VendorId"
LEFT JOIN "Cart" AS c ON ci."CartId" = c."id"
JOIN "Users" AS u ON c."UserId" = u."id"
JOIN "Auth" AS au ON au."UserId" = u."id"
LEFT JOIN "Products" AS p ON ci."ProductId" = p."id"
LEFT JOIN "ProductSkus" as ps ON ci."ProductSkuId" = ps."id"
LEFT JOIN "SkuVariations" AS sv ON sv."ProductId" = p."id"
LEFT JOIN "ProductVariantValues" AS pvv ON sv."ProductVariantValueId" = pvv."id"
LEFT JOIN "Options" AS o ON pvv."OptionId" = o."id"
LEFT JOIN "Attributes" AS a ON pvv."AttributeId" = a."id"
LEFT JOIN (
    SELECT 
        ci_sub."CartId",
        ci_sub."VendorId",
        SUM(ci_sub."subTotal") AS "vendorTotal"
    FROM "CartItem" AS ci_sub
    GROUP BY ci_sub."CartId", ci_sub."VendorId"
) AS vt ON vt."CartId" = c."id" AND vt."VendorId" = v."id"
WHERE c."status" != 'IN_CART' AND v.id=${_vendor?.id}
GROUP BY 
    c."id", 
    v."uuid", 
    v."name", 
    c."paymentMethod", 
    c."status", 
    vt."vendorTotal",
    au."avatar",
    u."firstName",
    u."lastName"
    `;

    const [data] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });

    res.send({ message: "Success", data });
  } catch (error: any) {
    next(error);
  }
};
export const UpdateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // awaiting_shipment, shipped, delivered
    const { uid } = req.params;
    const { status } = req.body;
    const _cart = await Cart.scope("withId").findOne({
      where: {
        uuid: uid,
        status: {
          [Op.not]: [
            "IN_CART",
            "PENDING",
            "AWAITING_PAYMENT",
            "CANCELLED",
            "REFUNDED",
          ],
        },
      },
    });
    if (!_cart) {
      const err = new NotFoundError("Order not found");
      return res.status(err.status).send({ message: err.message });
    }

    _cart.status = status;
    await _cart.save();

    res.send({ message: "Success" });
  } catch (error: any) {
    next(error);
  }
};

const getOrCreateCart = async (payload: { uid?: string; user?: any }) => {
  const uuid = payload.uid === "undefined" ? undefined : payload.uid;
  let where: any = {
    uuid,
    status: "IN_CART",
  };
  if (uuid && !isValidUUID(uuid)) {
    delete where["uuid"];
  }
  let _cart = null;
  let _user = null;

  if (payload.user) {
    const user = payload.user.User;
    if (user && user?.uuid) {
      _user = await User.scope("withId").findOne({
        where: {
          uuid: user?.uuid,
        },
      });
      delete where.uuid;
      where["UserId"] = _user?.id;
    }

    // if user logged in find cart through UserId
    _cart = await Cart.scope("withId").findOne({
      where,
      order: [["createdAt", "DESC"]],
    });
    // If cart with that user id is not found , assign user to that cart
    if (!_cart && _user?.id) {
      if (uuid) {
        _cart = await Cart.scope("withId").findOne({
          where: {
            uuid: uuid,
            status: "IN_CART",
          },
          order: [["createdAt", "DESC"]],
        });
      }
      if (_cart && !_cart.UserId) {
        _cart.UserId = _user.id;
        await _cart.save();
        await _cart.reload();
      }
    }
  } else {
    if (uuid) {
      _cart = await Cart.scope("withId").findOne({
        where,
      });
    }
  }
  const query = `
  SELECT 
    c."uuid",
    c."subTotal",
    c."taxAmount",
    c."shippingCost",
    c."totalPrice",
    c."discountAmount",
    c."status",
    c."createdAt",
    jsonb_build_object('firstName',u."firstName",'lastName',u."lastName",'phone',u."phone") as "user",
    array_agg(
        DISTINCT jsonb_build_object(
            'uuid', p."uuid",
            'title', p."title",
            'status', p."status",
            'baseSku', p."sku",
            'currentPrice', p."currentPrice",
            'oldPrice', p."oldPrice",
            'sold', p."sold",
            'createdAt', p."createdAt",
            'cartItem',jsonb_build_object(
                'uuid', ci."uuid",
                'quantity', ci."quantity",
                'subTotal', ci."subTotal"
            ),
            'media', CASE 
                WHEN EXISTS (
                    SELECT 1 FROM "ProductSkus" ps WHERE ci."ProductSkuId" = ps."id"
                ) THEN NULL
                ELSE (
                    SELECT jsonb_agg(DISTINCT jsonb_build_object(
                        'url', pm."url",
                        'width', pm."width",
                        'height', pm."height",
                        'size', pm."size",
                        'mime', pm."mime",
                        'name', pm."name"
                    ))
                    FROM "Media" pm
                    WHERE pm."mediaableId" = p."id" 
                    AND pm."mediaableType" = 'Product' 
                    AND pm."default" = 'true'
                )
            END,
            'sku',(
               SELECT  DISTINCT jsonb_build_object(
                     'uuid', ps."uuid",
                     'sku', ps."sku",
                     'oldPrice', ps."oldPrice",
                     'currentPrice', ps."currentPrice",
                     'media', (
                        SELECT jsonb_agg(DISTINCT jsonb_build_object(
                           'url', psm."url",
                           'width', psm."width",
                           'height', psm."height",
                           'size', psm."size",
                           'mime', psm."mime",
                           'name', psm."name"
                        ))
                        FROM "Media" psm
                        WHERE psm."mediaableId" = ps."id" 
                        AND psm."mediaableType" = 'ProductSku' AND psm."default"='true'
                     ),
                     'attributeOptions', (
                        SELECT jsonb_agg(DISTINCT jsonb_build_object(
                            'attribute', a."title",
                            'value', o."value"
                        ))
                        FROM "SkuVariations" sv
                        JOIN "ProductVariantValues" pvv ON sv."ProductVariantValueId" = pvv."id"
                        JOIN "Options" o ON pvv."OptionId" = o."id"
                        JOIN "Attributes" a ON pvv."AttributeId" = a."id"
                        WHERE sv."ProductSkuId" = ps."id"
                    )
               )
             From "ProductSkus" ps WHERE ci."ProductSkuId"=ps."id"
         )
        )
    ) AS "products"
FROM public."CartItem" as ci
JOIN "Cart" as c ON ci."CartId" = c."id"
LEFT JOIN "Users" as u ON c."UserId" = u."id"
JOIN "Products" as p ON ci."ProductId" = p."id"
LEFT JOIN "ProductSkus" as psk ON ci."ProductSkuId" = psk."id"
LEFT JOIN "SkuVariations" as sv ON sv."ProductSkuId" = psk."id"
LEFT JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
LEFT JOIN "Options" as o ON pvv."OptionId" = o."id"
LEFT JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
WHERE c."id"=${_cart?.id}
GROUP BY
    u."firstName",
    u."lastName",
    u."phone",
    c."uuid", 
    c."subTotal",
    c."taxAmount",
    c."shippingCost",
    c."totalPrice", 
    c."discountAmount", 
    c."status", 
    c."createdAt";
  `;
  let data = null;
  const has_cart_access =
    !_cart?.UserId || _user?.id === _cart.UserId ? true : false;
  if (_cart && has_cart_access && _cart.status === "IN_CART") {
    const [cartData] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });
    data = cartData;
  } else {
    const cartBody: any = {
      discountAmount: 0,
      totalPrice: 0,
      shippingCost: 0,
      subTotal: 0,
      taxAmount: 0,
      status: "IN_CART",
      trackingId: generateOrderId(),
    };
    if (payload.user && _user && _user?.id) {
      cartBody["UserId"] = _user.id;
    }
    _cart = await Cart.create(cartBody);
    data = _cart;
  }

  return {
    _cart,
    data,
  };
};
