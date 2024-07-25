import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";

import {
 createUpdateProductFavouritesSchema,
 deleteProductFavouritesSchema,
 listProductFavouritesSchema,
 getProductFavouritesSchema
} from "../../schemas/product/productFavourites";
import { CreateUpdate,Get, List, Delete } from "../../controllers/product/productFavourites";
import { validate } from "../../middlewares/validate-middleware";
import authMiddleware from "../../middlewares/auth-middleware";
const router = express.Router();
router.post(
  "/create",
  validate(createUpdateProductFavouritesSchema),
  authMiddleware(),
  CreateUpdate
);

router.delete(
  "/delete/:uid",
  validate(deleteProductFavouritesSchema),
  basicAuthMiddleware,
  Delete
);
router.post(
  "/get",
  validate(getProductFavouritesSchema),
  basicAuthMiddleware,
  Get
);
router.get(
  "/list",
  validate(listProductFavouritesSchema),
  basicAuthMiddleware,
  List
);
export default router;