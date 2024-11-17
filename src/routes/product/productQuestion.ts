import express from "express";
import {
  Create,
  Get,
  Delete,
  List,
} from "../../controllers/product/productQuestion";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductQuestionSchema,
  deleteProductQuestionSchema,
  getProductQuestionSchema,
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



router.delete(
  "/delete/:uid",
  validate(deleteProductQuestionSchema),
  authMiddleware(UserType.USER),
  Delete
);

router.get("/list/:uid",filtersMiddleware, validate(listProductQuestionSchema), List);


export default router;
