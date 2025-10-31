import express from "express";
import {
  receiveSensorData,
  receiveImageData,
  getAllAlerts,
  getAlertById
} from "../controllers/alertController.js";

const router = express.Router();

// 🧠 Step 1: Sensor sends its data here
router.post("/", receiveSensorData);

// 🧠 Step 2: Camera sends its image here
router.post("/image", receiveImageData);

// 🧠 Step 3: Get all alerts (for dashboard)
router.get("/", getAllAlerts);

// 🧠 Step 4: Get single alert (for “View Details” page)
router.get("/:id", getAlertById);

export default router;
