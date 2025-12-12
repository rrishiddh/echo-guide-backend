import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ValueDeterminingMiddleware } from "express-rate-limit";
import { ParsedQs } from "qs";
import routes from "./routes";
import globalErrorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";
import dotenv from 'dotenv';

const app: Application = express();
dotenv.config();

app.set("trust proxy", true); 

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);
app.options("*", cors());
type CustomRequest = Request<
    Record<string, string>, 
    any, 
    any, 
    ParsedQs, 
    Record<string, any>
>;

const keyGenerator: ValueDeterminingMiddleware<string> = (req: CustomRequest) => {
    const ip = req.ip 
        || (req.headers['x-real-ip'] as string | undefined) 
        || req.socket.remoteAddress;

    return ip ?? 'unknown_client_ip'; 
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later.",
  keyGenerator: keyGenerator,
});

app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is running!" });
});

app.use("/api", routes);

app.use(notFound);

app.use(globalErrorHandler);

export default app;