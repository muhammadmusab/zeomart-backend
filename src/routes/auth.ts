import express from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { validate } from "../middlewares/validate-middleware";
import {
  register,
  verifyEmailAddress,
  ResendVerificationMail,
  signin,
  signout,
  refreshToken,
  resetPassword,
  resetPasswordMail,
  deleteAccount,
  resetPasswordWithoutMail,
} from "../controllers/auth";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  resendVerificationMailSchema,
  resetPasswordMailSchema,
  resetPasswordWithoutMailSchema,
  verifyEmailAddressSchema,
  deleteAccountSchema,
} from "../schemas/auth";
const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.get(
  "/verify-email",
  validate(verifyEmailAddressSchema),
  verifyEmailAddress
);
router.post(
  "/resend-verification-mail",
  validate(resendVerificationMailSchema),
  ResendVerificationMail
);
router.post("/signin", validate(loginSchema), signin);

router.post(
  "/delete-account",
  validate(deleteAccountSchema),
  authMiddleware(),
  deleteAccount
);
router.get("/signout", authMiddleware(), signout);
router.post(
  "/reset-password-mail",
  validate(resetPasswordMailSchema),
  resetPasswordMail
);
router.post(
  "/reset-password-profile",
  validate(resetPasswordWithoutMailSchema),
  authMiddleware(),
  resetPasswordWithoutMail
);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/refresh-token", authMiddleware(true), refreshToken);
export default router;
