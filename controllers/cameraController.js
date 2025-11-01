// controllers/cameraController.js
import axios from "axios";

let ioRef = null;
export const setIO = (io) => {
  ioRef = io;
};

// 🧠 ESP32 Camera Config
const CAMERA_IP = "192.168.0.100"; // Replace with your camera IP
const BASE_URL = `http://${CAMERA_IP}:80`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
});

// ▶️ Start camera feed
export const startCamera = async (req, res) => {
  try {
    const response = await axiosInstance.get("/start");
    console.log("📸 Camera feed started:", response.statusText);

    // 🔊 Notify all connected clients (frontend)
    if (ioRef) ioRef.emit("camera-start");

    return res.status(200).json({ success: true, message: "Camera feed started ✅" });
  } catch (err) {
    console.error("❌ Error starting camera:", err.message);
    return res.status(500).json({ success: false, message: "Failed to start camera", error: err.message });
  }
};

// ⏹ Stop camera feed
export const stopCamera = async (req, res) => {
  try {
    const response = await axiosInstance.get("/stop");
    console.log("⏹ Camera feed stopped:", response.statusText);

    // 🔊 Notify all clients
    if (ioRef) ioRef.emit("camera-stop");

    return res.status(200).json({ success: true, message: "Camera feed stopped ⏹️" });
  } catch (err) {
    console.error("❌ Error stopping camera:", err.message);
    return res.status(500).json({ success: false, message: "Failed to stop camera", error: err.message });
  }
};

// 📡 Check camera status
export const getCameraStatus = async (req, res) => {
  try {
    const response = await axiosInstance.get("/status");
    console.log("📷 Camera status:", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.warn("⚠️ Camera offline or unreachable:", err.message);
    return res.status(503).json({ status: "offline" });
  }
};

// 🚨 Automatically start camera on sensor alert (optional endpoint)
export const triggerCameraOnAlert = async (alertData) => {
  try {
    console.log("🚨 Sensor alert received, triggering camera...");

    // Start ESP32 camera
    await axiosInstance.get("/start");

    // Emit socket event for frontends
    if (ioRef) ioRef.emit("camera-start", { reason: "sensor-alert", alertData });

    console.log("✅ Camera started due to sensor trigger");
  } catch (err) {
    console.error("❌ Failed to trigger camera on alert:", err.message);
  }
};
