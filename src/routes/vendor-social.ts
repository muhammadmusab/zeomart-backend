import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { Get, CreateUpdate } from "../controllers/vendor-social";
import { validate } from "../middlewares/validate-middleware";
import { createUpdateVendorSocialSchema } from "../schemas/vendor-social";
import { UserType } from "../types/model-types";

const router = express.Router();

router.post(
  "/create-update",
  validate(createUpdateVendorSocialSchema),
  authMiddleware(UserType.VENDOR),
  CreateUpdate
);

router.get("/get", authMiddleware(UserType.VENDOR), Get);

export default router;
