import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  checkCameraStatus,
  startCameraFeed,
  stopCameraFeed,
} from "../services/cameraServices";
import { CAMERA_STREAM_URL } from "../services/cameraconfig";

const socket = io("http://localhost:5000"); // adjust for your backend IP if needed

export default function CameraFeed() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // 🔁 Check camera status every 5s
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkCameraStatus();
      setIsStreaming(status);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🧠 Listen for sensor-triggered camera events
  useEffect(() => {
    socket.on("camera-start", async () => {
      console.log("📡 Camera-start event received from backend!");
      setStatusMsg("Sensor triggered! Starting camera...");
      setLoading(true);
      const result = await startCameraFeed();
      setIsStreaming(result.success);
      setLoading(false);
      setStatusMsg(result.message);
    });

    socket.on("camera-stop", async () => {
      console.log("📡 Camera-stop event received from backend!");
      setStatusMsg("Stopping camera...");
      const result = await stopCameraFeed();
      setIsStreaming(false);
      setStatusMsg(result.message);
    });

    return () => {
      socket.off("camera-start");
      socket.off("camera-stop");
    };
  }, []);

  return (
    <div className="camera-section">
      <h2>📷 SmartShield Camera Feed</h2>

      {isStreaming ? (
        <img
          src={CAMERA_STREAM_URL}
          alt="Camera Stream"
          className="camera-stream"
        />
      ) : (
        <div className="camera-placeholder">🛑 Camera inactive</div>
      )}

      <div className="camera-controls">
        <button onClick={startCameraFeed} disabled={loading || isStreaming}>
          ▶️ Start
        </button>
        <button onClick={stopCameraFeed} disabled={loading || !isStreaming}>
          ⏹ Stop
        </button>
      </div>

      {statusMsg && (
        <p>
          {loading ? "⏳ " : ""}
          {statusMsg}
        </p>
      )}
    </div>
  );
}
