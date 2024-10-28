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
    const { question, product }: { question: string; product: string } =
      req.body;
    const _product: any = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });
    const _productQuestion = await ProductQuestion.create({
      ProductId: _product?.id,
      question,
    });

    delete _productQuestion.dataValues.AnswerId;
    delete _productQuestion.dataValues.id;
    delete _productQuestion.dataValues.ProductId;
    res.status(201).send({
      message: "Success",
      data: _productQuestion,
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
    const { question }: { question: string } = req.body;
    const { uid } = req.params;

    const _productQuestion = await ProductQuestion.findOne({
      where: {
        uuid: uid,
      },
    });

    if (!_productQuestion) {
      return res.status(404).send({ message: "Data not found" });
    }

    _productQuestion.question = question;
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

    const _productQuestion = await ProductQuestion.findOne({
      where: {
        uuid: uid,
      },
    });
    if (_productQuestion) {
      await ProductAnswer.destroy({
        where: {
          ProductId: _productQuestion.ProductId,
        },
      });
    }
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
      attributes:{
        exclude:['id','ProductId','AnswerId']
      },
      include: [
        {
          model: ProductAnswer,
          attributes:{
            exclude:['id','ProductId']
          },
        },
      ],
    });

    if (!_productQuestion) {
     return  res.status(404).send({ message: "Data not found" });
    }
    res.send({message:"Success",data:_productQuestion})
  } catch (error) {
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {uid}=req.params
    const _product=await Product.scope('withId').findOne({
        where:{
            uuid:uid
        }
    })
    const _productQuestion = await ProductQuestion.findAll({
        where: {
          ProductId: _product?.id,
        },
        attributes:{
          exclude:['id','ProductId','AnswerId']
        },
        include: [
          {
            model: ProductAnswer,
            attributes:{
              exclude:['id','ProductId']
            },
          },
        ],
      });

    res.send({ message: "Success", _productQuestion });
  } catch (error: any) {
    next(error);
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;

  return { data: instance };
};
