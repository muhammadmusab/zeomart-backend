import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { Get, Update } from "../controllers/user";
import { validate } from "../middlewares/validate-middleware";
import { updateUserSchema} from "../schemas/user";

const router = express.Router();

router.put(
  "/update",
  validate(updateUserSchema),
  authMiddleware(),
  Update
);

router.get("/get", authMiddleware(), Get);

export default router;
