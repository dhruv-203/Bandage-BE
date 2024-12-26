import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  addToWishlist,
  checkIfProductExists,
  updateUserPassword,
  updateUserProfile,
} from "../services/user.service";
export class UserController {
  static updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.user) {
      const { Name, Email } = req.body;
      const ProfilePhoto = req.file;
      const oldEmail = req.user.email;
      const user = await updateUserProfile(oldEmail, Email, Name, ProfilePhoto);
      if (user instanceof ApiError) {
        return next(user);
      } else {
        return res
          .status(200)
          .json(new ApiResponse(200, { user }, "Updation Successful"));
      }
    } else {
      return next(
        new ApiError(500, "User not found after verify middleware executed", [])
      );
    }
  };

  static updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (req.user) {
      console.log("hello");
      const { currentPassword, newPassword } = req.body;
      console.log(currentPassword, newPassword);
      const response = await updateUserPassword(
        req.user.email,
        currentPassword,
        newPassword
      );
      if (response instanceof ApiError) {
        return next(response);
      }
      res.status(200).json({ ...response });
    } else {
      return next(
        new ApiError(500, "User not found after verify middleware executed", [])
      );
    }
  };

  static addToWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // add to wishlist
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, "Unauthorized", []));
    }
    const { productId } = req.params;
    if (!productId) {
      return next(new ApiError(400, "Product ID is required", []));
    }
    //obtain isExists from the request body
    const isExists = req.body.isExists;
    //check if isExists is valid boolean value
    if (typeof isExists !== "boolean") {
      return next(new ApiError(400, "isExists should be a boolean value", []));
    }
    // check if product exists
    const check = await checkIfProductExists(productId);
    if (check instanceof ApiError) {
      return next(check);
    }
    if (!check) {
      return next(new ApiError(404, "Product not found", []));
    }
    // add to wishlist
    const response = await addToWishlist(user.id, productId, isExists);
    if (response instanceof ApiError) {
      return next(response);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          `Product ${isExists ? "removed from" : "added to"} wishlist`
        )
      );
  };
}
