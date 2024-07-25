import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { Payment } from "../models/Payment";
import { Cart } from "../models/Cart";
import { getValidUpdates } from "../utils/validate-updates";
import { getPaginated } from "../utils/paginate";

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
    res.status(500).send({ message: error });
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
    res.status(500).send({ message: error });
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
    res.status(500).send({ message: error });
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
    res.status(500).send({ message: error });
  }
};
