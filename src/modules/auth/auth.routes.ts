import express from "express";
import authController from "./auth.controller";
import { validateBody } from "../../middlewares/validateRequest";
import authenticate from "../../middlewares/auth";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router = express.Router();


router.post(
  "/register",
  validateBody(registerSchema),
  authController.register
);


router.post(
  "/login",
  validateBody(loginSchema),
  authController.login
);


router.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  authController.refreshAccessToken
);


router.get(
  "/me",
  authenticate,
  authController.getProfile
);

router.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword
);


router.post(
  "/logout",
  authenticate,
  authController.logout
);


router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);


router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

export default router;