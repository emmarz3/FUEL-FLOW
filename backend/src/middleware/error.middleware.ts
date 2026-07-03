import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../config/logger";

interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { name: "CastError", message, statusCode: StatusCodes.NOT_FOUND };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { name: "DuplicateError", message, statusCode: StatusCodes.CONFLICT };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors).map((e: any) => e.message).join(", ");
    error = { name: "ValidationError", message, statusCode: StatusCodes.BAD_REQUEST };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { name: "JsonWebTokenError", message, statusCode: StatusCodes.UNAUTHORIZED };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { name: "TokenExpiredError", message, statusCode: StatusCodes.UNAUTHORIZED };
  }

  res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: error.message || "Server Error",
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ApiError;
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

