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
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
import filtersMiddleware from "../../middlewares/filters-middleware";

const router = express.Router();

router.post(
  "/create",
  validate(createProductVariantSchema),
  authMiddleware(UserType.VENDOR),
  Create
);
router.post(
  "/assign",
  validate(assignVariantSchema),
  authMiddleware(UserType.VENDOR),
  AssignVariants
);
router.post(
  "/set-default",
  validate(setDefaultVariantSchema),
  authMiddleware(UserType.VENDOR),
  setDefaultVariant
);

router.get("/get/:uid", validate(getProductVariantSchema), Get);
router.patch(
  "/update/:uid",
  validate(updateProductVariantSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductVariantSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);

router.get("/list/:uid", List);

router.get(
  "/assigned-list",
  filtersMiddleware,
  validate(listProductVariantSchema),
  AssignedList
);

export default router;
