import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { User } from "../models/User";
import { Address } from "../models/Address";
import { Gender } from "../types/model-types";

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({
      where: {
        uuid: req.user.User?.uuid,
      },
      // include: [
      //   {
      //     model: Address,
      //     where: {
      //       UserId: req.user.User?.id,
      //     },
      //   },
      // ],
    });

    res.send({ message: "Success", data: user });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = ["name", "gender" as Gender, "dob", "mobile"];
    const validBody = getValidUpdates(validUpdates, req.body);
    console.log(req.user.User)
    const result = await User.update(
      { ...validBody },

      {
        where: {
          uuid: req.user.User?.uuid,
        },
      }
    );
    if (!result[0]) {
      const err = new BadRequestError("Could not update the user data");
      res.status(err.status).send({ message: err.message });
      return;
    }

    let user = await User.findOne({
      where: {
        uuid: req.user.User?.uuid,
      },
      // include: [
      //   {
      //     model: Address,
      //     where: {
      //       UserId: req.user.User?.id,
      //     },
      //   },
      // ],
    });

    res.send({ message: "Success", data: user });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
};
