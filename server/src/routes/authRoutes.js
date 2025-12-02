import { Router } from "express";
import AuthController from "../controllers/authController.js";
import upload from "../middlewares/upload.js";
import { authenticateJWT } from "../middlewares/jwtToken.js";

const router = Router();

// SIGNUP
router.post("/signup/owner", upload.single("license"), AuthController.signupOwner);
router.post("/signup/customer", AuthController.signupCustomer);

// LOGIN / LOGOUT
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// ME
router.get("/me", authenticateJWT, AuthController.getCurrentUser);

// PASSWORD RESET
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/reset-password", AuthController.resetPassword);

// GOOGLE LOGIN
router.post("/google", AuthController.googleLogin);

export default router;
