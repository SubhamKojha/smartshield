import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alert");
        console.log("📥 Alerts fetched:", res.data); // ✅ check structure
        setAlerts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch alerts:", err.message);
      }
    };

    fetchAlerts();

    // 🧠 Socket setup
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.on("connect", () => console.log("🟢 Connected to backend"));
    socket.on("new-alert", (alert) => {
      console.log("🚨 New Alert:", alert);
      setAlerts((prev) => [alert, ...prev]); // append latest
    });
    socket.on("disconnect", () => console.log("🔴 Disconnected"));

    return () => socket.disconnect();
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white mt-6">
      <h2 className="text-2xl font-bold mb-4">🚨 Real-Time Alerts</h2>

      {alerts.length === 0 ? (
        <p className="text-gray-400">No alerts yet...</p>
      ) : (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
          {alerts.map((alert, i) => (
            <li
              key={i}
              className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500 hover:bg-gray-700 transition"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-red-400 uppercase">
                  {alert.eventType || "Unknown Event"}
                </span>
                <span className="text-sm text-gray-400">
                  {alert.timestamp
                    ? new Date(alert.timestamp).toLocaleTimeString()
                    : "—"}
                </span>
              </div>

              <p className="text-gray-300 text-sm">
                Device:{" "}
                <span className="text-blue-400">
                  {alert.deviceID || "Unknown Device"}
                </span>
              </p>

              <p className="text-sm text-gray-300">
                Distance: {alert.distance ?? "N/A"} cm | Severity:{" "}
                <span
                  className={
                    alert.severity === "HIGH"
                      ? "text-red-500 font-bold"
                      : "text-yellow-400"
                  }
                >
                  {alert.severity || "MEDIUM"}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
