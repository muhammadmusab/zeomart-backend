import express from "express";
import {
  Create,
  Get,
  Update,
  Delete,
  List,
} from "../../controllers/product/brand";
import { validate } from "../../middlewares/validate-middleware";
import {
  createBrandSchema,
  getBrandSchema,
  updateBrandSchema,
  deleteBrandSchema,
} from "../../schemas/product/brand";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";

const router = express.Router();

router.post(
  "/create",
  validate(createBrandSchema),
  authMiddleware(UserType.VENDOR),
  Create
);
router.post(
  "/get",
  validate(getBrandSchema),
  Get
);

router.patch(
  "/update/:uid",
  validate(updateBrandSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteBrandSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);
router.get("/list", List);

export default router;
