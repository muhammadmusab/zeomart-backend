import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import {
  Create,
  Get,
  Update,
  Delete,
  List,
} from "../../controllers/product/productTypes";
import { validate } from "../../middlewares/validate-middleware";
import {
 createProductTypesSchema,
 deleteProductTypesSchema,
 getProductTypesSchema,
 updateProductTypesSchema
} from "../../schemas/product/productTypes";

const router = express.Router();

router.post(
  "/create",
  validate(createProductTypesSchema),
  basicAuthMiddleware,
  Create
);
router.get(
  "/get/:uid",
  validate(getProductTypesSchema),
  Get
);

router.put(
  "/update/:uid",
  validate(updateProductTypesSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductTypesSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list", List);

export default router;
