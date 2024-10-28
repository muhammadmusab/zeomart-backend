import express from "express";
import {
  Create,
  Update,
  Delete,
} from "../../controllers/product/productAnswer";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductAnswerSchema,
  deleteProductAnswerSchema,
  updateProductAnswerSchema,
} from "../../schemas/product/productAnswer";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";

const router = express.Router();

router.post(
  "/create",
  validate(createProductAnswerSchema),
  authMiddleware(UserType.VENDOR),
  Create
);

router.patch(
  "/update/:uid",
  validate(updateProductAnswerSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductAnswerSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);




export default router;
