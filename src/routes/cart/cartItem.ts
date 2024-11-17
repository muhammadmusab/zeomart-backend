import express from "express";

import {Delete, List } from "../../controllers/cart/cartItem";
import { validate } from "../../middlewares/validate-middleware";
import {
  createUpdateCartItemSchema,
  deleteCartItemSchema,
  listCartItemSchema
} from "../../schemas/cart/cartItem";

const router = express.Router();

// router.post("/create-update", validate(createUpdateCartItemSchema), CreateUpdate);
router.delete("/delete/:uid", validate(deleteCartItemSchema), Delete);
// router.get("/list/:uid", validate(listCartItemSchema), List);

export default router;
