import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { Create, Delete, List, Update } from "../controllers/address";
import { validate } from "../middlewares/validate-middleware";
import {
  createAddressSchema,
  updateAddressSchema,
  deleteAddressSchema,
  listAddressSchema,
} from "../schemas/address";

const router = express.Router();

router.post(
  "/create",
  validate(createAddressSchema),
  authMiddleware(),
  Create
);

router.put(
  "/update/:uid",
  validate(updateAddressSchema),
  authMiddleware(),
  Update
);

router.delete(
  "/delete/:uid",
  validate(deleteAddressSchema),
  authMiddleware(),
  Delete
);

router.get(
  "/list",
  validate(listAddressSchema),
  authMiddleware(),
  List
);

export default router;
