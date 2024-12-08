import express from "express";

import {
  CreateUpdate,
  // Create,
  Delete,
  Get,
  List,
  CalculateTotal,
  PlaceOrder,
  OrderList,
  AddUser,
  UpdateOrderStatus,
} from "../../controllers/cart/cart";
import { validate } from "../../middlewares/validate-middleware";
import {
  createCartSchema,
  deleteCartSchema,
  getCartSchema,
  UpdateOrderStatusSchema,
  CalculateTotalSchema,
  PlaceOrderSchema,
} from "../../schemas/cart/cart";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import optionalMiddleware from "../../middlewares/optional-auth-middleware";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";

const router = express.Router();

router.get("/get/:uid?",  validate(getCartSchema),optionalMiddleware, Get);
router.post("/create-update",  validate(getCartSchema),optionalMiddleware, CreateUpdate);
router.post("/add-user/:uid",  validate(getCartSchema),authMiddleware(UserType.USER), AddUser);




router.post("/calculate-total", validate(CalculateTotalSchema), CalculateTotal);
router.post("/place-order",authMiddleware(UserType.USER), validate(PlaceOrderSchema), PlaceOrder);
router.get("/order/list",authMiddleware(UserType.VENDOR), OrderList);
router.patch("/update-status/:uid",authMiddleware(UserType.VENDOR),validate(UpdateOrderStatusSchema), UpdateOrderStatus);
router.delete("/delete/:uid", validate(deleteCartSchema), Delete);
// router.get("/get/:uid", validate(getCartSchema), Get);
router.get("/list", List);

export default router;
