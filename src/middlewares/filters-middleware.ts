import express, { NextFunction, Request, Response } from "express";
import qs from "qs";

const filtersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.search) {
      // @ts-expect-error
      const search = qs.parse(req.query.search);

      // @ts-expect-error
      req.search = search;
    }
    if (req.query.filter) {
      // @ts-expect-error
      const filter = qs.parse(req.query.filter);

      // @ts-expect-error
      req.filter = filter;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default filtersMiddleware;
