import express from "express";
import {
  Create,
  Get,
  Update,
  Delete,
  List,
} from "../controllers/attribute";
import { validate } from "../middlewares/validate-middleware";
import {
 createAttributeSchema,
 deleteAttributeSchema,
 getAttributeSchema,
 updateAttributeSchema
} from "../schemas/attribute";
import authMiddleware from "../middlewares/auth-middleware";
import { UserType } from "../types/model-types";
import filtersMiddleware from "../middlewares/filters-middleware";

const router = express.Router();

router.post(
  "/create",
  validate(createAttributeSchema),
  authMiddleware(UserType.VENDOR),
  Create
);
router.get(
  "/get/:uid",
  validate(getAttributeSchema),
  Get
);

router.patch(
  "/update/:uid",
  validate(updateAttributeSchema),
  authMiddleware(UserType.VENDOR),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteAttributeSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);

router.get("/list",filtersMiddleware, List);

export default router;
