import dotenv from "dotenv";

dotenv.config();

interface Environment {
  NODE_ENV: string;
  PORT: number;
  APP_URL: string;
  FRONTEND_URL: string;
  API_VERSION: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  MONGODB_URI: string;
  REDIS_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
  NOMBA_BASE_URL: string;
  NOMBA_PUBLIC_KEY: string;
  NOMBA_SECRET_KEY: string;
  NOMBA_INTEGRATION_ID: string;
  NOMBA_INTEGRATION_SECRET: string;
  WEBHOOK_SECRET: string;
  WEBHOOK_URL: string;
  PAYMENT_RETRY_ATTEMPTS: number;
  PAYMENT_RETRY_DELAY_1_HOURS: number;
  PAYMENT_RETRY_DELAY_2_HOURS: number;
  CARD_EXPIRY_NOTIFICATION_DAYS: number;
  CORS_ORIGIN: string;
  CLIENT_URL: string;
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;
  PETROL_PRICE_PER_LITER: number;
  DIESEL_PRICE_PER_LITER: number;
  LPG_PRICE_PER_KG: number;
  PLAN_WEEKLY_AMOUNT: number;
  PLAN_BIWEEKLY_AMOUNT: number;
  PLAN_MONTHLY_AMOUNT: number;
  PLAN_QUARTERLY_AMOUNT: number;
}

const env: Environment = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  APP_URL: process.env.APP_URL || "http://localhost:5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  API_VERSION: process.env.API_VERSION || "v1",
  JWT_SECRET: process.env.JWT_SECRET || "default-jwt-secret-change-in-production",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default-refresh-secret-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/fuelflow_africa",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587", 10),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  NOMBA_BASE_URL: process.env.NOMBA_BASE_URL || "https://api.nomba.dev",
  NOMBA_PUBLIC_KEY: process.env.NOMBA_PUBLIC_KEY || "",
  NOMBA_SECRET_KEY: process.env.NOMBA_SECRET_KEY || "",
  NOMBA_INTEGRATION_ID: process.env.NOMBA_INTEGRATION_ID || "",
  NOMBA_INTEGRATION_SECRET: process.env.NOMBA_INTEGRATION_SECRET || "",
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "webhook-secret",
  WEBHOOK_URL: process.env.WEBHOOK_URL || "http://localhost:5000/api/webhooks/nomba",
  PAYMENT_RETRY_ATTEMPTS: parseInt(process.env.PAYMENT_RETRY_ATTEMPTS || "3", 10),
  PAYMENT_RETRY_DELAY_1_HOURS: parseInt(process.env.PAYMENT_RETRY_DELAY_1_HOURS || "24", 10),
  PAYMENT_RETRY_DELAY_2_HOURS: parseInt(process.env.PAYMENT_RETRY_DELAY_2_HOURS || "72", 10),
  CARD_EXPIRY_NOTIFICATION_DAYS: parseInt(process.env.CARD_EXPIRY_NOTIFICATION_DAYS || "30", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || "10", 10),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || "100", 10),
  PETROL_PRICE_PER_LITER: parseInt(process.env.PETROL_PRICE_PER_LITER || "550", 10),
  DIESEL_PRICE_PER_LITER: parseInt(process.env.DIESEL_PRICE_PER_LITER || "520", 10),
  LPG_PRICE_PER_KG: parseInt(process.env.LPG_PRICE_PER_KG || "850", 10),
  PLAN_WEEKLY_AMOUNT: parseInt(process.env.PLAN_WEEKLY_AMOUNT || "15000", 10),
  PLAN_BIWEEKLY_AMOUNT: parseInt(process.env.PLAN_BIWEEKLY_AMOUNT || "28000", 10),
  PLAN_MONTHLY_AMOUNT: parseInt(process.env.PLAN_MONTHLY_AMOUNT || "55000", 10),
  PLAN_QUARTERLY_AMOUNT: parseInt(process.env.PLAN_QUARTERLY_AMOUNT || "150000", 10),
};

export default env;

