import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import userService from "./user.service";


const getUserById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.getUserById(req.params.id);

    successResponse(
      res,
      result,
      "User retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getAllUsers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.getAllUsers(req.query);

    successResponse(
      res,
      result.users,
      "Users retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const updateUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.updateUser(req.params.id, req.body);

    successResponse(
      res,
      result,
      "User profile updated successfully",
      null,
      httpStatus.OK
    );
  }
);


const deleteUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await userService.deleteUser(req.params.id);

    successResponse(
      res,
      null,
      "User account deactivated successfully",
      null,
      httpStatus.OK
    );
  }
);


const permanentlyDeleteUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await userService.permanentlyDeleteUser(req.params.id);

    successResponse(
      res,
      null,
      "User permanently deleted",
      null,
      httpStatus.OK
    );
  }
);


const toggleUserStatus = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.toggleUserStatus(
      req.params.id,
      req.body.isActive
    );

    successResponse(
      res,
      result,
      `User ${req.body.isActive ? "activated" : "deactivated"} successfully`,
      null,
      httpStatus.OK
    );
  }
);


const verifyUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.verifyUser(
      req.params.id,
      req.body.isVerified
    );

    successResponse(
      res,
      result,
      `User ${req.body.isVerified ? "verified" : "unverified"} successfully`,
      null,
      httpStatus.OK
    );
  }
);


const changeUserRole = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.changeUserRole(
      req.params.id,
      req.body.role
    );

    successResponse(
      res,
      result,
      `User role changed to ${req.body.role} successfully`,
      null,
      httpStatus.OK
    );
  }
);


const getUserStats = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.getUserStats();

    successResponse(
      res,
      result,
      "User statistics retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getAllGuides = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await userService.getAllGuides(req.query);

    successResponse(
      res,
      result.users,
      "Guides retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const searchGuides = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters = {
      languages: req.query.languages
        ? (req.query.languages as string).split(",")
        : undefined,
      expertise: req.query.expertise
        ? (req.query.expertise as string).split(",")
        : undefined,
      minRate: req.query.minRate
        ? parseFloat(req.query.minRate as string)
        : undefined,
      maxRate: req.query.maxRate
        ? parseFloat(req.query.maxRate as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await userService.searchGuides(filters);

    successResponse(
      res,
      result.users,
      "Guides search completed successfully",
      result.meta,
      httpStatus.OK
    );
  }
);

export default {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  permanentlyDeleteUser,
  toggleUserStatus,
  verifyUser,
  changeUserRole,
  getUserStats,
  getAllGuides,
  searchGuides,
};