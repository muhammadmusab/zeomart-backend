import express from "express";
import { Create, Delete, Get, List, Update} from "../controllers/category";
import { validate } from "../middlewares/validate-middleware";

import {
  createUpdateCategorySchema,
  deleteCategorySchema,
  listCategorySchema,
  getCategorySchema
} from "../schemas/category";
import { uploadMiddleware } from "../middlewares/upload-middleware";
import authMiddleware from "../middlewares/auth-middleware";
import { UserType } from "../types/model-types";
import filtersMiddleware from "../middlewares/filters-middleware";
import { Upload } from "../utils/upload-function";

const router = express.Router();

router.post(
  "/create",
  authMiddleware(UserType.VENDOR),
  validate(createUpdateCategorySchema),
  Create
);

router.patch(
  "/update/:uid",
  authMiddleware(UserType.VENDOR),
  validate(createUpdateCategorySchema),
  Update
);
router.get(
  "/get/:uid",

  validate(getCategorySchema),
  Get
);

router.delete(
  "/delete/:uid",
  validate(deleteCategorySchema),
  authMiddleware(UserType.VENDOR),
  Delete
);

router.post(
  "/upload",
  uploadMiddleware().single('media'), 
  authMiddleware(UserType.VENDOR),
  Upload()
);


router.get("/list", validate(listCategorySchema), filtersMiddleware, List);

export default router;