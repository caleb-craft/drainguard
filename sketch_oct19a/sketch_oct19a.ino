
#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

const int TRIG_PIN = 23;
const int ECHO_PIN = 22;
const int SERVO_PIN = 21;

const float DETECT_DISTANCE = 5.0;
const unsigned long OPEN_TIME = 3000;
const unsigned long CHECK_INTERVAL = 100;

Servo lidServo;

const char* WIFI_SSID = "REDMI 15C";
const char* WIFI_PASSWORD = "slyperbuild";
const char* SUPABASE_FUNCTION_URL =
  "https://stutslxuvvqfrewcgxfn.supabase.co/functions/v1/add-points";

const char* DEVICE_TOKEN = "DG_8kP4mZ9qR2vL7xN5bT1";

bool lidOpen = false;
bool waitingForObjectToLeave = false;

unsigned long lidOpenedAt = 0;
unsigned long lastCheckAt = 0;

int pointsEarned = 0;

void sendPointsToSupabase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected. Points not sent.");
    return;
  }

  HTTPClient http;
  http.begin(SUPABASE_FUNCTION_URL);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_TOKEN);

  int httpResponseCode = http.POST("{}");

  if (httpResponseCode >= 200 && httpResponseCode < 300) {
    Serial.println("10 points sent to Supabase!");
  } else {
    Serial.print("Failed to send points. HTTP code: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

float getDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  return duration * 0.0343 / 2.0;
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected!");
  Serial.println(WiFi.localIP());

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  lidServo.attach(SERVO_PIN);
  lidServo.write(0);

  Serial.println("Drain Guard System Ready");
}

void loop() {
  unsigned long now = millis();

  if (now - lastCheckAt < CHECK_INTERVAL) {
    return;
  }
  lastCheckAt = now;

  float distance = getDistanceCM();

  Serial.print("Distance: ");
  Serial.println(distance);

  // Wait until the previous object leaves
  if (waitingForObjectToLeave) {
    if (distance < 0 || distance >= DETECT_DISTANCE) {
      waitingForObjectToLeave = false;
      Serial.println("Ready for next object");
    }
    return;
  }

  // Detect a new object and open the lid
  if (!lidOpen && distance > 0 &&
      distance < DETECT_DISTANCE) {
    lidServo.write(500);
    lidOpen = true;
    lidOpenedAt = now;

    Serial.println("Lid OPEN");
  }

  // Close after 5 seconds and award 10 points
  if (lidOpen && now - lidOpenedAt >= OPEN_TIME) {
    lidServo.write(0);
    lidOpen = false;
    waitingForObjectToLeave = true;

pointsEarned += 10;

Serial.println("Lid CLOSED");
Serial.print("Points earned locally: ");
Serial.println(pointsEarned);

sendPointsToSupabase();
  }
}
