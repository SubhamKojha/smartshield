import axios from "../api/axios";
import {
  CAMERA_BASE_URL,
  CAMERA_STATUS_URL,
  CAMERA_START_URL,
  CAMERA_STOP_URL,
} from "./cameraconfig";

const BACKEND_URL = "http://localhost:5000/api/camera"; // Node backend

// 🧠 Check camera status — first tries backend, then falls back to ESP32 directly
export const checkCameraStatus = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/status`);
    return res.data.status === "streaming";
  } catch (err) {
    console.warn("⚠️ Backend offline, checking ESP32 directly...");
    try {
      const res = await axios.get(CAMERA_STATUS_URL, { timeout: 3000 });
      return res.status === 200;
    } catch (e) {
      console.error("❌ Camera not reachable:", e.message);
      return false;
    }
  }
};

// 🚀 Start camera feed
export const startCameraFeed = async () => {
  try {
    await axios.get(`${BACKEND_URL}/start`);
    return { success: true, message: "Camera feed started ✅ (via backend)" };
  } catch (err) {
    console.warn("⚠️ Backend failed, trying ESP32 directly...");
    try {
      await axios.get(CAMERA_START_URL, { timeout: 3000 });
      return { success: true, message: "Camera feed started ✅ (direct ESP32)" };
    } catch (e) {
      return { success: false, message: "❌ Failed to start camera" };
    }
  }
};

// 🛑 Stop camera feed
export const stopCameraFeed = async () => {
  try {
    await axios.get(`${BACKEND_URL}/stop`);
    return { success: true, message: "Camera feed stopped ⏹️ (via backend)" };
  } catch (err) {
    console.warn("⚠️ Backend failed, trying ESP32 directly...");
    try {
      await axios.get(CAMERA_STOP_URL, { timeout: 3000 });
      return { success: true, message: "Camera feed stopped ⏹️ (direct ESP32)" };
    } catch (e) {
      return { success: false, message: "❌ Failed to stop camera" };
    }
  }
};
