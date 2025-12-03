import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import authService from "./auth.service";


const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.register(req.body);

    successResponse(
      res,
      result,
      "Registration successful! Welcome aboard.",
      null,
      httpStatus.CREATED
    );
  }
);


const login = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.login(req.body);

    successResponse(
      res,
      result,
      "Login successful! Welcome back.",
      null,
      httpStatus.OK
    );
  }
);


const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    successResponse(
      res,
      result,
      "Access token refreshed successfully",
      null,
      httpStatus.OK
    );
  }
);


const getProfile = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    const result = await authService.getProfile(userId);

    successResponse(
      res,
      result,
      "Profile retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

const changePassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    await authService.changePassword(userId, req.body);

    successResponse(
      res,
      null,
      "Password changed successfully",
      null,
      httpStatus.OK
    );
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    await authService.logout(userId);

    successResponse(
      res,
      null,
      "Logout successful. See you again soon!",
      null,
      httpStatus.OK
    );
  }
);


const forgotPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    await authService.forgotPassword(email);

    successResponse(
      res,
      null,
      "If an account exists with this email, a password reset link has been sent.",
      null,
      httpStatus.OK
    );
  }
);


const resetPassword = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    successResponse(
      res,
      null,
      "Password reset successful. You can now login with your new password.",
      null,
      httpStatus.OK
    );
  }
);

export default {
  register,
  login,
  refreshAccessToken,
  getProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};