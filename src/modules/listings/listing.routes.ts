
import express from "express";
import listingController from "./listing.controller";
import authenticate from "../../middlewares/auth";
import { authorize, isGuide } from "../../middlewares/roleCheck";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validateRequest";
import { uploadMultiple } from "../../middlewares/uploadHandler";
import {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
  listingIdParamSchema,
} from "./listing.validation";

const router = express.Router();


router.get(
  "/search",
  validateQuery(listingQuerySchema),
  listingController.searchListings
);

router.get("/featured", listingController.getFeaturedListings);


router.get("/popular", listingController.getPopularListings);


router.get("/recent", listingController.getRecentListings);


router.get(
  "/guide/:guideId",
  validateQuery(listingQuerySchema),
  listingController.getListingsByGuide
);


router.get(
  "/:id",
  validateParams(listingIdParamSchema),
  listingController.getListingById
);



router.get(
  "/admin/stats",
  authenticate,
  authorize("admin"),
  listingController.getListingStats
);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  validateQuery(listingQuerySchema),
  listingController.getAllListings
);


router.delete(
  "/:id/permanent",
  authenticate,
  authorize("admin"),
  validateParams(listingIdParamSchema),
  listingController.permanentlyDeleteListing
);


router.post(
  "/",
  authenticate,
  isGuide,
  uploadMultiple("images", 10),
  validateBody(createListingSchema),
  listingController.createListing
);


router.patch(
  "/:id",
  authenticate,
  isGuide,
  uploadMultiple("images", 10),
  validateParams(listingIdParamSchema),
  validateBody(updateListingSchema),
  listingController.updateListing
);


router.delete(
  "/:id",
  authenticate,
  isGuide,
  validateParams(listingIdParamSchema),
  listingController.deleteListing
);

export default router;


