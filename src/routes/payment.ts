import express from "express";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware";
import { Create, Delete, Get, List, Update } from "../controllers/payment";
import { validate } from "../middlewares/validate-middleware";
import {
  createPaymentSchema,
  updatePaymentSchema,
  deletePaymentSchema,
  listPaymentSchema,
  getPaymentSchema

} from "../schemas/payment";
import authMiddleware from "../middlewares/auth-middleware";

const router = express.Router();

router.post(
  "/create",
  authMiddleware(),
  validate(createPaymentSchema),
  Create
);

router.put(
  "/update/:uid",
  validate(updatePaymentSchema),
  basicAuthMiddleware,
  Update
);

router.delete(
  "/delete/:uid",
  validate(deletePaymentSchema),
  basicAuthMiddleware,
  Delete
);

router.get(
  "/get/:uid",
  validate(getPaymentSchema),
  authMiddleware(),
  Get
);
router.get(
  "/list",
  validate(listPaymentSchema),
  basicAuthMiddleware,
  List
);

export default router;
