import express from "express";
import adminController from "./admin.controller";
import authenticate from "../../middlewares/auth";
import { authorize } from "../../middlewares/roleCheck";
import { validateBody, validateQuery } from "../../middlewares/validateRequest";
import {
  dashboardQuerySchema,
  bulkActionSchema,
} from "./admin.validation";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));


router.get(
  "/dashboard",
  validateQuery(dashboardQuerySchema),
  adminController.getDashboardOverview
);


router.get("/analytics", adminController.getAnalytics);


router.post(
  "/users/bulk-update",
  validateBody(bulkActionSchema),
  adminController.bulkUpdateUsers
);


router.post(
  "/listings/bulk-update",
  validateBody(bulkActionSchema),
  adminController.bulkUpdateListings
);


router.get("/health", adminController.getSystemHealth);


router.get("/reported-content", adminController.getReportedContent);


router.get("/reports/:type", adminController.generateReport);

export default router;