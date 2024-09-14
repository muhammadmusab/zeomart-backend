import { Address } from "../models/Address";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { User } from "../models/User";
import { UserType } from "../types/model-types";
import { getPaginated } from "../utils/paginate";
import { Vendor } from "../models/Vendor";
import { ADRESSTYPE } from "../types/general";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, zip, streetAddress, state, type } = req.body;

    let address = null;
    let user = null;
    let vendor = null;
    const userType = req.query.type;

    if (userType === UserType.USER) {
      user = await getUserId(req.user.User?.uuid as string);
    } else if (userType === UserType.VENDOR) {
      vendor = await getVendorId(req.user.Vendor?.uuid as string);
    }

    let body = {
      city,
      zip,
      streetAddress,
      state,
      type: userType === UserType.USER ? type : null,
    } as any;

    if (user && user?.id) {
      body.UserId = user?.id;
      if (!type) {
        return res.status(403).send({ message: "type required" });
      }
      address = await Address.findOne({
        where: { UserId: user.id, type: type },
      });
      if (address?.type === ADRESSTYPE.BILLING) {
        return res.status(403).send({
          message: `multiple ${ADRESSTYPE.BILLING} is not allowed for a user`,
        });
      }
    } else if (vendor && vendor.id) {
      body.VendorId = vendor.id;
      address = await Address.scope("withId").findOne({
        where: { VendorId: vendor.id },
      });
      if (address) {
        return res.status(403).send({
          message: `Adress already exists for this vendor`,
        });
      }
    }

    address = await Address.create(body);
    const { data } = getData(address);
    delete address.dataValues.UserId;
    delete address.dataValues.VendorId;
    return res.status(201).send({ message: "Success", data });
  } catch (error: any) {
    console.log(error.message);
    next(error);
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
      "zip",
      "streetAddress",
      "state",
      "postalCode",
    ];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;
    const type = req.query.type;

    let user = null;
    let vendor = null;

    let where = {
      uuid: uid,
    } as any;

    if (type === UserType.USER) {
      user = await getUserId(req.user.User?.uuid as string);
      where.UserId = user?.id;
    } else if (type === UserType.VENDOR) {
      vendor = await getVendorId(req.user.Vendor?.uuid as string);
      where.VendorId = vendor?.id;
    }

    const result = await Address.update(
      { ...validBody },
      {
        where,
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
    const result = await Address.destroy({
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
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user;
    let vendor;
    const type = req.query.type;
    let where = {} as any;
    let model;

    if (type === UserType.USER) {
      user = await getUserId(req.user.User?.uuid as string);
      where.UserId = user?.id;
      model = User;
    } else if (type === UserType.VENDOR) {
      vendor = await getVendorId(req.user.Vendor?.uuid as string);
      where.VendorId = vendor?.id;
      model = Vendor;
    }

    // const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { count: total, rows: addresses } = await Address.findAndCountAll({
      where,
      attributes: {
        exclude: [type === UserType.USER ? "UserId" : "VendorId"],
      },
      include: [
        {
          model,
        },
      ],
      // offset: offset,
      // limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: addresses, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};

export const setDefault = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // address uid
    const type = req.user.type;

    let user = null;

    let where = {
      uuid: uid,
    } as any;

    if (type === UserType.VENDOR) {
      return res.status(403).send({ message: "Invalid user type" });
    }

    if (type === UserType.USER) {
      user = await getUserId(req.user.User?.uuid as string);
      where.UserId = user?.id;
    }

    let address = await Address.update(
      {
        default: false,
      },
      {
        where: {
          type: ADRESSTYPE.shipping,
          UserId: user?.id,
        },
      }
    );
    address = await Address.update(
      {
        default: true,
      },
      {
        where: {
          type: ADRESSTYPE.shipping,
          UserId: user?.id,
          uuid: uid,
        },
      }
    );

    res.send({ message: "Success", data: address });
  } catch (error) {
    next(error);
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
const getVendorId = async (uuid: string) => {
  const user = await Vendor.scope("withId").findOne({
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
