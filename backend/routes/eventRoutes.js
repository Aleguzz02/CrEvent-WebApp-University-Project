const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventControllers");



module.exports = router;