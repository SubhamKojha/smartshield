import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  deviceID: String,
  eventType: String,
  distance: Number,
  severity: { type: String, default: "LOW" },
  timestamp: { type: Date, default: Date.now },
  cameraDevice: String,
  image: String,
  imageTimestamp: Date
});

export default mongoose.model("Alert", alertSchema);
