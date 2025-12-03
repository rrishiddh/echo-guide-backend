import express from "express";
import userController from "./user.controller";
import authenticate from "../../middlewares/auth";
import { authorize, canAccessOwnResource } from "../../middlewares/roleCheck";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validateRequest";
import {
  updateUserSchema,
  userQuerySchema,
  userIdParamSchema,
  toggleUserStatusSchema,
  verifyUserSchema,
  changeRoleSchema,
} from "./user.validation";

const router = express.Router();


router.get(
  "/guides",
  validateQuery(userQuerySchema),
  userController.getAllGuides
);


router.get(
  "/guides/search",
  userController.searchGuides
);


router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  userController.getUserStats
);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  validateQuery(userQuerySchema),
  userController.getAllUsers
);


router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validateParams(userIdParamSchema),
  validateBody(toggleUserStatusSchema),
  userController.toggleUserStatus
);


router.patch(
  "/:id/verify",
  authenticate,
  authorize("admin"),
  validateParams(userIdParamSchema),
  validateBody(verifyUserSchema),
  userController.verifyUser
);


router.patch(
  "/:id/role",
  authenticate,
  authorize("admin"),
  validateParams(userIdParamSchema),
  validateBody(changeRoleSchema),
  userController.changeUserRole
);


router.delete(
  "/:id/permanent",
  authenticate,
  authorize("admin"),
  validateParams(userIdParamSchema),
  userController.permanentlyDeleteUser
);


router.get(
  "/:id",
  authenticate,
  validateParams(userIdParamSchema),
  userController.getUserById
);


router.patch(
  "/:id",
  authenticate,
  canAccessOwnResource,
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);


router.delete(
  "/:id",
  authenticate,
  canAccessOwnResource,
  validateParams(userIdParamSchema),
  userController.deleteUser
);

export default router;