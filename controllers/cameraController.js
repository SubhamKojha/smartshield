// controllers/cameraController.js
import axios from "axios";

const CAMERA_IP = "192.168.0.100";
const BASE_URL = `http://${CAMERA_IP}:80`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 3000, // milliseconds
});

// 🔹 Start camera feed
export const startCamera = async (req, res) => {
  try {
    await axiosInstance.get("/start");
    return res.status(200).json({ message: "Camera feed started ✅" });
  } catch (err) {
    console.error("❌ Error starting camera:", err.message);
    return res.status(500).json({ message: "Failed to start camera", error: err.message });
  }
};

// 🔹 Stop camera feed
export const stopCamera = async (req, res) => {
  try {
    await axiosInstance.get("/stop");
    return res.status(200).json({ message: "Camera feed stopped ⏹️" });
  } catch (err) {
    console.error("❌ Error stopping camera:", err.message);
    return res.status(500).json({ message: "Failed to stop camera", error: err.message });
  }
};

// 🔹 Check camera status
export const getCameraStatus = async (req, res) => {
  try {
    const response = await axiosInstance.get("/status");
    console.log("📸 Camera status:", response.data);
    return res.status(200).json(response.data);
  } catch (err) {
    console.warn("⚠️ Camera offline or unreachable:", err.message);
    return res.status(503).json({ status: "offline" });
  }
};
