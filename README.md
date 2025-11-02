# 🛡️ SmartShield  
> An intelligent **IoT + AI-based home security system** that automatically monitors, detects, and protects your home — built using **ESP32**, **AI-powered camera recognition**, **Node.js**, **Express**, **MongoDB**, and **React + Vite**.  
> Designed to deliver **hands-free protection**, **real-time alerts**, and **smart automation** through seamless hardware–software integration.

---

## 🚀 Overview  

**SmartShield** is a full-stack IoT and AI-powered security solution that provides **autonomous home protection**.  
When the user leaves home, the system automatically **arms itself** and begins **motion monitoring**. Upon detecting movement:  
- The **ESP32-CAM** captures live footage.  
- The **AI model** determines if the motion was caused by a **human** or an **animal**.  
- If it’s a **human**, the system identifies whether they’re **known or unknown**.  
- If **unknown**, instant alerts are sent to both the **user’s smartphone** and the **web dashboard**.  

When the authorized user returns, SmartShield detects their smartphone via **Bluetooth Low Energy (BLE)** and automatically **unlocks the door** and **disarms** the system.  

> 🧠 SmartShield blends **IoT automation**, **AI-based intrusion detection**, and **smart connectivity** for an affordable, intelligent, and reliable home security experience.

---

## ✨ Features  

**🔒 Smart Auto-Arming** — Automatically activates or deactivates based on user presence via BLE.  
**🎥 Intelligent Camera Activation** — Captures live video feed when motion is detected.  
**🧠 AI-Based Detection** — Distinguishes between humans and animals, and identifies known faces.  
**📡 Real-Time Alerts** — Sends instant notifications to web dashboard and smartphone.  
**📊 Web Dashboard** — Live intrusion feed, history, and control interface built with React + Vite.  
**⚡ Offline Functionality** — Operates locally without requiring constant internet access.  
**🔗 Hardware + Software Sync** — Unified ecosystem integrating IoT sensors, AI, and web tech.  
**🔔 Socket.IO Real-Time Communication** — Enables instant backend–frontend updates for alerts.  

---

## 🧠 How It Works  

1. **System Arming**  
   When the user leaves, BLE disconnects — SmartShield arms automatically.  

2. **Motion Detection**  
   PIR sensor detects movement and triggers the camera.  

3. **Image Capture & AI Analysis**  
   ESP32-CAM sends image to backend AI model → identifies whether it’s a **human** or **animal**.  

4. **Intruder Verification**  
   If it’s a human → AI model checks if the face matches known users.  

5. **Real-Time Alert**  
   Unknown human → instant alert via backend (Socket.IO) → visible on dashboard and mobile.  

6. **System Disarming**  
   BLE detects user’s smartphone proximity → door unlocks, security mode turns off automatically.  

---

## 🛠️ Tech Stack  

| Category | Technology Used |
|-----------|----------------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Axios, Socket.IO Client |
| **Backend** | Node.js, Express.js, MongoDB, Socket.IO, dotenv, cors |
| **AI/ML** | TensorFlow / Keras (for human–animal classification and facial recognition) |
| **IoT Firmware** | Arduino (C++) for ESP32 and ESP32-CAM |
| **Communication** | Bluetooth Low Energy (BLE), Wi-Fi |
| **Environment Management** | dotenv |
| **Real-Time Data** | WebSockets (Socket.IO) |

---

## 🧰 Hardware Components  

| Component | Function |
|------------|-----------|
| **ESP32** | Main microcontroller for BLE scanning, motion detection, and backend communication |
| **ESP32-CAM** | Captures images/video for intrusion detection |
| **PIR Sensor (HC-SR501)** | Detects motion and triggers the camera |
| **Relay Module** | Controls electronic door lock |
| **Power Supply (5V/2A)** | Powers all connected IoT devices |
| **Smartphone (BLE)** | Acts as the authentication device for presence detection |

---

## ⚙️ Setup & Installation  

### 🧩 Step 1: Clone the Repository  
```bash
git clone https://github.com/<your-username>/SmartShield.git
cd SmartShield
```

### ⚙️ Step 2: Backend Setup  
```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:  
```env
PORT=5000
MONGO_URI=<your_mongodb_uri>
```

Run the backend:  
```bash
npm start
```

---

### 💻 Step 3: Frontend Setup  
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to:  
👉 [http://localhost:5173](http://localhost:5173)

---

### 📸 Step 4: ESP32-CAM Configuration  

1. Open the ESP32-CAM sketch in Arduino IDE.  
2. Update Wi-Fi credentials and backend server IP:  
   ```cpp
   const char* ssid = "YourWiFi";
   const char* password = "YourPassword";
   const char* serverUrl = "http://<backend-ip>:5000/api/alert";
   ```
3. Upload the code and connect ESP32-CAM to your local network.  
4. Access the live stream at:  
   ```
   http://<camera-ip>:81/stream
   ```

---

### 📱 Step 5: BLE Authentication Setup  

- ESP32 constantly scans for a smartphone with BLE name `"MyPhone"` (can be changed in firmware).  
- When detected → system **disarms** and **unlocks door**.  
- When phone leaves range → system **arms** and **locks door**.  

This ensures **zero manual intervention** while keeping security automated.

---

## 💡 Key Highlights  

- Fully integrates **IoT sensors**, **AI models**, and **web interface**.  
- BLE-based **presence detection** for seamless control.  
- Real-time **Socket.IO alerts** ensure instant user awareness.  
- Offline mode enables **local functionality** without cloud dependence.  
- Compact, cost-effective, and easily deployable design.  
- Modular codebase for extending with cloud or voice assistant integration.  

---

## 🧠 AI Model Description  

- **Architecture:** Convolutional Neural Network (CNN)  
- **Stage 1:** Detects whether motion was caused by a human or animal.  
- **Stage 2:** Performs facial recognition to verify known individuals.  
- **Training Framework:** TensorFlow / Keras  
- **Deployment:** Integrated via backend model endpoint or Flask service.  
- **Inference Speed:** Optimized for real-time responses with ESP32 triggers.  

---

## 🔧 Tools Used  

- **Software:** Arduino IDE, VS Code, MongoDB Atlas, Postman, Node.js  
- **Libraries:** Express, Mongoose, Axios, Socket.IO, dotenv, TailwindCSS, Framer Motion  
- **Hardware Libraries:** WiFi.h, BLEDevice.h, ESPAsyncWebServer.h, esp_camera.h  
- **Testing Tools:** Serial Monitor, API logs, and dashboard event tracing  

---

## 🏁 Conclusion  

**SmartShield** is an end-to-end intelligent security solution that combines the power of **IoT**, **AI**, and **automation** to safeguard your home.  
From motion detection and camera streaming to BLE-based user identification and AI-driven alerts — every aspect of SmartShield is built for **reliability**, **speed**, and **smart decision-making**.  

It’s more than a security system — it’s a **self-aware guardian** for your home.  

---

### 🔰 Developed with by Team BrainRot

