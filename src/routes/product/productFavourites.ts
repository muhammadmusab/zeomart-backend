import express from "express";
import basicAuthMiddleware from "../../middlewares/basic-auth-middleware";

import {
 createUpdateProductFavouritesSchema,
 deleteProductFavouritesSchema,
 listProductFavouritesSchema,
 getProductFavouritesSchema
} from "../../schemas/product/productFavourites";
import { CreateUpdate ,List} from "../../controllers/product/productFavourites";
import { validate } from "../../middlewares/validate-middleware";
import authMiddleware from "../../middlewares/auth-middleware";
import { UserType } from "../../types/model-types";
const router = express.Router();
router.post(
  "/toggle",
  validate(createUpdateProductFavouritesSchema),
  authMiddleware(UserType.USER),
  CreateUpdate
);

// router.delete(
//   "/delete/:uid",
//   validate(deleteProductFavouritesSchema),
//   basicAuthMiddleware,
//   Delete
// );
// router.post(
//   "/get",
//   validate(getProductFavouritesSchema),
//   basicAuthMiddleware,
//   Get
// );
router.get(
  "/list",
  validate(listProductFavouritesSchema),
  authMiddleware(UserType.USER),
  List
);
export default router;