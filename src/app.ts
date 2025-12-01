import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import globalErrorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: "Too many requests from this IP, please try again later.",
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