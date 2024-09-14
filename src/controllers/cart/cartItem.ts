import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { ProductTypes } from "../../models/ProductType";
import { Cart } from "../../models/Cart";
import { Product } from "../../models/Product";
import { ProductSkus } from "../../models/ProductSku";
import { CartItem } from "../../models/CartItem";
import { sequelize } from "../../config/db";
import { ProductImage } from "../../models/ProductImage";

interface CartItemType {
  subTotal?: number;
  quantity?: number;
  ProductId?: number | null;
  CartId?: number | null;
  ProductSkuId?: number | null;
  ProductImageId?: number | null;
}
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

    const productSku = await ProductSkus.scope("withId").findOne({
      where: {
        uuid: productSkuUniqueId,
      },
    });

    // if product has variant then it requires FE to send product sku unique id
    if (product?.hasVariants && !productSkuUniqueId) {
      return res.status(403).send({
        message: "productSkuUniqueId required",
      });
    }

    // calculating subtotal
    if (product?.hasVariants && productSku) {
      subTotal = productSku?.currentPrice * quantity;
    } else {
      subTotal = (product?.currentPrice as number) * quantity;
    }

    // Assuming cart is already created
    let cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cartUniqueId,
      },
    });

    if (!cart) {
      return res.status(403).send({
        message: `cart with id ${cartUniqueId} not found`,
      });
    }

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
        CartId: cart?.id,
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
        CartId: cart?.id,
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("totalAmount")), "total_amount"],
      ],
      raw: true, //to directly get the value
    });

    let totalAmount = cartItems[0].total_amount;

    cart.totalPrice = totalAmount;
    await cart?.save();
    await cart?.reload();

    // return the cart and cart items information
    let data = await CartItem.findAll({
      where: {
        CartId: cart.id,
      },
      include: [
        {
          model: Cart,
        },
        {
          model: ProductSkus,
        },
        {
          model: Product,
        },
        {
          model: ProductImage,
        },
      ],
    });

    res.status(201).send({
      message: "Success",
      data,
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
    console.log('running')
    const { uid } = req.params; // uid of the cart item

    const cartItem = await CartItem.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });
    const cartId = cartItem?.CartId;
    await cartItem?.destroy();
    
    let cartItems: any = await CartItem.findAll({
      where: {
        CartId: cartId,
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("subTotal")), "total_amount"],
      ],
      raw: true, //to directly get the value
    });

    let cart = null;
   
    if (cartItems) {
      cart = await Cart.scope('withId').findOne({
        where: {
          id: cartId as number,
        },
      });
      if (!cart) {
        return res.status(404).send({ message: "Cart not found" });
      }

      cart.totalPrice = cartItems[0].total_amount;
      await cart.save();
    }

    let cartItemData = await CartItem.findAll({
      where: {
        CartId: cartId,
      },
      include: [
        {
          model: ProductSkus,
        },
        {
          model: Product,
        },
        {
          model: ProductImage,
        },
      ],
    });

    res.send({
      message: "Success",
      data: {
        cart,
        cartItems: cartItemData,
      },
    });
  } catch (error:any) {
    console.log(error.message)
    next(error);
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  const { uid } = req.params;
  try {
    const cart=await Cart.scope('withId').findOne({
      where:{
        uuid:uid
      }
    })
    const cartItems = await CartItem.findAll({
      where: {
        CartId: cart?.id,
      },
      include: [
        {
          model: ProductSkus,
        },
        {
          model: Product,
        },
        {
          model: ProductImage,
        },
      ],
    });

    delete cart?.dataValues.id

    res.send({ message: "Success", data:{
      cart,
      cartItems
    } });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
