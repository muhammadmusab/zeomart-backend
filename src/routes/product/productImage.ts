import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";
import {
  createProductImageSchema,
  deleteProductImageSchema,
  listProductImageSchema,
} from "../../schemas/product/productImage";
import { Create, List, Delete } from "../../controllers/product/productImage";
import { validate } from "../../middlewares/validate-middleware";
import { uploadMiddleware } from '../../middlewares/upload-middleware';
const router = express.Router();
router.post(
  "/create",
  uploadMiddleware().single('productImage'),
  validate(createProductImageSchema),
  basicAuthMiddleware,
  Create
);

router.delete(
  "/delete/:uid",
  validate(deleteProductImageSchema),
  basicAuthMiddleware,
  Delete
);
router.get(
  "/list",
  validate(listProductImageSchema),
  basicAuthMiddleware,
  List
);
export default router;