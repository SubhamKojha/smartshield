import Alert from "../models/Alert.js";

let ioRef = null;
export const setIO = (io) => {
  ioRef = io;
};

// 📩 Create a new alert (from ESP32)
export const createAlert = async (req, res) => {
  try {
    const { deviceID, eventType, distance, timestamp } = req.body;

    const newAlert = new Alert({
      deviceID,
      eventType,
      distance,
      timestamp,
    });

    await newAlert.save();
    console.log("🚨 New Alert received:", newAlert);

    // 🔊 Emit real-time alert to connected frontends
    if (ioRef) ioRef.emit("newAlert", newAlert);

    res.status(201).json({ success: true, alert: newAlert });
  } catch (err) {
    console.error("❌ Failed to create alert:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📤 Fetch recent alerts for dashboard
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(alerts);
  } catch (err) {
    console.error("❌ Fetch alerts failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🧹 Optional: Clear all alerts (for admin panel or testing)
export const clearAlerts = async (req, res) => {
  try {
    await Alert.deleteMany({});
    if (ioRef) ioRef.emit("alertsCleared");
    res.status(200).json({ success: true, message: "All alerts cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
