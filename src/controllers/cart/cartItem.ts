import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";
import { CartItem } from "../../models/CartItem";
import { sequelize } from "../../config/db";
import { Media } from "../../models/Media";
import { SkuVariations } from "../../models/SkuVariation";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { Option } from "../../models/Options";
import { Attribute } from "../../models/Attribute";

interface CartItemType {
  subTotal?: number;
  quantity?: number;
  ProductId?: number | null;
  CartId?: number | null;
  ProductSkuId?: number | null;
  MediaId?: number | null;
}
// export const CreateUpdate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       // cart item related values
//       // of single product we are adding to cart item
//       quantity, // of single product...
//       product,
//       cart,
//       productSku, // if product sku unique id has different variants.
//       cartItem,
//     } = req.body;

//     let subTotal = 0;
//     let _productSku = null;
//     const _product = await Product.scope("withId").findOne({
//       where: {
//         uuid: product,
//       },
//     });

//     if (productSku) {
//       _productSku = await ProductSkus.findOne({
//         where: {
//           uuid: productSku,
//         },
//       });
//     }

//     // if product has variant then it requires FE to send product sku unique id
//     if (_product?.hasVariants && !_productSku) {
//       return res.status(403).send({
//         message: "productSkuUniqueId required",
//       });
//     }

//     // calculating subtotal
//     if (_product?.hasVariants && _productSku) {
//       subTotal = _productSku?.currentPrice * quantity;
//     } else {
//       subTotal = (_product?.currentPrice as number) * quantity;
//     }

//     // Assuming cart is already created
//     let _cart = await Cart.scope("withId").findOne({
//       where: {
//         uuid: cart,
//       },
//     });

//     if (!_cart) {
//       return res.status(403).send({
//         message: `cart with id ${cart} not found`,
//       });
//     }

//     let _cartItem = null;

//     // if cart Item of a cart already exists
//     if (cartItem) {
//       _cartItem = await CartItem.findOne({
//         where: {
//           uuid: cartItem,
//         },
//       });
//       if (!_cartItem) {
//         return res.status(403).send({
//           message: "invalid cart item id",
//         });
//       }
//     } else {
//       const cartItemPayload: CartItemType = {
//         CartId: cart?.id,
//         ProductId: product?.id,
//         subTotal,
//         quantity,
//       };
//       if (productSku && productSku.id) {
//         cartItemPayload.ProductSkuId = productSku.id;
//       }
//       _cartItem = await CartItem.create(cartItemPayload);
//     }
//     // if cart item already exists , update values:
//     cartItem.subTotal = subTotal;
//     cartItem.quantity = quantity;
//     await cartItem.save();
//     await cartItem.reload();

//     // find total of all the products to update cart total price.
//     // IMPORT THIS PORTION with raw query
//     let _cartItems: any = await CartItem.findAll({
//       where: {
//         CartId: cart?.id,
//       },
//       attributes: [
//         [sequelize.fn("sum", sequelize.col("totalAmount")), "total_amount"],
//       ],
//       raw: true, //to directly get the value
//     });

//     let totalAmount = _cartItems[0].total_amount;

//     if (_cart && totalAmount) {
//       _cart.subTotal = totalAmount;
//       _cart.totalPrice = (_cart.subTotal + _cart.shippingCost + _cart.taxAmount) - _cart.discountAmount;

//       await _cart?.save();
//       await _cart?.reload();
//     }

//     // return the cart and cart items information
//     let data = await CartItem.findAll({
//       where: {
//         CartId: cart.id,
//       },
//       include: [
//         {
//           model: Cart,
//         },
//         {
//           model: ProductSkus,
//         },
//         {
//           model: Product,
//         },
//         {
//           model: Media,
//           where: {
//             default: true,
//           },
//         },
//       ],
//     });

//     res.status(201).send({
//       message: "Success",
//       data,
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // uid of the cart item

    const _cartItem = await CartItem.findOne({
      where: {
        uuid: uid,
      },
    });
    const CartId = _cartItem?.CartId;
    await _cartItem?.destroy();

    let _cartItems: any = await CartItem.findAll({
      where: {
        CartId: CartId,
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("subTotal")), "total_amount"],
      ],
      raw: true, //to directly get the value
    });

    let _cart = null;
    _cart = await Cart.scope("withId").findOne({
      where: {
        id: CartId as number,
      },
    });
    if (!_cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    if (_cartItems) {
      if (
        _cart.totalPrice &&
        _cart.totalPrice > 0 &&
        _cartItems[0].total_amount
      ) {
        _cart.subTotal = _cartItems[0].total_amount;
      }
    } else {
      _cart.subTotal = 0;
      _cart.shippingCost = 0;
      _cart.taxAmount = 0;
      
    }
    _cart.totalPrice=(_cart.subTotal + _cart.shippingCost + _cart.taxAmount) - _cart.discountAmount;
    await _cart.save();
    await _cart.reload();
    res.send({
      message: "Success",
    });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  const { uid } = req.params;
  try {
    const _cart = await Cart.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });
    const _cartItems = await CartItem.findAll({
      where: {
        CartId: _cart?.id,
      },
      include: [
        {
          model: ProductSkus,
          include: [
            {
              model: SkuVariations,
              include: [
                {
                  model: ProductVariantValues,
                  include: [
                    {
                      model: Attribute,
                      include: [
                        {
                          model: Option,
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
          attributes: {
            exclude: ["specifications", "highlights"],
          },
        },
        {
          model: Media,
          where: {
            default: true,
          },
        },
      ],
    });

    delete _cart?.dataValues.id;

    res.send({
      message: "Success",
      data: {
        _cart,
        _cartItems,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
