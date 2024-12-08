import express from "express";
import {
  Create,
  Get,
  Update,
  Delete,
  List,
  GetBrand,
  ListAdmin,
  GetAdmin,
  DealList,
  BestSellerList,
} from "../../controllers/product/product";
import { validate } from "../../middlewares/validate-middleware";
import {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  listProductSchema,
  getProductBrandSchema,
  dealProductSchema,
} from "../../schemas/product/product";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
import { uploadMiddleware } from "../../middlewares/upload-middleware";
import { Upload } from "../../utils/upload-function";
import filtersMiddleware from "../../middlewares/filters-middleware";

const router = express.Router();

router.post(
  "/create",
  validate(createProductSchema),
  authMiddleware(UserType.VENDOR),
  Create
);
router.get("/get/:uid", validate(getProductSchema), filtersMiddleware, Get);
router.get("/get/:uid/vendor", validate(getProductSchema), filtersMiddleware, GetAdmin);
router.get(
  "/list/brands",
  filtersMiddleware,
  validate(getProductBrandSchema),
  GetBrand
);

router.patch(
  "/update/:uid",
  validate(updateProductSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteProductSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);
router.post(
  "/upload",
  uploadMiddleware().array("media", 5),
  authMiddleware(UserType.VENDOR),
  Upload()
);
router.get("/list",filtersMiddleware, validate(listProductSchema), List);
router.get("/deals",filtersMiddleware, validate(dealProductSchema), DealList);
router.get("/best-seller",filtersMiddleware, validate(dealProductSchema), BestSellerList);
router.get("/list/vendor",authMiddleware(UserType.VENDOR),filtersMiddleware, validate(listProductSchema), ListAdmin);

export default router;
