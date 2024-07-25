import { RequestValidationError } from "../utils/api-errors";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "yup";


interface Schema {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
  cookies?: Record<string, any>;
  validate: (obj: any, options?: object) => any;
}

export const validate =(schema: Schema ) =>
  async (req: Request, res: Response, next: NextFunction) => {
  
    try {
      await schema.validate(
        {
          body: req.body,
          query: req.query,
          params: req.params,
          cookies: req.cookies,
        },
        { abortEarly: false }
      );

      return next();
    } catch (err: any) {
      if (err instanceof ValidationError) {
        const formattedErrors = err.inner.map((error:any)=>{
          const pathArr = error.path.split('.')
          return {
            message:error.message,
            path:error.path,
            field:error.path.split('.')[pathArr.length - 1]
          }
        })
        err = new RequestValidationError(formattedErrors);
        err.status = 400;
      }
      next(err);
    }
  };
