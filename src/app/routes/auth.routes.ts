import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { uploader } from "../middlewares/multer.middleware";
const router = Router();

router.post("/register", uploader("ProfilePhoto"), AuthController.registerUser);

//note: add Content-Type: application/json while sending request
router.post("/login", AuthController.loginUser);
router.post("/logout", verifyUser, AuthController.logoutUser);
router.post("/refreshToken", AuthController.regenerateRefreshToken);
router.post("/checkUser", verifyUser, AuthController.checkUser);
export { router as authRouter };
