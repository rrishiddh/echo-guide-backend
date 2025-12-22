import Stripe from "stripe";
import config from "./index";
import { logger } from "./logger";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";


let stripe: Stripe | null = null;

const initializeStripe = (): boolean => {
  if (!config.stripe_secret) {
    logger.warn("Stripe secret key not found. Payment processing will be disabled.");
    return false;
  }

  try {
    stripe = new Stripe(config.stripe_secret, {
      apiVersion: "2025-11-17.clover", 
      typescript: true,
    });

    logger.info("Stripe initialized successfully");
    return true;
  } catch (error) {
    logger.error("Failed to initialize Stripe:", error);
    return false;
  }
};

const isStripeEnabled = initializeStripe();


export const getStripeInstance = (): Stripe => {
  if (!stripe || !isStripeEnabled) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Payment service is not available"
    );
  }
  return stripe;
};


export const createPaymentIntent = async (
  amount: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  const stripeInstance = getStripeInstance();

  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info(`Payment Intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error: any) {
    logger.error("Stripe Payment Intent creation error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment creation failed: ${error.message}`
    );
  }
};


// export const confirmPaymentIntent = async (
//   paymentIntentId: string
// ): Promise<Stripe.PaymentIntent> => {
//   const stripeInstance = getStripeInstance();

//   try {
//     const paymentIntent = await stripeInstance.paymentIntents.confirm(
//       paymentIntentId
//     );

//     logger.info(`Payment Intent confirmed: ${paymentIntentId}`);
//     return paymentIntent;
//   } catch (error: any) {
//     logger.error("Stripe Payment confirmation error:", error);
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       `Payment confirmation failed: ${error.message}`
//     );
//   }
// };


export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  const stripeInstance = getStripeInstance();

  try {
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(
      paymentIntentId
    );
    return paymentIntent;
  } catch (error: any) {
    logger.error("Stripe Payment retrieval error:", error);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Payment not found: ${error.message}`
    );
  }
};


export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  const stripeInstance = getStripeInstance();

  try {
    const paymentIntent = await stripeInstance.paymentIntents.cancel(
      paymentIntentId
    );

    logger.info(`Payment Intent cancelled: ${paymentIntentId}`);
    return paymentIntent;
  } catch (error: any) {
    logger.error("Stripe Payment cancellation error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment cancellation failed: ${error.message}`
    );
  }
};


export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  const stripeInstance = getStripeInstance();

  try {
    const refund = await stripeInstance.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    logger.info(`Refund created: ${refund.id} for Payment Intent: ${paymentIntentId}`);
    return refund;
  } catch (error: any) {
    logger.error("Stripe Refund creation error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Refund creation failed: ${error.message}`
    );
  }
};


export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
): Stripe.Event => {
  const stripeInstance = getStripeInstance();

  if (!config.stripe_webhook_secret) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Webhook secret not configured"
    );
  }

  try {
    const event = stripeInstance.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret
    );

    logger.info(`Webhook verified: ${event.type}`);
    return event;
  } catch (error: any) {
    logger.error("Stripe Webhook verification error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook verification failed: ${error.message}`
    );
  }
};


export const createCustomer = async (
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> => {
  const stripeInstance = getStripeInstance();

  try {
    const customer = await stripeInstance.customers.create({
      email,
      name,
      metadata,
    });

    logger.info(`Customer created: ${customer.id}`);
    return customer;
  } catch (error: any) {
    logger.error("Stripe Customer creation error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Customer creation failed: ${error.message}`
    );
  }
};

export const retrieveCustomer = async (
  customerId: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> => {
  const stripeInstance = getStripeInstance();

  try {
    const customer = await stripeInstance.customers.retrieve(customerId);
    return customer;
  } catch (error: any) {
    logger.error("Stripe Customer retrieval error:", error);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Customer not found: ${error.message}`
    );
  }
};

export default {
  getStripeInstance,
  createPaymentIntent,
  // confirmPaymentIntent,
  retrievePaymentIntent,
  cancelPaymentIntent,
  createRefund,
  verifyWebhookSignature,
  createCustomer,
  retrieveCustomer,
};