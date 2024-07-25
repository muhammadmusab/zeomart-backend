import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import {
  Create,
  Update,
  Get,
  Delete,
  List,
  AssignVariants,
  AssignedList,
  setDefaultVariant,
} from "../../controllers/product/productVariant";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductVariantSchema,
  assignVariantSchema,
  deleteProductVariantSchema,
  getProductVariantSchema,
  updateProductVariantSchema,
  listProductVariantSchema,
  setDefaultVariantSchema,
} from "../../schemas/product/productVariant";

const router = express.Router();

router.post(
  "/create",
  validate(createProductVariantSchema),
  basicAuthMiddleware,
  Create
);
router.post(
  "/assign",
  validate(assignVariantSchema),
  basicAuthMiddleware,
  AssignVariants
);
router.post(
  "/set-default",
  validate(setDefaultVariantSchema),
  basicAuthMiddleware,
  setDefaultVariant
);

router.get(
  "/get/:uid",
  validate(getProductVariantSchema),
  Get
);
router.put(
  "/update/:uid",
  validate(updateProductVariantSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductVariantSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list/:uid", List);
router.post("/assigned-list", validate(listProductVariantSchema), AssignedList);

export default router;
