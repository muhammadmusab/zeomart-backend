import express from "express";

import {
  Create,
  Update,
  Get,
  Delete,
  List,
  setDefaultVariant,
} from "../../controllers/product/productSku";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductSkuSchema,
  deleteProductSkuSchema,
  getProductSkuSchema,
  updateProductSkuSchema,
  listProductSkuSchema,
  setDefaultVariantSchema,
} from "../../schemas/product/productSku";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
import filtersMiddleware from "../../middlewares/filters-middleware";

const router = express.Router();

router.post(
  "/create",
  validate(createProductSkuSchema),
  authMiddleware(UserType.VENDOR),
  Create
);

router.get(
  "/get/:uid",
  validate(getProductSkuSchema),
  Get
);
router.patch(
  "/update/:uid",
  validate(updateProductSkuSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductSkuSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);
router.post(
  "/set-default",
  validate(setDefaultVariantSchema),
  authMiddleware(UserType.VENDOR),
  setDefaultVariant
);
router.get("/list/:uid", filtersMiddleware, validate(listProductSkuSchema), List);

export default router;
