import { createClient } from "redis";
import crypto from "crypto";

class OTPService {
  constructor() {
    this.client = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    this.client.on("error", (err) => {
    console.log("❌ Redis Client Error:", err);
  });

  this.connectRedis();
}

async connectRedis() {
  try {
    await this.client.connect();
    console.log("✅ Redis Connected Successfully!");
  } catch (err) {
    console.log("❌ Failed to connect Redis:", err);
  }
}

  // Generate OTP (6 digit)
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash OTP for security
  hashOTP(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  // Send OTP to Redis with TTL (Time To Live) - 10 minutes expiry
  async sendOTP(email) {
    try {
      const otp = this.generateOTP();
      const hashedOTP = this.hashOTP(otp);
      const key = `otp:${email}`;
      const ttl = 180; // 3 minutes in seconds

      // Store hashed OTP in Redis
      await this.client.setEx(key, ttl, hashedOTP);

      return {
        success: true,
        otp: otp, // Return actual OTP to send via email
        message: "OTP generated successfully",
      };
    } catch (error) {
      console.log("Error generating OTP:", error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const key = `otp:${email}`;
      const hashedOTP = this.hashOTP(otp);

      // Get stored OTP from Redis
      const storedHashedOTP = await this.client.get(key);
      console.log("DEBUG:", { email, otp, hashedOTP, storedHashedOTP });

      if (!storedHashedOTP) {
        return {
          success: false,
          message: "OTP expired or not found",
        };
      }

      // Compare hashes
      if (storedHashedOTP === hashedOTP) {
        // Delete OTP after successful verification
        await this.client.del(key);
        return {
          success: true,
          message: "OTP verified successfully",
        };
      }

      return {
        success: false,
        message: "Invalid OTP",
      };
    } catch (error) {
      console.log("Error verifying OTP:", error);
      throw error;
    }
  }

  // Check if OTP exists (for checking if already registered)
  async otpExists(email) {
    try {
      const key = `otp:${email}`;
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.log("Error checking OTP existence:", error);
      throw error;
    }
  }

  // Delete OTP (manual cleanup)
  async deleteOTP(email) {
    try {
      const key = `otp:${email}`;
      await this.client.del(key);
    } catch (error) {
      console.log("Error deleting OTP:", error);
      throw error;
    }
  }

  // Close Redis connection
  async closeConnection() {
    await this.client.quit();
  }
}

export const otpService = new OTPService();
