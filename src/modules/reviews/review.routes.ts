import express from "express";
import reviewController from "./review.controller";
import authenticate from "../../middlewares/auth";
import { authorize } from "../../middlewares/roleCheck";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validateRequest";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  reviewIdParamSchema,
  reportReviewSchema,
  markHelpfulSchema,
  hideReviewSchema,
} from "./review.validation";

const router = express.Router();


router.get(
  "/listing/:listingId",
  validateQuery(reviewQuerySchema),
  reviewController.getReviewsByListing
);


router.get(
  "/guide/:guideId",
  validateQuery(reviewQuerySchema),
  reviewController.getReviewsByGuide
);


router.get(
  "/guide/:guideId/summary",
  reviewController.getGuideReviewSummary
);


router.get(
  "/admin/stats",
  authenticate,
  authorize("admin"),
  reviewController.getReviewStats
);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  validateQuery(reviewQuerySchema),
  reviewController.getAllReviews
);


router.patch(
  "/:id/visibility",
  authenticate,
  authorize("admin"),
  validateParams(reviewIdParamSchema),
  validateBody(hideReviewSchema),
  reviewController.toggleReviewVisibility
);


router.post(
  "/",
  authenticate,
  authorize("tourist"),
  validateBody(createReviewSchema),
  reviewController.createReview
);


router.get(
  "/my-reviews",
  authenticate,
  validateQuery(reviewQuerySchema),
  reviewController.getMyReviews
);


router.get(
  "/:id",
  validateParams(reviewIdParamSchema),
  reviewController.getReviewById
);


router.patch(
  "/:id",
  authenticate,
  authorize("tourist"),
  validateParams(reviewIdParamSchema),
  validateBody(updateReviewSchema),
  reviewController.updateReview
);


router.delete(
  "/:id",
  authenticate,
  authorize("tourist"),
  validateParams(reviewIdParamSchema),
  reviewController.deleteReview
);


router.post(
  "/:id/helpful",
  authenticate,
  validateParams(reviewIdParamSchema),
  validateBody(markHelpfulSchema),
  reviewController.markReviewHelpful
);


router.post(
  "/:id/report",
  authenticate,
  validateParams(reviewIdParamSchema),
  validateBody(reportReviewSchema),
  reviewController.reportReview
);

export default router;