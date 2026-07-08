const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const adminController = require("../controllers/adminController");
const handleValidationErrors = require("../middleware/handleValidationErrors");
const {
  adminLocationValidators,
  adminStaffValidators
} = require("../middleware/inputValidationMiddleware");

router.get("/users", authMiddleware, requireAdmin, adminController.getUsers);
router.delete("/users/:email", authMiddleware, requireAdmin, adminController.deleteUser);
router.get("/events", authMiddleware, requireAdmin, adminController.getEvents);
router.delete("/events/:id", authMiddleware, requireAdmin, adminController.deleteEvent);
router.post("/locations", authMiddleware, requireAdmin, adminLocationValidators, handleValidationErrors, adminController.createLocation);
router.delete("/locations/:id", authMiddleware, requireAdmin, adminController.deleteLocation);
router.post("/staff", authMiddleware, requireAdmin, adminStaffValidators, handleValidationErrors, adminController.createStaff);
router.delete("/staff/:id", authMiddleware, requireAdmin, adminController.deleteStaff);
router.get('/users/:email/events-count', authMiddleware, requireAdmin, adminController.getUserEventsCount);

module.exports = router;
