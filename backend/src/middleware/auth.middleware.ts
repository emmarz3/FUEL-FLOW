import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import User, { IUser } from "../models/User";
import env from "../config/env";
import { AppError } from "./error.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        env.JWT_SECRET
      ) as { id: string; role: string };

      req.user = await User.findById(decoded.id).select("-password -refreshToken");
      req.token = token;

      if (!req.user) {
        return next(new AppError("User no longer exists", StatusCodes.NOT_FOUND));
      }

      if (req.user.lockedUntil && req.user.lockedUntil > new Date()) {
        return next(
          new AppError(
            "Account is temporarily locked due to failed login attempts.",
            StatusCodes.FORBIDDEN
          )
        );
      }

      if (req.user.failedLoginAttempts > 0) {
        req.user.failedLoginAttempts = 0;
        req.user.lockedUntil = new Date();
        await req.user.save({ validateBeforeSave: false });
      }

      next();
    } catch (error) {
      return next(new AppError("Not authorized, token failed", StatusCodes.UNAUTHORIZED));
    }
  }

  if (!token) {
    return next(new AppError("Not authorized, no token", StatusCodes.UNAUTHORIZED));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authorized", StatusCodes.UNAUTHORIZED));
    }

    const userRoleName = (req.user.role as any).name || req.user.role;

    if (!roles.includes(userRoleName)) {
      return next(
        new AppError(
          `User role ${userRoleName} is not authorized`,
          StatusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
};
