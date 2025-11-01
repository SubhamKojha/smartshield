import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  deviceID: { type: String, required: true },
  eventType: { type: String, required: true },
  distance: { type: Number },
  timestamp: { type: Number, required: true },
});

export default mongoose.model("Alert", alertSchema);
