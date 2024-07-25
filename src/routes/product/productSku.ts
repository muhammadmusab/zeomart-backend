import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
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

const router = express.Router();

router.post(
  "/create",
  validate(createProductSkuSchema),
  basicAuthMiddleware,
  Create
);

router.get(
  "/get/:uid",
  validate(getProductSkuSchema),
  Get
);
router.put(
  "/update/:uid",
  validate(updateProductSkuSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductSkuSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list/:uid", validate(listProductSkuSchema), List);

export default router;
