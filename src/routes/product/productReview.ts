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

const router = express.Router();

router.post(
  "/create",
  validate(createProductReviewSchema),
  authMiddleware(),
  Create
);
router.put(
  "/update/:uid",
  validate(updateProductReviewSchema),
  authMiddleware(),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductReviewSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list",validate(listProductReviewSchema), List);

export default router;
