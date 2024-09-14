import { Request, Response, NextFunction } from "express";
import { Social } from "../models/Social";
import { Vendor } from "../models/Vendor";

export const CreateUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { socialLinks } = req.body;

    const vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: req.user.Vendor?.uuid,
      },
    });
    await Promise.all(
      socialLinks.map(
        async (item: { uuid?: string; url: string; name: string }) => {
          if (item.uuid) {
            const social = await Social.findOne({
              where: {
                uuid: item.uuid,
              },
            });
            if (social) {
              social.name = item.name ? item.name : social.name;
              social.url = item.url ? item.url : social.url;
              await social.save();
            }
          } else {
            await Social.create({
              name: item.name,
              url: item.url,
              VendorId: vendor?.id,
            });
          }
        }
      )
    );

    let social = await Social.findAll({
      where: {
        VendorId: vendor?.id,
      },
    });

    res.send({ message: "Success", data: social });
  } catch (error) {
    next(error);
  }
};

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.user.Vendor);
    const vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: req.user.Vendor?.uuid,
      },
    });
    let social = await Social.findAll({
      where: {
        VendorId: vendor?.id,
      },
    });

    res.send({ message: "Success", data: social });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
