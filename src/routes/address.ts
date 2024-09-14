import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import {
  Create,
  Delete,
  List,
  Update,
  setDefault,
} from "../controllers/address";
import { validate } from "../middlewares/validate-middleware";
import {
  createAddressSchema,
  updateAddressSchema,
  deleteAddressSchema,
  listAddressSchema,
  setDefaultAddressSchema,
} from "../schemas/address";
import { UserType } from "../types/model-types";

const router = express.Router();

router.post("/create", validate(createAddressSchema), authMiddleware(), Create);

router.patch(
  "/update/:uid",
  validate(updateAddressSchema),
  authMiddleware(),
  Update
);
router.patch(
  "/set-default/:uid",
  validate(setDefaultAddressSchema),
  authMiddleware(UserType.USER),
  setDefault
);

router.delete(
  "/delete/:uid",
  validate(deleteAddressSchema),
  authMiddleware(),
  Delete
);

router.get("/list", validate(listAddressSchema), authMiddleware(), List);

export default router;
