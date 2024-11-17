import express from "express";
import {
  Delete,
  List
} from "../controllers/option";
import { validate } from "../middlewares/validate-middleware";
import {
  deleteOptionsSchema,
  listOptionsSchema,
} from "../schemas/options";
import authMiddleware from "../middlewares/auth-middleware";
import { UserType } from "../types/model-types";
import filtersMiddleware from "../middlewares/filters-middleware";


const router = express.Router();


router.delete(
  "/delete/:uid",
  validate(deleteOptionsSchema),
  authMiddleware(UserType.VENDOR),
  Delete
);
router.get(
  "/list",
  filtersMiddleware,
  validate(listOptionsSchema),
  // authMiddleware(UserType.VENDOR),
  List
);


export default router;
