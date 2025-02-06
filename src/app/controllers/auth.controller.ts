import { isEmail } from "class-validator";
import { NextFunction, Request, response, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { cookieOptions } from "../../utils/cookieOptions";
import { validateData } from "../../utils/validateData";
import { User } from "../entities/User";
import {
  authenticateRefreshToken,
  createNewUser,
  generateAccessAndRefreshToken,
  isUniqueUser,
  resetRefreshToken,
  userExistsAndPassMatch,
} from "../services/auth.service";
export class AuthController {
  // destructure this options to add the expiry of the cookie as this a basic reusable template

  static async registerUser(req: Request, res: Response, next: NextFunction) {
    const { Name, Email, Password } = req.body;
    const newUser = new User();
    newUser.name = Name;
    newUser.email = Email;
    newUser.password = Password;
    newUser.addresses = [];
    //validate user
    const isError = await validateData(newUser);
    if (isError !== null) {
      return next(isError);
    }

    //get unique user
    const user = await isUniqueUser(newUser.email);
    if (user instanceof ApiError) {
      return next(user);
    }
    if (user) {
      if (req.file) {
        const response = await createNewUser(Name, Email, Password, req.file);
        if (response instanceof ApiError) {
          return next(response);
        }
        return res
          .status(200)
          .cookie("AccessToken", response.accessToken, {
            ...cookieOptions,
            maxAge: 24 * (60 * 60) * 1000, // 24 hrs
          })
          .cookie("RefreshToken", response.refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * (60 * 60) * 1000, // 30 days
          })
          .json(
            new ApiResponse(200, { ...response }, "Successfully Registered")
          );
      } else {
        return next(
          new ApiError(404, "Profile Photo has not been uploaded", [])
        );
      }
    } else {
      return next(
        new ApiError(409, "User with this email already exists", null)
      );
    }
  }

  static async loginUser(req: Request, res: Response, next: NextFunction) {
    // user data obtain
    const { Email, Password } = req.body;
    // validate for being non-empty and email verification
    if (!Email || !Password || Email === "" || Password === "") {
      return next(
        new ApiError(401, "Unauthorised Access: Missing Credentials", [])
      );
    }
    if (!isEmail(Email)) {
      return next(
        new ApiError(401, "Unauthorised Access: Enter Valid Email", [])
      );
    }
    // check if user exists or not and check password matching
    const check = await userExistsAndPassMatch(Email, Password);
    if (check instanceof ApiError) {
      return next(check);
    } else {
      // access token and refresh token generate and assign new refreshtoken to the user table
      const respon = await generateAccessAndRefreshToken(Email);
      if (respon instanceof ApiError) {
        return next(response);
      }
      const { responseUser, AT, RT } = respon;
      const { password, refreshToken, ...user } = responseUser;
      // send cookie and success status with a user object
      return res
        .status(200)
        .cookie("AccessToken", AT, {
          ...cookieOptions,
          maxAge: 24 * 60 * 60 * 1000, //24hrs
        })
        .cookie("RefreshToken", RT, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, //30d
        })
        .json(
          new ApiResponse(
            200,
            {
              user,
              accessToken: AT,
              refreshToken: RT,
            },
            "Login Successful"
          )
        );
    }
  }

  // logout controller remains the jwt verify middleware is setup
  static async logoutUser(req: Request, res: Response, next: NextFunction) {
    // verify its an authorised user
    // obtain the user from the req object
    // and reset the refresh token by setting it null
    // make the access token in the cookies null
    // return the response success
    if (req.user) {
      const response = await resetRefreshToken(req.user.email);
      if (response instanceof ApiError) {
        return next(res);
      }
      res
        .status(200)
        .clearCookie("AccessToken", {
          ...cookieOptions,
        })
        .clearCookie("RefreshToken", {
          ...cookieOptions,
        })
        .json(new ApiResponse(200, {}, "Logout Successful"));
    } else {
      return next(
        new ApiError(
          401,
          "Unauthorised request: You are not an authorised user to perform this access",
          []
        )
      );
    }
  }

  static async regenerateRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const refreshToken = req.cookies?.RefreshToken;
    if (!refreshToken) {
      return next(
        new ApiError(401, "Unauthorised Access, missing refresh token", [])
      );
    }
    try {
      const { id } = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as JwtPayload;
      const response = await authenticateRefreshToken(id, refreshToken);
      if (response instanceof ApiError) {
        return next(response);
      }
      res
        .status(200)
        .cookie("AccessToken", response.AT, {
          ...cookieOptions,
          maxAge: 24 * 60 * 60 * 1000, //24 hrs
        })
        .cookie("RefreshToken", response.RT, {
          ...cookieOptions,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
        })
        .json({
          accessToken: response.AT,
          refreshToken: response.RT,
        });
    } catch (error) {
      return next(
        new ApiError(401, "Refresh Token verification failed", [error])
      );
    }
  }

  static async checkUser(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
      const { password, refreshToken, ...user } = req.user;
      res.status(200).json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken: req.cookies.AccessToken,
            responseToken: req.cookies.responseToken,
          },
          "User Exists"
        )
      );
    }
  }
}
