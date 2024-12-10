import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { User } from "../entities/User";
export async function verifyUser(
  req: Request,
  _: Response,
  next: NextFunction
) {
  const token: string =
    req.cookies?.AccessToken ||
    req.headers?.authorization?.replace("Bearer ", "");
  if (!token || token.trim() === "") {
    return next(new ApiError(404, "Unauthorised access: missing token", []));
  }
  try {
    const { id } = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;
    if (id) {
      const user = await AppDataSource.getRepository(User).findOneBy({ id });
      if (!user) {
        return next(new ApiError(404, "User not found on this access key", []));
      }
      req.user = user;
    } else {
      return next(new ApiError(500, "Unable to decode access token", []));
    }
  } catch (error) {
    return next(
      new ApiError(401, "Unauthorised access: invalid access token", [error])
    );
  }
  next();
}
