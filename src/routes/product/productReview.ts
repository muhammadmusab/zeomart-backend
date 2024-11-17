import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import authMiddleware from "../../middlewares/auth-middleware";
import {
  Create,
  Update,
  Delete,
  List,
} from "../../controllers/product/productReview";
import { validate } from "../../middlewares/validate-middleware";
import {
 createProductReviewSchema,
 deleteProductReviewSchema,
 updateProductReviewSchema,
 listProductReviewSchema
} from "../../schemas/product/productReview";
import { UserType } from "../../types/model-types";
import filtersMiddleware from "../../middlewares/filters-middleware";

const router = express.Router();

router.post(
  "/create",
  validate(createProductReviewSchema),
  authMiddleware(UserType.USER),
  Create
);
router.patch(
  "/update/:uid",
  validate(updateProductReviewSchema),
  authMiddleware(UserType.USER),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductReviewSchema),
  authMiddleware(UserType.USER),
  Delete
);

router.get("/list",filtersMiddleware,validate(listProductReviewSchema), List);

export default router;
