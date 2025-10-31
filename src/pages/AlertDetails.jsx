import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AlertDetails() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/alert/${id}`);
        setAlert(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch alert details:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id]);

  if (loading) return <p className="text-white p-6">Loading alert details...</p>;
  if (!alert) return <p className="text-white p-6">Alert not found.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🚨 Alert Details</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-red-400 mb-3">Intrusion Report</h2>

        <p><span className="font-semibold">Sensor ID:</span> {alert.deviceID}</p>
        <p><span className="font-semibold">Event Type:</span> {alert.eventType}</p>
        <p><span className="font-semibold">Distance:</span> {alert.distance} cm</p>
        <p><span className="font-semibold">Severity:</span> {alert.severity}</p>
        <p><span className="font-semibold">Timestamp:</span> {new Date(alert.timestamp).toLocaleString()}</p>

        <hr className="my-4 border-gray-700" />

        <h3 className="text-lg font-semibold text-yellow-400 mb-2">Camera Details</h3>
        {alert.cameraDevice ? (
          <>
            <p><span className="font-semibold">Camera ID:</span> {alert.cameraDevice}</p>
            <p><span className="font-semibold">Capture Time:</span> {new Date(alert.imageTimestamp).toLocaleString()}</p>
            {alert.image ? (
              <img
                src={`data:image/jpeg;base64,${alert.image}`}
                alt="Captured Intrusion"
                className="rounded-lg border border-gray-700 mt-4 w-full max-w-md"
              />
            ) : (
              <p className="text-gray-400">No image available</p>
            )}
          </>
        ) : (
          <p className="text-gray-400">No camera data recorded for this alert.</p>
        )}

        <div className="mt-6">
          <Link to="/dashboard" className="text-blue-400 underline hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
