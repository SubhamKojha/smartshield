import { useState, useEffect } from "react";
import axios from "axios";

export default function SecurityToggle() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch current status when dashboard loads
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/security");
        setActive(res.data.active);
      } catch (err) {
        console.error("❌ Failed to fetch security status:", err.message);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/security/toggle");
      setActive(res.data.active);
    } catch (err) {
      console.error("❌ Failed to toggle security:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      <span className="text-gray-200 font-semibold text-lg">
        {active ? "Security Active 🟢" : "Security Inactive 🔴"}
      </span>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out ${
          active ? "bg-green-500" : "bg-gray-600"
        } ${loading ? "opacity-70 cursor-wait" : "hover:scale-105"}`}
      >
        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full toggle-shadow transform transition-transform duration-300 ease-in-out ${active ? "translate-x-8" : "translate-x-0"}`} />

      </button>
    </div>
  );
}
