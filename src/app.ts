import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { ErrorHandler } from "./app/middlewares/errorHandler.middleware";
import { authRouter } from "./app/routes/auth.routes";
import { cartRouter } from "./app/routes/cart.routes";
import { orderRouter } from "./app/routes/orders.routes";
import { productsRouter } from "./app/routes/products.routes";
import { userRouter } from "./app/routes/user.routes";
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

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);

app.use(
  ErrorHandler as (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void
);
export { app };
