import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "../models/User";
import env from "../config/env";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  // Generate access token
  generateAccessToken(user: IUser): string {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  // Generate refresh token
  generateRefreshToken(user: IUser): string {
    const payload = {
      id: user._id,
      email: user.email,
    };
    
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  // Generate both tokens
  generateTokens(user: IUser): TokenResponse {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return { accessToken, refreshToken };
  }

  // Hash token for storage
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  // Verify refresh token
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Store reset token in user document
    // Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  // Verify email
  async verifyEmail(email: string): Promise<void> {
    // Implementation for email verification
  }
}

export default new AuthService();
