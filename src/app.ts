import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "./app/middlewares/errorHandler.middleware";
import { authRouter } from "./app/routes/auth.routes";
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const handler = (req: Request, res: Response, next: NextFunction) => {
  console.log("Visited:", req.path);
  return res.status(200).json("Okay");
};

app.get("/", handler);
app.use("/auth", authRouter);

app.use(
  ErrorHandler as (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void
);
export { app };
