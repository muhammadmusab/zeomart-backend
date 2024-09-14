import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { User } from "../models/User";
import { Address } from "../models/Address";
import { Auth } from "../models/Auth";
// import { Gender } from "../types/model-types";

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.scope("withId").findOne({
      where: {
        uuid: req.user.User?.uuid,
      },
      include: [
        {
          model: Auth,
        },
      ],
    });
    const addresses = await Address.findAll({
      where: {
        UserId: user?.id,
      },
      attributes: {
        exclude: ["UserId", "id", "VendorId"],
      },
    });

    delete user?.dataValues.id;
    const userData = {
      uuid: user?.dataValues.uuid,
      firstName: user?.dataValues.firstName,
      lastName: user?.dataValues.lastName,
      phone: user?.dataValues.phone,

      // @ts-expect-error
      createdAt: user?.dataValues.createdAt,
      // @ts-expect-error
      updatedAt: user?.dataValues.updatedAt,
      // @ts-expect-error
      email: user?.dataValues.Auths[0].email,
      // @ts-expect-error
      avatar: user?.dataValues.Auths[0].avatar,
    };
    res.send({ message: "Success", data: { ...userData, addresses } });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = ["firstName", "lastName", "phone"];
    const validBody = getValidUpdates(validUpdates, req.body);
    console.log('uuid',req.user.User?.uuid)
    const result = await User.update(
      { ...validBody },
      {
        where: {
          uuid: req.user.User?.uuid,
        },
      }
    );
    console.log(result)
    if (!result[0]) {
      const err = new BadRequestError("Could not update the user data");
      res.status(err.status).send({ message: err.message });
      return;
    }

    let auth;

    auth = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: {
        email: req.user?.email,
      },
    });
    if (auth) {
      if (req.file && req.file?.fieldname) {
        auth.avatar = `${process.env.IMAGE_DOMAIN}/media/${req.file?.filename}`;
      }
      if (req.body.email) {
        auth.email = req.body.email;
      }

      await auth.save();
      await auth.reload();
    }

    if (req.body.avatarDeleted == "true" && auth) {

      auth.avatar = null;
      await auth.save()

    }

    let user = await User.findOne({
      where: {
        uuid: req.user.User?.uuid,
      },
    });
    delete auth?.dataValues.id;
    delete auth?.dataValues.UserId;
    delete auth?.dataValues.VendorId;
    res.send({ message: "Success", data: { ...user?.dataValues } });
  } catch (error: any) {
    next(error)
  }
};
