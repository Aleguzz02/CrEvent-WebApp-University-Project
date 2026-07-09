const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const handleValidationErrors = require("../middleware/handleValidationErrors");
const {
  signupValidators,
  loginValidators,
  requestOtpValidators,
  verifyOtpValidators,
  resetPasswordValidators
} = require("../middleware/inputValidationMiddleware");

router.post("/register", signupValidators, handleValidationErrors, authController.register);
router.post("/login", loginValidators, handleValidationErrors, authController.login);
router.get("/me", authMiddleware, authController.me);

// Nuove rotte per recupero password
router.post("/request-otp", requestOtpValidators, handleValidationErrors, authController.requestOtp);
router.post("/verify-otp", verifyOtpValidators, handleValidationErrors, authController.verifyOtp);
router.post("/reset-password", resetPasswordValidators, handleValidationErrors, authController.resetPassword);

module.exports = router;