#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_bt.h"
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>

// ---------------- Wi-Fi ----------------
const char* ssid = "FIEM@SGHALL#WIFI1";
const char* password = "sghall@4321";
const char* camIP = "192.168.0.100";
const char* backendURL = "http://192.168.0.209:5000/api/alert";
const char* securityURL = "http://192.168.0.209:5000/api/security";

// ---------------- Pins ----------------
#define TRIG_PIN 12
#define ECHO_PIN 13
#define PIR_PIN 14
#define BUZZER_PIN 27
#define LED_PIN 2   // BLE status LED

// ---------------- BLE Config ----------------
#define AUTH_BLE_NAME "realme GT 6T"
const int RSSI_THRESHOLD = -85;
const int SCAN_TIME = 3;
const unsigned long COOLDOWN_MS = 20000;

BLEScan* pBLEScan;
bool ownerNearby = false;
unsigned long lastDetection = 0;
bool securityEnabled = true;

// ---------------- Ultrasonic Config ----------------
#define DIST_THRESHOLD 20
#define STABLE_READS 3
#define TRIGGER_DELAY 5000
#define SECURITY_CHECK_INTERVAL 5000

unsigned long lastTrigger = 0;
unsigned long lastSecurityCheck = 0;
String deviceID = "sensor_node_01";

// ------------------- Functions -------------------
int getStableDistance() {
  long total = 0;
  for (int i = 0; i < STABLE_READS; i++) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long dur = pulseIn(ECHO_PIN, HIGH, 25000);
    int dist = dur * 0.034 / 2;
    if (dist > 0 && dist < 400) total += dist;
    delay(50);
  }
  return total / STABLE_READS;
}

void triggerCamera() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  String url = "http://" + String(camIP) + "/start";
  http.begin(url);
  http.setTimeout(6000);
  int code = http.GET();
  Serial.printf("📸 Camera trigger → %d\n", code);
  http.end();
}

void notifyBackend(String event, int distance) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(backendURL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"deviceID\":\"" + deviceID +
                   "\",\"eventType\":\"" + event +
                   "\",\"distance\":" + String(distance) +
                   ",\"timestamp\":" + String(millis()) + "}";
  int code = http.POST(payload);
  Serial.printf("📡 Backend POST → %d\n", code);
  http.end();
}

void updateSecurityStatus() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(securityURL);
  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    bool newStatus = payload.indexOf("\"active\":true") > 0;
    if (newStatus != securityEnabled) {
      securityEnabled = newStatus;
      Serial.printf("🛡️ Security %s\n", securityEnabled ? "ENABLED" : "DISABLED");
    }
  }
  http.end();
}

// ---------------- BLE ----------------
class MyBLECallback : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice dev) {
    if (!dev.haveName()) return;
    String name = dev.getName().c_str();
    int rssi = dev.getRSSI();
    if (name == AUTH_BLE_NAME && rssi >= RSSI_THRESHOLD) {
      ownerNearby = true;
      lastDetection = millis();
      Serial.printf("🎯 Owner detected (%s, %d dBm)\n", name.c_str(), rssi);
    }
  }
};

void BLETask(void* param) {
  while (true) {
    if (pBLEScan) {
      pBLEScan->start(SCAN_TIME, false);
      pBLEScan->clearResults();
    }
    vTaskDelay(1000 / portTICK_PERIOD_MS); // small delay
  }
}

// ---------------- Setup ----------------
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("🚀 SmartShield with BLE Auto-Unlock starting...");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // --- Wi-Fi ---
  Serial.print("📶 Connecting Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n✅ Wi-Fi connected (%s)\n", WiFi.localIP().toString().c_str());

  // --- BLE ---
  esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT); // free unused BT Classic RAM
  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyBLECallback(), false);
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(150);
  pBLEScan->setWindow(100);
  Serial.println("✅ BLE Scanner ready");

  xTaskCreatePinnedToCore(BLETask, "BLETask", 4096, NULL, 1, NULL, 0);

  updateSecurityStatus();
}

// ---------------- Loop ----------------
void loop() {
  // --- Check BLE state ---
  if (millis() - lastDetection > COOLDOWN_MS) ownerNearby = false;

  // --- Owner proximity logic ---
  static bool lastState = false;
  if (ownerNearby != lastState) {
    lastState = ownerNearby;
    if (ownerNearby) {
      Serial.println("✅ Owner nearby — security disabled");
      digitalWrite(LED_PIN, HIGH);
      securityEnabled = false;
    } else {
      Serial.println("🔒 Owner away — security enabled");
      digitalWrite(LED_PIN, LOW);
      securityEnabled = true;
    }
  }

  // --- Security logic ---
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    delay(2000);
  }

  if (millis() - lastSecurityCheck > SECURITY_CHECK_INTERVAL) {
    updateSecurityStatus();
    lastSecurityCheck = millis();
  }

  if (!securityEnabled) {
    delay(1000);
    return;
  }

  int distance = getStableDistance();
  int motion = digitalRead(PIR_PIN);
  Serial.printf("📏 %d cm | PIR %d\n", distance, motion);
  digitalWrite(BUZZER_PIN, motion);

  if (((distance > 0 && distance < DIST_THRESHOLD) || motion) &&
      millis() - lastTrigger > TRIGGER_DELAY) {
    lastTrigger = millis();
    Serial.println("🚨 Intrusion detected — triggering camera & backend");
    triggerCamera();
    notifyBackend("intrusion", distance);
  }

  delay(400);
}