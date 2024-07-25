import { NextFunction, Request, Response } from "express";

export const formatMediaMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || typeof req.files.map !== "function") return next();
  if(req.formattedFiles){
    req.formattedFiles = req.files.map((file: Express.Multer.File) => {
      return `${process.env.API_URL}media/${file.filename}`;
    });
  }

  next();
};
