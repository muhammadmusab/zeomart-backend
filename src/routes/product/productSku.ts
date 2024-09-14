import express from "express";

import {
  Create,
  Update,
  Get,
  Delete,
  List,
} from "../../controllers/product/productSku";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductSkuSchema,
  deleteProductSkuSchema,
  getProductSkuSchema,
  updateProductSkuSchema,
  listProductSkuSchema,
} from "../../schemas/product/productSku";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";

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

router.get("/list/:uid", validate(listProductSkuSchema), List);

export default router;
