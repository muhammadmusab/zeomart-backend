import express from "express";
import {
  Create,
  Get,
  Update,
  Delete,
  List,
} from "../../controllers/product/productQuestion";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductQuestionSchema,
  deleteProductQuestionSchema,
  getProductQuestionSchema,
  updateProductQuestionSchema,
  listProductQuestionSchema
} from "../../schemas/product/productQuestion";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
import filtersMiddleware from "../../middlewares/filters-middleware";

const router = express.Router();

router.post(
  "/create",
  validate(createProductQuestionSchema),
  authMiddleware(UserType.USER),
  Create
);
router.get("/get/:uid", validate(getProductQuestionSchema), filtersMiddleware, Get);


router.patch(
  "/update/:uid",
  validate(updateProductQuestionSchema),
  authMiddleware(UserType.USER),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductQuestionSchema),
  authMiddleware(UserType.USER),
  Delete
);

router.get("/list",filtersMiddleware, validate(listProductQuestionSchema), List);


export default router;
