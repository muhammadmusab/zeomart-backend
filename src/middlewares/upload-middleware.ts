import { Express, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
export const uploadMiddleware = () => {
  let storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
      if (file) {
        cb(null, path.join(__dirname, '../', 'media'));
      }
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    },
  });

  return multer({
    storage,
    limits: {
      //used to setup limits of different types on file upload
      fileSize: 1000000000, //this is in bytes and we want the limit to be 1mb
    },
    fileFilter(req, file, cb) {
      //filter file types that are allowed
      if (!file.originalname.match(/\.(png|jpg|jpeg|webp|avif)$/)) {
        //regex for accepting file that end with .jpg,jpeg,png
        return cb(new Error('Only images are allowed')); //rejecting the file
      }

      cb(null, true); //accepting the file
    },
  });
};
