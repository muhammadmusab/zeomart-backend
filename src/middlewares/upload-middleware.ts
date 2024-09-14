import { Express, NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
type TConfig = {
  size?: number;
  allowedFileTypes?: string;
  optional?: boolean;
};
export const uploadMiddleware = (config?: TConfig) => {
  const {
    allowedFileTypes = /\.(png|jpg|jpeg|webp|avif)$/,
    optional = false,
    size = 1000000000,
  } = config ?? {};
  let regexp = new RegExp(allowedFileTypes);

  let storage = multer.diskStorage({
    destination: function (
      req: Request,
      file: Express.Multer.File,
      cb: Function
    ) {
      if (file) {
        cb(null, path.join(__dirname, "../", "media"));
      }
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
      );
    },
  });

  return multer({
    storage,
    limits: {
      //used to setup limits of different types on file upload
      fileSize: size, //this is in bytes and we want the limit to be 1mb
    },
    fileFilter(req, file, cb) {
      if (optional && !file) {
        return cb(null, true);
      }
      //filter file types that are allowed
      if (!file.originalname.toLocaleLowerCase().match(regexp)) {
        //regex for accepting file that end with .jpg,jpeg,png
        return cb(new Error("Only images are allowed")); //rejecting the file
      }

      cb(null, true); //accepting the file
    },
  });
};
