import express from "express";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware";
import { Create, Delete, List, Update } from "../controllers/filter";
import { validate } from "../middlewares/validate-middleware";
import {
  createFilterSchema,
  deleteFilterSchema,
  listFilterSchema,
  updateFilterSchema,
} from "../schemas/filter";
const router = express.Router();

router.post(
  "/create",
  validate(createFilterSchema),
  basicAuthMiddleware,
  Create
);

router.put(
  "/update/:uid",
  validate(updateFilterSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteFilterSchema),
  basicAuthMiddleware,
  Delete
);

router.get("/list", validate(listFilterSchema), List);

export default router;
