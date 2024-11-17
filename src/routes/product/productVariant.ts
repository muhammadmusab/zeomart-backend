import express from "express";
import {
  Create,
  Update,
  Get,
  Delete,
  List,
} from "../../controllers/product/productVariant";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductVariantSchema,
  deleteProductVariantSchema,
  getProductVariantSchema,
  updateProductVariantSchema,
} from "../../schemas/product/productVariant";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
import filtersMiddleware from "../../middlewares/filters-middleware";

const router = express.Router();

// router.post(
//   "/create",
//   validate(createProductVariantSchema),
//   authMiddleware(UserType.VENDOR),
//   Create
// );
router.post(
  "/create",
  validate(createProductVariantSchema),
  authMiddleware(UserType.VENDOR),
  Create
);


router.get("/get/:uid", validate(getProductVariantSchema), Get);
router.patch(
  "/update/:uid",
  validate(updateProductVariantSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductVariantSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);

router.get("/list/:uid",filtersMiddleware, List);

// router.get(
//   "/assigned-list",
//   filtersMiddleware,
//   validate(listProductVariantSchema),
//   AssignedList
// );

export default router;
