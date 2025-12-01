import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expires: "10d",
  stripe_secret: process.env.STRIPE_SECRET_KEY,

  cloudinary_cloud: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_secret: process.env.CLOUDINARY_API_SECRET
};
