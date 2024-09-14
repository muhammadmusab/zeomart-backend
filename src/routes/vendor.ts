import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { Get, Update } from "../controllers/vendor";
import { validate } from "../middlewares/validate-middleware";
import { updateVendorSchema } from "../schemas/vendor";
import { UserType } from "../types/model-types";
import { uploadMiddleware } from "../middlewares/upload-middleware";
import parseDataMiddleware from "../middlewares/parse-form-data";

const router = express.Router();

router.patch(
  "/update",
  validate(updateVendorSchema),
  authMiddleware(UserType.VENDOR),
  uploadMiddleware().fields([
    { name: "cover", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  
  parseDataMiddleware,
  Update
);

router.get("/get", authMiddleware(UserType.VENDOR), Get);

export default router;
