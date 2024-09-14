import express, { Request, Response, NextFunction } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { Get, Update } from "../controllers/user";
import { validate } from "../middlewares/validate-middleware";
import { updateUserSchema } from "../schemas/user";
import { UserType } from "../types/model-types";
import { uploadMiddleware } from "../middlewares/upload-middleware";

const router = express.Router();

router.patch(
  "/update",
  validate(updateUserSchema),
  authMiddleware(UserType.USER),
  uploadMiddleware({ optional: true }).single("avatar"),
  Update
);

router.get("/get", authMiddleware(UserType.USER), Get);

export default router;
