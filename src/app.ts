import express, { Application } from "express";
import cors from "cors";
import routes from "./routes";
import globalErrorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
