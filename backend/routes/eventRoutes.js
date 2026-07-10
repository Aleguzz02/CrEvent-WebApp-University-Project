const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");
const eventOwnerMiddleware = require("../middleware/eventOwnerMiddleware");
const eventCreationMiddleware = require("../middleware/eventCreationMiddleware");
const staffProfileMiddleware = require("../middleware/staffProfileMiddleware");

router.get("/myEvents", authMiddleware, eventController.getEvents);
router.get("/location/free-dates", authMiddleware, eventController.getLocationFreeDates);
router.get('/location', authMiddleware, eventController.getLocations);
router.get(
  '/event/:id',
  authMiddleware,
  eventOwnerMiddleware,
  eventController.getEventDetail
);

router.get('/staff/events', authMiddleware, staffProfileMiddleware, eventController.getStaffEvents);
router.get('/staff', authMiddleware, eventController.getAvailableStaff);
router.post('/create', authMiddleware, eventCreationMiddleware, eventController.createEvent);
module.exports = router;
