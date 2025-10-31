import { useState } from "react";
import api from "../api/axios";

export default function SensorTest() {
  const [sensorType, setSensorType] = useState("PIR Motion Sensor");
  const [severity, setSeverity] = useState("MEDIUM");
  const [location, setLocation] = useState("Main Entrance");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    setMessage("");
    try {
      const response = await api.post("/alerts/create", {
        userId: "test-user-123", // replace with actual userId if needed
        sensorType,
        severity,
        location,
        imageUrl: "http://example.com/test-image.jpg",
      });

      setMessage(`✅ Success: ${response.data.message}`);
      console.log("Response:", response.data);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setMessage("❌ Failed to send data. Check backend logs.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">
          PIR Sensor Test Panel
        </h2>

        <div>
          <label className="block mb-1 text-sm">Sensor Type</label>
          <input
            type="text"
            value={sensorType}
            onChange={(e) => setSensorType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 outline-none"
          />
        </div>

        <button
          onClick={handleSend}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        >
          Send Test Alert
        </button>

        {message && (
          <p
            className={`mt-3 text-center ${
              message.startsWith("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
