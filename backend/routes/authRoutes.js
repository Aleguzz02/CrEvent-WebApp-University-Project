const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const inputValidationMiddleware = require("../middleware/inputValidationMiddleware")

router.post("/register", inputValidationMiddleware, authController.register);
router.post("/login", inputValidationMiddleware, authController.login);

module.exports = router;