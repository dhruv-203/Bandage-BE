import { Router } from "express";
import { OrderController } from "../controllers/orders.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const orderRouter = Router();

orderRouter.post("/placeOrder", verifyUser, OrderController.placeOrder);

export { orderRouter };
