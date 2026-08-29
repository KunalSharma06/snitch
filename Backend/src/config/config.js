import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error(
    "GOOGLE_CLIENT_ID is not defined in the environment variables",
  );
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in the environment variables",
  );
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error(
    "IMAGEKIT_PRIVATE_KEY is not defined in the environment variables",
  );
}

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error(
    "RAZORPAY_KEY_ID is not defined in the environment variables",
  );
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "RAZORPAY_KEY_SECRET is not defined in the environment variables",
  );
}

// Email configuration checks
if (!process.env.EMAIL_USER) {
  throw new Error("EMAIL_USER is not defined in the environment variables");
}

if (!process.env.EMAIL_PASSWORD) {
  throw new Error("EMAIL_PASSWORD is not defined in the environment variables");
}

if (!process.env.REDIS_HOST) {
  throw new Error("REDIS_HOST is not defined in the environment variables");
}

if (!process.env.REDIS_PORT) {
  throw new Error("REDIS_PORT is not defined in the environment variables");
}

if (!process.env.REDIS_USERNAME) {
  throw new Error("REDIS_USERNAME is not defined in the environment variables");
}

if (!process.env.REDIS_PASSWORD) {
  throw new Error("REDIS_PASSWORD is not defined in the environment variables");
}

if (!process.env.MISTRAL_API_KEY) {
  throw new Error(
    "MISTRAL_API_KEY is not defined in the environment variables",
  );
}

if (!process.env.GOOGLE_CALLBACK_URL) {
   throw new Error(
     "GOOGLE_CALLBACK_URL is not defined in the environment variables",
   );
}

if (!process.env.RESEND_API_KEY) {
   throw new Error(
     "RESEND_API_KEY is not defined in the environment variables",
   );
}

if (!process.env.RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not defined in the environment variables");
}
  export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    // Email configuration
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
    // Redis configuration
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_USERNAME: process.env.REDIS_USERNAME || "default",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  };
