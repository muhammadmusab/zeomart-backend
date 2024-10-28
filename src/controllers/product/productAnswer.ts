import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { Product } from "../../models/Product";
import { ProductQuestion } from "../../models/ProductQuestion";
import { ProductAnswer } from "../../models/ProductAnswer";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      question,
      product,
      answer,
    }: { question: string; product: string; answer: string } = req.body;

    const _product: any = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });

    const _productAnswer = await ProductAnswer.create({
      ProductId: _product?.id,
      answer,
    });
    const _question = await ProductQuestion.findOne({
      where: {
        uuid: question,
      },
    });
    if (_question) {
      _question.dataValues.AnswerId = _productAnswer.id;
      await _question.save();
    }

    delete _productAnswer.dataValues.id;
    delete _productAnswer.dataValues.ProductId;

    res.status(201).send({
      message: "Success",
      data: _productAnswer,
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
    const { answer }: { answer: string } = req.body;
    const { uid } = req.params;

    const _productAnswer = await ProductAnswer.findOne({
      where: {
        uuid: uid,
      },
    });

    if (!_productAnswer) {
      return res.status(404).send({ message: "Data not found" });
    }

    _productAnswer.answer = answer;
    await _productAnswer.save();
    await _productAnswer.reload();

    res.send({ message: "Success", data: _productAnswer });
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

    await ProductAnswer.destroy({
      where: {
        uuid: uid,
      },
    });
    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;

  return { data: instance };
};
