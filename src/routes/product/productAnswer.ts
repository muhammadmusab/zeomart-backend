import express from "express";
import {
  Create,
  Update,
} from "../../controllers/product/productQuestion";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductAnswerSchema,
  updateProductAnswerSchema,

} from "../../schemas/product/productQuestion";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";

const router = express.Router();


router.patch(
  "/create/:uid",
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


export default router;
