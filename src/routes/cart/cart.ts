import express from "express";

import {
  Create,
  Delete,
  CreateUpdate,
  Get,
  List,
  CalculateTotal,
  UpdateOrderStatus,
} from "../../controllers/cart/cart";
import { validate } from "../../middlewares/validate-middleware";
import {
  createCartSchema,
  createUpdateCartSchema,
  deleteCartSchema,
  getCartSchema,
  CalculateTotalSchema,
  UpdateStatusSchema,
} from "../../schemas/cart/cart";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";

const router = express.Router();

router.post("/create", validate(createCartSchema), Create);
router.post("/create-update", validate(createUpdateCartSchema), CreateUpdate);
router.post("/calculate-total", validate(CalculateTotalSchema), CalculateTotal);
router.post("/update-status",basicAuthMiddleware, validate(UpdateStatusSchema), UpdateOrderStatus);
router.delete("/delete/:uid", validate(deleteCartSchema), Delete);
router.get("/get/:uid", validate(getCartSchema), Get);
router.get("/list", List);

export default router;
