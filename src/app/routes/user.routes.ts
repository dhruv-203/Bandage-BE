// import { Router } from "express";
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { verifyUser } from "../middlewares/auth.middleware";
import { uploader } from "../middlewares/multer.middleware";
const router = Router();

router.post(
  "/updateProfile",
  verifyUser,
  uploader("ProfilePhoto"),
  UserController.updateProfile
);

router.post("/updatePassword", verifyUser, UserController.updatePassword);
router.post("/:productId", verifyUser ,UserController.addToWishlist);

export { router as userRouter };
