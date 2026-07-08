const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const { signupValidators, loginValidators } = require('../middleware/inputValidationMiddleware');
const handleValidationErrors = require('../middleware/handleValidationErrors');

router.post("/register", signupValidators, handleValidationErrors, authController.register);
router.post("/login", loginValidators, handleValidationErrors, authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
