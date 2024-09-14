import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import {
  Create,
  Update,
  Delete,
  List,
} from "../../controllers/product/productVariantType";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductVariantTypeSchema,
  deleteProductVariantTypeSchema,
  updateProductVariantTypeSchema,
  listProductVariantTypeSchema,
} from "../../schemas/product/productVariantTypes";

const router = express.Router();

router.post(
  "/create",
  validate(createProductVariantTypeSchema),
  basicAuthMiddleware,
  Create
);
// router.get("/get/:uid", validate(getProductVariantTypeSchema), Get);

router.patch(
  "/update/:uid",
  validate(updateProductVariantTypeSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductVariantTypeSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list/:uid", validate(listProductVariantTypeSchema), List);

export default router;
