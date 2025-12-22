import express from "express";
import authenticate from "../../middlewares/auth";
import { authorize, isGuide } from "../../middlewares/roleCheck";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validateRequest";
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  refundPaymentSchema,
  paymentQuerySchema,
  paymentIdParamSchema,
} from "./payment.validation";
import paymentController from "./payment.controller";

const router = express.Router();


router.post(
  "/webhook",
  express.raw({ type: "application/json" }), 
  paymentController.handleWebhook
);


router.get(
  "/admin/stats",
  authenticate,
  authorize("admin"),
  paymentController.getPaymentStats
);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  validateQuery(paymentQuerySchema),
  paymentController.getAllPayments
);

router.post(
  "/:id/refund",
  authenticate,
  authorize("admin"),
  validateParams(paymentIdParamSchema),
  validateBody(refundPaymentSchema),
  paymentController.refundPayment
);


router.post(
  "/create-intent",
  authenticate,
  authorize("tourist"),
  validateBody(createPaymentIntentSchema),
  paymentController.createPaymentIntent
);


// router.post(
//   "/confirm",
//   authenticate,
//   authorize("tourist"),
//   validateBody(confirmPaymentSchema),
//   paymentController.confirmPayment
// );


router.get(
  "/my-payments",
  authenticate,
  authorize("tourist"),
  validateQuery(paymentQuerySchema),
  paymentController.getMyPayments
);


router.get(
  "/earnings",
  authenticate,
  isGuide,
  validateQuery(paymentQuerySchema),
  paymentController.getGuideEarnings
);

router.get(
  "/:id",
  authenticate,
  validateParams(paymentIdParamSchema),
  paymentController.getPaymentById
);

export default router;