import { useEffect, useState } from "react";
import {
  checkCameraStatus,
  startCameraFeed,
  stopCameraFeed,
} from "../services/cameraServices";
import { CAMERA_STREAM_URL } from "../services/cameraconfig"; // ✅ Use shared config

export default function CameraFeed() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // 🔁 Check camera status every 5 seconds
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkCameraStatus();
      setIsStreaming(status);
    };

    checkStatus(); // run once immediately
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // ▶️ Start stream
  const startFeed = async () => {
    setLoading(true);
    const result = await startCameraFeed();
    setStatusMsg(result.message);
    if (result.success) setIsStreaming(true);
    setLoading(false);
  };

  // ⏹ Stop stream
  const stopFeed = async () => {
    setLoading(true);
    const result = await stopCameraFeed();
    setStatusMsg(result.message);
    if (result.success) setIsStreaming(false);
    setLoading(false);
  };

  return (
    <div className="camera-section">
      <h2>📷 SmartShield Camera Feed</h2>

      {/* ✅ Dynamically switch stream vs placeholder */}
      {isStreaming ? (
        <img
          src={CAMERA_STREAM_URL}
          alt="Camera Stream"
          className="camera-stream"
        />
      ) : (
        <div className="camera-placeholder">🛑 Camera inactive</div>
      )}

      {/* ✅ Control buttons */}
      <div className="camera-controls">
        <button
          onClick={startFeed}
          disabled={loading || isStreaming}
        >
          ▶️ Start
        </button>
        <button
          onClick={stopFeed}
          disabled={loading || !isStreaming}
        >
          ⏹ Stop
        </button>
      </div>

      {/* ✅ Status message */}
      {statusMsg && (
        <p>
          {loading ? "⏳ " : ""}
          {statusMsg}
        </p>
      )}
    </div>
  );
}
