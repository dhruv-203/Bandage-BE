import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { placeOrder as placeOrderService } from "../services/orders.service";

export class OrderController {
  static async placeOrder(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized Access", []));
    }
    const { shippingAddress } = req.body;
    console.log(shippingAddress);
    if (!shippingAddress || (shippingAddress as string).trim() === "") {
      return next(
        new ApiError(
          404,
          "Bad Request provide appropriate shipping address",
          []
        )
      );
    }

    const response = await placeOrderService(user.id, shippingAddress);
    if (response instanceof ApiError) {
      return next(response);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Order Placed Successfully"));
  }
}
