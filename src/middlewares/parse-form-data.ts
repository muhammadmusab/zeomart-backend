import express, { NextFunction, Request, Response } from "express";
import qs from "qs";

const app = express();
app.use(
  express.urlencoded({ extended: true, parameterLimit: 10000, limit: "5mb" })
);
const parseDataMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body)
    const parsedBody: any = {};
    for (let key in req.body) {
      if (key.includes(".")) {
        const keys = key.split(".");
        keys.reduce((acc: any, part, index) => {
          if (index === keys.length - 1) {
            acc[part] = req.body[key];
          } else {
            acc[part] = acc[part] || {};
          }
          return acc[part];
        }, parsedBody);
      } else {
        parsedBody[key] = req.body[key];
      }
    }
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};

export default parseDataMiddleware;
