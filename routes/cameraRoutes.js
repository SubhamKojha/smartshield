// routes/cameraRoutes.js
import express from "express";
import {
  startCamera,
  stopCamera,
  getCameraStatus,
} from "../controllers/cameraController.js";

const router = express.Router();

router.get("/start", startCamera);
router.get("/stop", stopCamera);
router.get("/status", getCameraStatus);

export default router;
