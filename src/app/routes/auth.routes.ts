import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { uploader } from "../middlewares/multer.middleware";
const router = Router();

function handler(req: Request, res: Response, next: NextFunction) {
  res.status(200);
  return res.json("message");
}
router.get("/register", handler);
// function(req, res){
//   return res.send("Jelo")
// }
router.post("/", (req: Request, res: Response) => {
  console.log("Welcome");
  res.status(200).json("Welcome");
});
router.post("/register", uploader("ProfilePhoto"), AuthController.registerUser);

//note: add Content-Type: application/json while sending request
router.post("/login", AuthController.loginUser);
router.post("/logout", verifyUser, AuthController.logoutUser);
router.post("/refreshToken", AuthController.regenerateRefreshToken);
router.post("/checkUser", verifyUser, AuthController.checkUser);
export { router as authRouter };
