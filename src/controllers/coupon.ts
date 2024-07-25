import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";

import { Cart } from "../models/Cart";

import { getValidUpdates } from "../utils/validate-updates";

import { Coupons } from "../models/Coupon";
import { Product } from "../models/Product";
import { CouponCart } from "../models/CouponCart";
import { where } from "sequelize";

// Admin will create coupon
export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      code,
      discountAmount,
      discountType, // fixed or percentage
      expirationDate, // date at which coupon will expire
      usageLimit, // for example this coupon can be used 3 times total,
      productUniqueId, // product on which coupon will be applied
    } = req.body;

    const product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId,
      },
    });

    if (!product) {
      return res.status(403).send({ message: "Product not found" });
    }

    const coupon = await Coupons.create({
      code,
      discountAmount,
      discountType,
      expirationDate,
      usageLimit,
      timesUsed: 0,
    });

    delete coupon.dataValues.id;
    res.status(201).send({
      message: "Success",
      data: coupon,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = [
      "code",
      "discountAmount",
      "discountType",
      "expirationDate",
      "usageLimit",
    ];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    const result = await Coupons.update(
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
    res.status(500).send({ message: error });
  }
};
export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params;

    const result = await Coupons.destroy({
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

    const data = await Coupons.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    res.send({
      message: "Success",
      data,
    });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

export const Apply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, cartUniqueId } = req.body;

    const coupon = await Coupons.scope("withId").findOne({
      where: {
        code,
      },
    });

    const cart = await Cart.scope("withId").findOne({
      where: {
        uuid: cartUniqueId,
      },
    });

    if (!cart || !coupon) {
      return res.status(404).send({ message: "Invalid Code or bad request" });
    }

    let couponCart = await CouponCart.findOne({
      where: {
        CartId: cart.id as number,
        CouponId: coupon.id as number,
      },
    });
    if (couponCart) {
      return res
        .status(403)
        .send({ message: `Coupon already applied for cart id ${cart.uuid}` });
    }

    let discountAmount = coupon?.discountAmount;
    let discountType: "fixed" | "percentage" = coupon?.discountType as
      | "fixed"
      | "percentage"; // 'fixed' || 'percentage'

    const currentDate = new Date().getTime();
    const expirationDate = new Date(coupon?.expirationDate as string).getTime();

    if (currentDate > expirationDate || coupon.timesUsed >= coupon.usageLimit) {
      return res.status(403).send({
        message: "Coupon has expired",
      });
    } else {
      if (cart && cart.totalPrice) {
        if (discountType === "fixed") {
          cart.totalPrice = cart.totalPrice - discountAmount;
        } else if (discountType === "percentage") {
          let discountAmountInPercentage =
            cart.totalPrice * (discountAmount / 100);
          cart.totalPrice = cart.totalPrice - discountAmountInPercentage;
        }
      }

      coupon.timesUsed = coupon.timesUsed + 1;

      await coupon.save();
      await cart.save();
    }

    couponCart = await CouponCart.create({
      CartId: cart.id as number,
      CouponId: coupon.id as number,
    });

    res.send({
      message: "Success",
      data: {
        coupon,
        cart,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
