import { Request, Response, NextFunction } from "express";
// import { BadRequestError } from "../utils/api-errors";
import { Cart } from "../models/Cart";
import { Shipping } from "../models/Shipping";
// import { getValidUpdates } from "../utils/validate-updates";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cartUniqueId } = req.body;
    let cost = 0;

    const cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cartUniqueId,
      },
    });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    let shipping = await Shipping.scope("withId").findOne({
      where: {
        CartId: cart.id,
      },
    });

    // calculate shipping cost based on total amount in cart
    const totalAmount = cart.totalPrice
      ? cart.totalPrice
      : (cart.totalPrice as number);

    // lets suppose we set zero shipping cost for totalAmount greater than 500

    if (totalAmount <= 500) {
      cost = 10;
    }
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + 3);

    let EstimatedDeliveryTime = `${futureDate}`;

    if (shipping) {
      shipping.cost = cost;
      shipping.estimatedDeliveryTime = EstimatedDeliveryTime;

      await shipping.save();
      await shipping.reload();
    } else {
      shipping = await Shipping.create({
        cost,
        estimatedDeliveryTime: EstimatedDeliveryTime,
        CartId: cart.id,
      });
    }
    delete shipping.dataValues.CartId;
    delete shipping.dataValues.id;
    res.status(201).send({
      message: "Success",
      data: shipping,
    });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;

    const data = await Shipping.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    if (!data) {
      return res.send({
        message: "Data not found",
      });
    }

    delete data.dataValues.CartId;
    delete data.dataValues.id;

    res.send({
      message: "Success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
