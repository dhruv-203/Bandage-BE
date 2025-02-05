import bcrypt from "bcrypt";
import { isNotEmptyObject } from "class-validator";
import { AppDataSource } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { uploadOnCloudinary } from "../../utils/uploadOnCloudinary";
import { Products } from "../entities/Products";
import { User } from "../entities/User";
import { isUniqueUser } from "./auth.service";

export async function updateUserProfile(
  oldEmail: string,
  Email: string,
  Name: string,
  ProfilePhoto: Express.Multer.File
) {
  try {
    // email already exists?
    console.log(oldEmail, Email);
    if (oldEmail !== Email) {
      let check = await isUniqueUser(Email);
      if (check instanceof ApiError) {
        return check;
      }
      if (!check) {
        return new ApiError(401, "Email is already used", []);
      }
    }

    const oldUser = await AppDataSource.getRepository(User).findOne({
      where: {
        email: oldEmail,
      },
      relations: {
        cart: true,
        addresses: true,
        orders: true,
      },
      order: {
        orders: {
          orderDate: "DESC",
        },
      },
    });

    // uploading user uploaded file on cloudinary
    if (ProfilePhoto) {
      const response = await uploadOnCloudinary(ProfilePhoto.path);
      if (isNotEmptyObject(response)) {
        oldUser.profilePhoto = response.secure_url;
      } else {
        return new ApiError(
          500,
          "Internal Server Error: Image Upload Failed",
          []
        );
      }
    }
    oldUser.email = Email;
    oldUser.name = Name;
    try {
      const newUser = await oldUser.save();
      return newUser;
    } catch (err) {
      return new ApiError(500, "Error updating user, data didn't saved", [err]);
    }
  } catch (error) {
    return new ApiError(404, "Error fetching user with this email", []);
  }
}

export async function updateUserPassword(
  email: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        email: email,
      },
    });
    // current password matched the actual password and now you can change the password
    const check = await user.checkPassword(currentPassword);
    if (!check) {
      return new ApiError(
        401,
        "Current Password doesn't matched with actual password",
        []
      );
    }
    user.password = await bcrypt.hash(newPassword, 10);
    try {
      user.save();
    } catch (error) {
      return new ApiError(500, "Error while saving new password to db", []);
    }
    return new ApiResponse(
      200,
      { success: true },
      "Password Change Successfully"
    );
  } catch (error) {
    return new ApiError(500, "Error Fetching User in change password", [error]);
  }
}

export async function checkIfProductExists(productId: string) {
  try {
    const check = await AppDataSource.getRepository(Products).exists({
      where: { id: productId },
    });
    return check;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}

export async function addToWishlist(
  userId: string,
  productId: string,
  isExists: boolean
) {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: {
        addresses: true,
        cart: true,
        orders: true,
      },
      order: {
        orders: {
          orderDate: "DESC",
        },
      },
    });
    if (!user) {
      return new ApiError(404, "User not found", []);
    }
    // if isExists is true then remove the product from wishlist
    if (isExists) {
      user.wishlist = user.wishlist.filter((item) => item !== productId);
    } else {
      // if isExists is false then add the product to wishlist
      user.wishlist.push(productId);
    }
    user.save();
    return user;
  } catch (error) {
    return new ApiError(500, "Internal Server Error", [error]);
  }
}
