#include "esp_camera.h"
#include "esp_timer.h"
#include "img_converters.h"
#include "esp_http_server.h"
#include <WiFi.h>
#include <HTTPClient.h>

// ===== Wi-Fi credentials =====
const char* ssid     = "FIEM@SGHALL#WIFI1";
const char* password = "sghall@4321";

// ===== Backend endpoint for still image =====
const char* backendURL = "http://192.168.0.105:5000/api/camera";

// ===== Hardware: AI-Thinker pin map =====
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
#define LED_PIN            4   // flash LED

// ===== Global state =====
extern bool isStreaming;
extern httpd_handle_t stream_httpd;

// ------------------------------------------------------------------
// Utility: convert and POST image to backend
// ------------------------------------------------------------------
void sendCapturedImage(camera_fb_t *fb) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(backendURL);
  http.addHeader("Content-Type", "application/json");

  static const char *tbl =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  String out;
  uint8_t *d = fb->buf;
  size_t n = fb->len;
  for (size_t i = 0; i < n; i += 3) {
    uint32_t v = (d[i] << 16) | ((i + 1 < n) ? d[i + 1] << 8 : 0) |
                 ((i + 2 < n) ? d[i + 2] : 0);
    out += tbl[(v >> 18) & 63];
    out += tbl[(v >> 12) & 63];
    out += (i + 1 < n) ? tbl[(v >> 6) & 63] : '=';
    out += (i + 2 < n) ? tbl[v & 63] : '=';
  }

  String json = "{\"deviceID\":\"CAMERA_1\",\"image\":\"data:image/jpeg;base64," +
                out + "\"}";
  int code = http.POST(json);
  Serial.printf("📡 POST image → %d\n", code);
  http.end();
}

// ------------------------------------------------------------------
// MJPEG streaming handler
// ------------------------------------------------------------------
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len;
  uint8_t *_jpg_buf;
  char part_buf[64];
  res = httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  if (res != ESP_OK) return res;

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      res = ESP_FAIL;
    } else {
      _jpg_buf_len = fb->len;
      _jpg_buf = fb->buf;
      httpd_resp_send_chunk(req, "--frame\r\n", 9);
      snprintf(part_buf, 64,
               "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n",
               _jpg_buf_len);
      httpd_resp_send_chunk(req, part_buf, strlen(part_buf));
      httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
      httpd_resp_send_chunk(req, "\r\n", 2);
      esp_camera_fb_return(fb);
    }
    if (res != ESP_OK) break;
  }
  return res;
}

// ------------------------------------------------------------------
// Simple REST API handlers
// ------------------------------------------------------------------
esp_err_t start_handler(httpd_req_t *req) {
  if (!isStreaming) {
    httpd_config_t conf = HTTPD_DEFAULT_CONFIG();
    conf.server_port = 81;
    if (httpd_start(&stream_httpd, &conf) == ESP_OK) {
      httpd_uri_t stream_uri = {.uri = "/stream",
                                .method = HTTP_GET,
                                .handler = stream_handler};
      httpd_register_uri_handler(stream_httpd, &stream_uri);
      isStreaming = true;
      digitalWrite(LED_PIN, HIGH);
      Serial.println("🎥 Stream server started on :81/stream");
    }
  }
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, "{\"message\":\"stream started\"}", HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t stop_handler(httpd_req_t *req) {
  if (isStreaming && stream_httpd) {
    httpd_stop(stream_httpd);
    stream_httpd = NULL;
    isStreaming = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("🛑 Stream stopped");
  }
  camera_fb_t *fb = esp_camera_fb_get();
  if (fb) {
    sendCapturedImage(fb);
    esp_camera_fb_return(fb);
  }
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_send(req, "{\"message\":\"stream stopped\"}", HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

esp_err_t status_handler(httpd_req_t *req) {
  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  String s = "{\"status\":\"" + String(isStreaming ? "streaming" : "ready") + "\"}";
  httpd_resp_send(req, s.c_str(), HTTPD_RESP_USE_STRLEN);
  return ESP_OK;
}

// ------------------------------------------------------------------
// Camera init
// ------------------------------------------------------------------
void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  if (psramFound()) {
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 12;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 15;
    config.fb_count = 1;
  }
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed 0x%x\n", err);
    delay(2000);
    ESP.restart();
  } else {
    Serial.println("✅ Camera ready");
  }
}

// ------------------------------------------------------------------
// Setup + main
// ------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  initCamera();

  WiFi.begin(ssid, password);
  WiFi.setSleep(false);
  Serial.print("Connecting Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.printf("\n✅ Wi-Fi connected  IP: %s\n", WiFi.localIP().toString().c_str());

  // Control API server (port 80)
  httpd_config_t cfg = HTTPD_DEFAULT_CONFIG();
  cfg.server_port = 80;
  httpd_handle_t server = NULL;
  if (httpd_start(&server, &cfg) == ESP_OK) {
    httpd_uri_t start_uri = {"/start", HTTP_GET, start_handler};
    httpd_uri_t stop_uri = {"/stop", HTTP_GET, stop_handler};
    httpd_uri_t status_uri = {"/status", HTTP_GET, status_handler};
    httpd_register_uri_handler(server, &start_uri);
    httpd_register_uri_handler(server, &stop_uri);
    httpd_register_uri_handler(server, &status_uri);
  }

  Serial.println("🌐 Camera API ready:");
  Serial.println("  /start  → begin stream (port 81)");
  Serial.println("  /stop   → stop & send image");
  Serial.println("  /status → check state");
  Serial.println("  Stream URL: http://" +
                 WiFi.localIP().toString() + ":81/stream");
}

void loop() {}