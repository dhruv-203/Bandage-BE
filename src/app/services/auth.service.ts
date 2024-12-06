import bcrypt from "bcrypt";
import { isNotEmptyObject } from "class-validator";
import { AppDataSource } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { IdGenerator } from "../../utils/idGenerate";
import { uploadOnCloudinary } from "../../utils/uploadOnCloudinary";
import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
export async function isUniqueUser(email: string) {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      email: email,
    });
    if (user) {
      return false;
    }
    return true;
  } catch (error) {
    return new ApiError(500, "Unexpected Error Occured", [error]);
  }
}

export async function userExistsAndPassMatch(email: string, password: string) {
  const user = await AppDataSource.getRepository(User).findOneBy({ email });
  if (!user) {
    return new ApiError(404, "User with this email doesn't exists", []);
  }
  const check = await user.checkPassword(password);
  if (!check) {
    return new ApiError(401, "Invalid Credentials", []);
  }
  return check;
}

//use this for login functionality
export async function generateAccessAndRefreshToken(email: string) {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      email,
    });
    if (!user) {
      return new ApiError(
        404,
        "Error generating Access Token and Refresh Token, No user found of this Email",
        []
      );
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    try {
      await user.save();
    } catch (error) {
      return new ApiError(
        500,
        "Internal server error, while saving refresh token in DB",
        [error]
      );
    }
    return { responseUser: user, AT: accessToken, RT: refreshToken };
  } catch (err) {
    return new ApiError(
      500,
      "Internal Server Occured during access user information, can't connect to Database",
      [err]
    );
  }
}

export async function createNewUser(
  Name: string,
  Email: string,
  Password: string,
  profilePhoto: Express.Multer.File
) {
  const newUser = new User();
  const newCart = new Cart();
  newCart.id = IdGenerator(6);
  newUser.id = IdGenerator(6);
  newUser.name = Name;
  newUser.email = Email;
  newUser.password = await bcrypt.hash(Password, 10);
  newUser.cart = newCart;
  // uploading user uploaded file on cloudinary
  if (profilePhoto) {
    const response = await uploadOnCloudinary(profilePhoto.path);
    if (isNotEmptyObject(response)) {
      newUser.profilePhoto = response.secure_url;
    } else {
      return new ApiError(
        500,
        "Internal Server Error: Image Upload Failed",
        []
      );
    }
  } else {
    return new ApiError(400, "Profile photo was not uploaded", []);
  }

  // generating refresh token
  const accessToken = await newUser.generateAccessToken();
  const refreshToken = await newUser.generateRefreshToken();
  newUser.refreshToken = refreshToken;
  try {
    const { password, refreshToken, ...registeredUser } =
      await AppDataSource.getRepository(User).save(newUser);
    return { user: registeredUser, accessToken, refreshToken };
  } catch (err) {
    return new ApiError(500, "Internal server error, unable to create user", [
      err,
    ]);
  }
}
