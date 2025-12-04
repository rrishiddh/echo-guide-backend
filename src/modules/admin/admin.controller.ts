import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import adminService from "./admin.service";


const getDashboardOverview = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const result = await adminService.getDashboardOverview(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    successResponse(
      res,
      result,
      "Dashboard overview retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getAnalytics = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const period = (req.query.period as string) || "month";

    const result = await adminService.getAnalytics(period);

    successResponse(
      res,
      result,
      "Analytics data retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const bulkUpdateUsers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { ids, action } = req.body;

    const result = await adminService.bulkUpdateUsers(ids, action);

    successResponse(
      res,
      result,
      `Bulk ${action} completed successfully`,
      null,
      httpStatus.OK
    );
  }
);


const bulkUpdateListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { ids, action } = req.body;

    const result = await adminService.bulkUpdateListings(ids, action);

    successResponse(
      res,
      result,
      `Bulk ${action} completed successfully`,
      null,
      httpStatus.OK
    );
  }
);

const getSystemHealth = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.getSystemHealth();

    successResponse(
      res,
      result,
      "System health retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getReportedContent = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.getReportedContent();

    successResponse(
      res,
      result,
      "Reported content retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const generateReport = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    const result = await adminService.generateReport(
      type,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    successResponse(
      res,
      result,
      `${type} report generated successfully`,
      null,
      httpStatus.OK
    );
  }
);

export default {
  getDashboardOverview,
  getAnalytics,
  bulkUpdateUsers,
  bulkUpdateListings,
  getSystemHealth,
  getReportedContent,
  generateReport,
};