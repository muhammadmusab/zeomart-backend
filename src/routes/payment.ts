import express from "express";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware";
import { Create, Delete, Get, List, StripeCreateAccount, Update ,StripeCheckout, StripeWebHook, StripeLinkAccount} from "../controllers/payment";
import { validate } from "../middlewares/validate-middleware";
import {
  createPaymentSchema,
  updatePaymentSchema,
  deletePaymentSchema,
  listPaymentSchema,
  getPaymentSchema

} from "../schemas/payment";
import authMiddleware from "../middlewares/auth-middleware";
import { UserType } from "../types/model-types";


const router = express.Router();

router.post(
  "/create",
  authMiddleware(),
  validate(createPaymentSchema),
  Create
);

router.patch(
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



router.post(
  "/stripe/create-account",
  authMiddleware(UserType.VENDOR),
  StripeCreateAccount
);
router.post(
  "/stripe/link-account",
  authMiddleware(UserType.VENDOR),
  StripeLinkAccount
);
router.post(
  "/stripe/checkout",
  authMiddleware(UserType.USER),
  StripeCheckout
);
router.post(
  "/stripe/webhook",
  express.text(),
  // authMiddleware(UserType.USER),
  StripeWebHook
);


export default router;
