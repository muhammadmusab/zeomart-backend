import express from "express";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware";
import { Create, Delete, List, Update } from "../controllers/category";
import { validate } from "../middlewares/validate-middleware";
import {
  createUpdateCategorySchema,
  deleteCategorySchema,
  listCategorySchema,
} from "../schemas/category";

const router = express.Router();

router.post(
  "/create",
  validate(createUpdateCategorySchema),
  basicAuthMiddleware,
  Create
);

router.put(
  "/update/:uid",
  validate(createUpdateCategorySchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteCategorySchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list", validate(listCategorySchema), List);

export default router;
