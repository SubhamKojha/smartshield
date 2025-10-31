// ✅ Camera Network Configuration
export const CAMERA_IP = "192.168.0.100"; // Replace with actual printed IP

// 🔹 MJPEG stream URL (served by ESP32 on port 81)
export const CAMERA_STREAM_URL = `http://${CAMERA_IP}:81/stream`;

// 🔹 Control & status API base (served by WebServer on port 80)
export const CAMERA_BASE_URL = `http://${CAMERA_IP}:80`;

// Optional helper endpoints (match your ESP32 routes)
export const CAMERA_STATUS_URL = `${CAMERA_BASE_URL}/status`;
export const CAMERA_START_URL = `${CAMERA_BASE_URL}/start`;
export const CAMERA_STOP_URL = `${CAMERA_BASE_URL}/stop`;
