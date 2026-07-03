import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "express-async-errors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import env from "./config/env";
import logger from "./config/logger";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import paymentRoutes from "./routes/payment.routes";
import cardRoutes from "./routes/card.routes";
import deliveryRoutes from "./routes/delivery.routes";
import vendorRoutes from "./routes/vendor.routes";
import driverRoutes from "./routes/driver.routes";
import webhookRoutes from "./routes/webhook.routes";
import analyticsRoutes from "./routes/analytics.routes";
import adminRoutes from "./routes/admin.routes";

// Middleware
import { errorHandler } from "./middleware/error.middleware";
import { notFound } from "./middleware/notFound.middleware";

// Initialize dotenv
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.PAYMENT_RETRY_DELAY_1_HOURS * 60 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "FuelFlow API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
const apiVersion = `/api/${env.API_VERSION}`;

app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/users`, userRoutes);
app.use(`${apiVersion}/subscriptions`, subscriptionRoutes);
app.use(`${apiVersion}/payments`, paymentRoutes);
app.use(`${apiVersion}/cards`, cardRoutes);
app.use(`${apiVersion}/deliveries`, deliveryRoutes);
app.use(`${apiVersion}/vendors`, vendorRoutes);
app.use(`${apiVersion}/drivers`, driverRoutes);
app.use(`${apiVersion}/webhooks`, webhookRoutes);
app.use(`${apiVersion}/analytics`, analyticsRoutes);
app.use(`${apiVersion}/admin`, adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to database and start server
const PORT = env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API Version: ${apiVersion}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
});

export default app;

