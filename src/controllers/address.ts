import { Address } from "../models/Address";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { User } from "../models/User";
import { UserType } from "../types/model-types";
import { getPaginated } from "../utils/paginate";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, country, address1, address2, name, postalCode } = req.body;

    let address = null;
    let user = null;

    if (req.user.type === UserType.USER)
      user = await getUserId(req.user.User?.uuid as string);
    let body = {
      UserId: null,
      city,
      country,
      address1,
      address2,
      name,
      postalCode,
    } as any;

    if (user && user?.id) {
      body.UserId = user?.id;
    }

    address = await Address.create(body);
    const { data } = getData(address);
    res.status(201).send({ message: "Success", data });
  } catch (error: any) {
    console.log(error.message);
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
      "city",
      "country",
      "name",
      "address1",
      "address2",
      "postalCode",
    ];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    let user = null;

    user = await getUserId(req.user.User?.uuid as string);
    const result = await Address.update(
      { ...validBody },
      {
        where: {
          uuid: uid,
          UserId: user?.id,
        },
      }
    );
    if (!result[0]) {
      const err = new BadRequestError("Could not update the address data");
      res.status(err.status).send({ message: err.message });
      return;
    }

    const address = await Address.findOne({
      where: {
        uuid: uid,
      },
    });
    res.send({ message: "Success", data: address });
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
    let user = await getUserId(req.user.User?.uuid as string);

    const result = await Address.destroy({
      where: {
        uuid: uid,
        UserId: user?.id,
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
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user = await getUserId(req.user.User?.uuid as string);
    let model = User;

    const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { count: total, rows: addresses } = await Address.findAndCountAll({
      where: {
        UserId: user?.id,
      },
      attributes: {
        exclude: ["UserId"],
      },
      include: [
        {
          model,
        },
      ],
      offset: offset,
      limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: addresses, total });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};

const getUserId = async (uuid: string) => {
  const user = await User.scope("withId").findOne({
    where: {
      uuid,
    },
    attributes: ["id"],
  });
  return user;
};

const getData = (instance: any) => {
  delete instance.dataValues.id;
  delete instance.dataValues.UserId;
  return { data: instance };
};
