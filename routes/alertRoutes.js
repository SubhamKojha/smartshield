import express from "express";
import {
  createAlert,
  getAlerts,
  clearAlerts,
} from "../controllers/alertController.js";

const router = express.Router();

router.post("/", createAlert);  // 🔴 ESP32 posts here
router.get("/", getAlerts);     // 🟢 Frontend fetches alerts
router.delete("/", clearAlerts); // 🧹 Optional clear endpoint

export default router;
