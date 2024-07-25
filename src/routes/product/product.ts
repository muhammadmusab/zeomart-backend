import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import {
  Create,
  Get,
  Update,
  Delete,
  List,
} from "../../controllers/product/product";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  listProductSchema,
} from "../../schemas/product/product";

const router = express.Router();

router.post(
  "/create",
  validate(createProductSchema),
  basicAuthMiddleware,
  Create
);
router.post(
  "/get",
  validate(getProductSchema),
  basicAuthMiddleware,
  Get
);

router.put(
  "/update/:uid",
  validate(updateProductSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list", validate(listProductSchema), List);

export default router;
