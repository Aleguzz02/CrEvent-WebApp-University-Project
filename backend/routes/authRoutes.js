const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const { signupValidators, loginValidators } = require('../middleware/inputValidationMiddleware');
const handleValidationErrors = require('../middleware/handleValidationErrors');

router.post("/register", signupValidators, handleValidationErrors, authController.register);
router.post("/login", loginValidators, handleValidationErrors, authController.login);

module.exports = router;