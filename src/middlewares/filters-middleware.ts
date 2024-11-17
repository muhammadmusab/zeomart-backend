import express, { NextFunction, Request, Response } from "express";
import qs from "qs";

const filtersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.query.search) {
      // @ts-expect-error
      const search = qs.parse(req.query.search);

      // @ts-expect-error
      req.search = search??{};
    }else{
      // @ts-expect-error
      req.search={}
    }
    if (req.query.filter) {
      // @ts-expect-error
      const filter = qs.parse(req.query.filter);

      // @ts-expect-error
      req.filter = filter??{};
    }else{
      // @ts-expect-error
      req.filter={}
    }
    if (req.query.sort) {
      // @ts-expect-error
      let sort = qs.parse(req.query.sort);
      if(!Array.isArray(sort)){
        sort = Object.values(sort) as any
      }
      // @ts-expect-error
      req.sort = sort??[];
    }else{
      // @ts-expect-error
      req.sort=[]
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default filtersMiddleware;
