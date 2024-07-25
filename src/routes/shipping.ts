import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware";
import { Create, Get } from "../controllers/shipping";
import { validate } from "../middlewares/validate-middleware";
import {
  createShippingSchema,
  getShippingSchema,
  deleteShippingSchema,
  updateShippingSchema,
} from "../schemas/shipping";

const router = express.Router();

router.post(
  "/create",
  validate(createShippingSchema),
  authMiddleware(),
  Create
);


router.get("/get/:uid",authMiddleware(), validate(getShippingSchema), Get);


export default router;
