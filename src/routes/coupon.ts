import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware";
import { Create, Delete, Update, Get, Apply } from "../controllers/coupon";
import { validate } from "../middlewares/validate-middleware";
import {
  createCouponSchema,
  deleteCouponSchema,
  updateCouponSchema,
  getCouponSchema,
  applyCouponSchema,
} from "../schemas/coupon";

const router = express.Router();

router.post(
  "/create",
  validate(createCouponSchema),
  basicAuthMiddleware,
  Create
);

router.post("/apply", validate(applyCouponSchema),authMiddleware(), Apply);

router.patch(
  "/update/:uid",
  validate(updateCouponSchema),
  basicAuthMiddleware,
  Update
);

router.get("/get/:uid", validate(getCouponSchema), Get);

router.delete(
  "/delete/:uid",
  validate(deleteCouponSchema),
  basicAuthMiddleware,
  Delete
);

export default router;
