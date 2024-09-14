import express from "express";
import { Create, Delete, List, Update ,Get} from "../controllers/filter";
import { validate } from "../middlewares/validate-middleware";
import {
  createFilterSchema,
  deleteFilterSchema,
  getFilterSchema,
  // listFilterSchema,
  updateFilterSchema,
} from "../schemas/filter";
import authMiddleware from "../middlewares/auth-middleware";
import { UserType } from "../types/model-types";
import filtersMiddleware from "../middlewares/filters-middleware";
const router = express.Router();

router.post(
  "/create",
  validate(createFilterSchema),
  authMiddleware(UserType.VENDOR),
  Create
);

router.patch(
  "/update/:uid",
  validate(updateFilterSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteFilterSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);
router.get(
  "/get/:uid",
  validate(getFilterSchema),
  // authMiddleware(UserType.VENDOR),
  Get
);

router.get("/list",filtersMiddleware, List);

export default router;
