const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

router.get("/myEvents", authMiddleware, eventController.getEvents);


module.exports = router;