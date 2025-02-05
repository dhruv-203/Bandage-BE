import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
 secure: process.env.ENVIRONMENT === "PRODUCTION"
};
