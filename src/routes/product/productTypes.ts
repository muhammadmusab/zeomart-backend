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
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";

const router = express.Router();

router.post(
  "/create",
  validate(createProductTypesSchema),
  authMiddleware(UserType.VENDOR),
  Create
);
router.get(
  "/get/:uid",
  validate(getProductTypesSchema),
  Get
);

router.patch(
  "/update/:uid",
  validate(updateProductTypesSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductTypesSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);

router.get("/list", List);

export default router;
