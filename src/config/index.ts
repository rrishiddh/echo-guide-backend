import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL as string,
  
  jwt_secret: process.env.JWT_SECRET as string,
  jwt_expires: process.env.JWT_EXPIRES_IN || "10d",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  
  stripe_secret: process.env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  
  cloudinary_cloud: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_secret: process.env.CLOUDINARY_API_SECRET,
  
  client_url: process.env.CLIENT_URL || "http://localhost:3000",
  
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,
  
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};