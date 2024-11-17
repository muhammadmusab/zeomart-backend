import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { Product } from "../../models/Product";
import { ProductQuestion } from "../../models/ProductQuestion";
import { Op } from "sequelize";
import { User } from "../../models/User";
import { isValidUUID } from "../../utils/is-valid-uuid";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user.User?.uuid;
    const vendor = req.user.Vendor?.uuid;
    const _user = await User.findOne({ where: { uuid: user } });
    const {
      question,
      product,
      answer,
    }: { question: string; answer?: string; product: string } = req.body;

    const { uid } = req.params;
    const _product: any = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });
    if (user && _product?.id && _user && question) {
      const _productQuestion = await ProductQuestion.create({
        ProductId: _product?.id,
        question,
        UserId: _user?.id,
      });
      delete _productQuestion.dataValues.id;
      delete _productQuestion.dataValues.ProductId;
      res.status(201).send({
        message: "Success",
        data: _productQuestion,
      });
    } else if (answer && vendor && uid && isValidUUID(uid)) {
      //answer
      const _question = await ProductQuestion.findOne({
        where: {
          uuid: uid,
        },
      });
      if (_question) {
        _question.answer = answer;
        await _question?.save();
      }
      await _question?.reload();
      res.send({ message: "Success", data: _question });
    }
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
    const { answer }: { answer: string } = req.body;
    const { uid } = req.params;

    const _productQuestion = await ProductQuestion.findOne({
      where: {
        uuid: uid,
      },
    });

    if (!_productQuestion) {
      return res.status(404).send({ message: "Data not found" });
    }

    _productQuestion.answer = answer;
    await _productQuestion.save();
    await _productQuestion.reload();

    res.send({ message: "Success", data: _productQuestion });
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
    const { uid } = req.params;

    await ProductQuestion.destroy({
      where: {
        uuid: uid,
      },
    });
    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;

    const _productQuestion = await ProductQuestion.findOne({
      where: {
        uuid: uid,
      },
      attributes: {
        exclude: ["id", "ProductId", "UserId"],
      },
      include: [
        {
          model: User,
          as: "askedby",
          attributes: {
            exclude: ["id"],
          },
        },
      ],
    });

    if (!_productQuestion) {
      return res.status(404).send({ message: "Data not found" });
    }
    res.send({ message: "Success", data: _productQuestion });
  } catch (error) {
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    const { count, rows } = await ProductQuestion.findAndCountAll({
      where: {
        ProductId: _product?.id,
      },
      attributes: {
        exclude: ["id", "ProductId", "UserId"],
      },
      include: [
        {
          model: User,
          as: "askedby",
        },
        {
          model: Product,
          as: "product",
        },
      ],
    });
    console.log(JSON.stringify(rows));
    res.send({ message: "Success", data: rows, total: count });
  } catch (error: any) {
    next(error);
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;

  return { data: instance };
};
