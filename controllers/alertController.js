import Alert from "../models/Alert.js";

let ioRef = null;
let latestSensorData = null; // store temporarily to merge with image data later

export const setIO = (io) => {
  ioRef = io;
};

// 1️⃣ Sensor sends its data
export const receiveSensorData = async (req, res) => {
  try {
    const { deviceID, eventType, distance, timestamp } = req.body;
    latestSensorData = { deviceID, eventType, distance, timestamp };
    console.log("📡 Sensor Data Received:", latestSensorData);
    res.status(200).send("Sensor data stored temporarily");
  } catch (err) {
    console.error("❌ Error receiving sensor data:", err.message);
    res.status(500).send("Sensor data error");
  }
};

// 2️⃣ Camera sends its image, backend merges with latest sensor data
export const receiveImageData = async (req, res) => {
  try {
    const { deviceID, image, timestamp } = req.body;
    console.log("📸 Image Received from Camera:", deviceID);

    const mergedAlert = {
      deviceID: latestSensorData?.deviceID || "unknown_sensor",
      eventType: latestSensorData?.eventType || "intrusion",
      distance: latestSensorData?.distance || null,
      timestamp: latestSensorData?.timestamp || new Date(),
      cameraDevice: deviceID,
      image,
      imageTimestamp: timestamp,
      severity: latestSensorData?.distance < 10 ? "HIGH" : "MEDIUM"
    };

    const alert = await Alert.create(mergedAlert);

    if (ioRef) ioRef.emit("new-alert", alert);

    res.status(200).send("Merged alert stored successfully");
  } catch (err) {
    console.error("❌ Error merging image data:", err.message);
    res.status(500).send("Failed to merge data");
  }
};

// 3️⃣ Get all alerts
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("❌ Error fetching alerts:", err.message);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

// 4️⃣ Get alert by ID (for View Details page)
export const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    console.error("❌ Error fetching alert:", err.message);
    res.status(500).json({ message: "Error retrieving alert" });
  }
};
