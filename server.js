import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./db.js";
import alertRoutes from "./routes/alertRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import { setIO } from "./controllers/alertController.js";
import cameraRoutes from "./routes/cameraRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup (for React running at localhost:5173)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Attach Socket.IO to controller layer
setIO(io);

// ✅ Express middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));

// ✅ Routes
app.use("/api/alert", alertRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/camera", cameraRoutes);

// ✅ Root check
app.get("/", (req, res) => res.send("SmartShield backend is running ✅"));

// ✅ Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 Frontend connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 SmartShield backend running on port ${PORT}`)
);
