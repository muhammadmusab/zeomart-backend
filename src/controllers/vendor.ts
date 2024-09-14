import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { Vendor } from "../models/Vendor";
import { Address } from "../models/Address";
import { Auth } from "../models/Auth";

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: req.user.Vendor?.uuid,
      },
    });
    const auth=await Auth.findOne({
      where:{
        VendorId:vendor?.id
      },
      attributes:{
        include:['avatar']
      }
    })

    const avatar=auth?.dataValues.avatar

    const address = await Address.findOne({
      where: {
        VendorId: vendor?.id,
      },
      attributes: {
        exclude: ["VendorId", "id", "VendorId"],
      },
    });

    delete vendor?.dataValues.id;

    res.send({
      message: "Success",
      data: { ...vendor?.dataValues,avatar, address },
    });
  } catch (error) {
    next(error);
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as any;
    const validUpdates = ["name", "description", "phone", "address"];
    console.log(req.body);
    const validBody = getValidUpdates(validUpdates, req.body);

    const vendor = await Vendor.scope("withId").findOne({
      where: {
        uuid: req.user.Vendor?.uuid,
      },
    });

    if (!vendor) {
      const err = new BadRequestError("Vendor not found");
      res.status(err.status).send({ message: err.message });
      return;
    }

    vendor.name = validBody.name ? validBody.name : vendor.name;
    vendor.description = validBody.description;
    vendor.phone = validBody.phone;
    if (files && files.cover) {
      vendor.coverPhoto = `${process.env.IMAGE_DOMAIN}/media/${files.cover[0].filename}`;
    }

    await vendor.save();
    await vendor.reload();

    // update emial or avatar
    let auth;

    auth = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: {
        email: req.user?.email,
      },
    });

    if (auth) {
      if (files && files.avatar) {
        auth.avatar = `${process.env.IMAGE_DOMAIN}/media/${files.avatar[0].filename}`;
      }
      if (req.body.email) {
        auth.email = req.body.email;
      }

      await auth.save();
      await auth.reload();
    }
    let address;
    if (validBody.address) {
      address = await Address.scope("withId").findOne({
        where: {
          VendorId: vendor.id,
        },
      });
      const addressBody = validBody.address;
      if (!address) {
        address = await Address.create({
          city: addressBody.city,
          streetAddress: addressBody.streetAddress,
          zip: addressBody.zip,
          state: addressBody.state,
          VendorId: vendor.id,
        });
      } else {
        address.streetAddress = addressBody.streetAddress
          ? addressBody.streetAddress
          : address.streetAddress;
        address.city = addressBody.city ? addressBody.city : address.city;
        address.zip = addressBody.zip ? addressBody.zip : address.zip;
        address.state = addressBody.state ? addressBody.state : address.state;
        await address.save();
        await address.reload();
      }
    }

    delete vendor.dataValues.id;
    delete auth?.dataValues.id;
    delete auth?.dataValues.UserId;
    delete auth?.dataValues.VendorId;
    delete address?.dataValues.id;
    delete address?.dataValues.VendorId;

    res.send({ message: "Success", data: { ...vendor.dataValues, address } });
  } catch (error: any) {
    next(error);
  }
};
