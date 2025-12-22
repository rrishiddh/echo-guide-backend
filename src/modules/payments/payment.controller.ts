import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import paymentService from "./payment.service";
import { verifyWebhookSignature } from "../../config/payment";
import { logger } from "../../config/logger";


const createPaymentIntent = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    const result = await paymentService.createPaymentIntent(touristId, req.body);

    successResponse(
      res,
      result,
      "Payment intent created successfully",
      null,
      httpStatus.CREATED
    );
  }
);


// const confirmPayment = catchAsync(
//   async (req: Request, res: Response, _next: NextFunction) => {
//     const touristId = req.user!.userId;
//     const result = await paymentService.confirmPayment(touristId, req.body);

//     successResponse(
//       res,
//       result,
//       "Payment confirmed successfully!",
//       null,
//       httpStatus.OK
//     );
//   }
// );

const getPaymentById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await paymentService.getPaymentById(req.params.id);

    successResponse(
      res,
      result,
      "Payment retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getAllPayments = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await paymentService.getAllPayments(req.query);

    successResponse(
      res,
      result.payments,
      "Payments retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);

const getMyPayments = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    const result = await paymentService.getTouristPayments(touristId, req.query);

    successResponse(
      res,
      result.payments,
      "Your payments retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);

const getGuideEarnings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const guideId = req.user!.userId;
    const result = await paymentService.getGuidePayments(guideId, req.query);

    successResponse(
      res,
      result.payments,
      "Earnings retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const refundPayment = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await paymentService.refundPayment(req.params.id, req.body);

    successResponse(
      res,
      result,
      "Payment refunded successfully",
      null,
      httpStatus.OK
    );
  }
);


const getPaymentStats = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await paymentService.getPaymentStats();

    successResponse(
      res,
      result,
      "Payment statistics retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const handleWebhook = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Missing stripe-signature header",
      });
    }

    try {
      const event = verifyWebhookSignature(req.body, signature);

      await paymentService.handleWebhookEvent(event);

      return res.status(httpStatus.OK).json({ received: true });
    } catch (error: any) {
      logger.error("Webhook error:", error);
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: `Webhook Error: ${error.message}`,
      });
    }
  }
);


export default {
  createPaymentIntent,
  // confirmPayment,
  getPaymentById,
  getAllPayments,
  getMyPayments,
  getGuideEarnings,
  refundPayment,
  getPaymentStats,
  handleWebhook,
};