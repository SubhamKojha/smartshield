import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Initial fetch from backend
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/alert");
        setAlerts(res.data);
      } catch (err) {
        console.error("⚠️ Failed to fetch alerts:", err);
      }
    };

    fetchAlerts();

    // Socket.IO connection
    const socket = io("http://localhost:5000");
    socket.on("newAlert", (alert) => {
      console.log("📩 New alert received:", alert);
      setAlerts((prev) => [alert, ...prev]);
    });

    socket.on("alertsCleared", () => {
      setAlerts([]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-3">🔔 Security Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-400">No alerts yet</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a, i) => (
            <li key={i} className="bg-gray-800 p-3 rounded-lg">
              <p>
                <span className="font-semibold text-red-400">{a.eventType}</span>  
                &nbsp;from <span className="text-yellow-400">{a.deviceID}</span>
              </p>
              <p className="text-sm text-gray-400">
                Distance: {a.distance ?? "N/A"} cm | Time:{" "}
                {new Date(a.timestamp).toLocaleTimeString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
