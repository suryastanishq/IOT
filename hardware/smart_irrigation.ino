#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <EEPROM.h>
#include <time.h>

// -------- User config --------
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";
const char* MQTT_HOST = "YOUR_HIVEMQ_HOST";
const int MQTT_PORT = 1883;
const char* MQTT_USER = "YOUR_MQTT_USER";
const char* MQTT_PASS = "YOUR_MQTT_PASS";
const char* DEVICE_ID = "demo-device";
// -----------------------------

const int ZONE_A_SENSOR_PIN = 34;
const int ZONE_B_SENSOR_PIN = 35;
const int ZONE_A_RELAY_PIN = 26;
const int ZONE_B_RELAY_PIN = 27;
const int DHT_PIN = 14;
const int FLOW_PIN = 13;
const int LED_GREEN = 25;
const int LED_AMBER = 33;
const int LED_RED = 32;

volatile unsigned long flowPulses = 0;
unsigned long lastPublishMs = 0;
unsigned long lastDisplayMs = 0;
bool displayToggle = false;
bool pumpA = false;
bool pumpB = false;
float flowRateLpm = 0.0;

const float PULSES_PER_LITRE = 450.0;
const int EEPROM_PUMP_A_ADDR = 0;
const int EEPROM_PUMP_B_ADDR = 1;

DHT dht(DHT_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

String baseTopic() { return String("agromind/") + DEVICE_ID; }

void IRAM_ATTR onFlowPulse() { flowPulses++; }

void setPumpStateA(bool on) {
  pumpA = on;
  digitalWrite(ZONE_A_RELAY_PIN, on ? HIGH : LOW);
  EEPROM.write(EEPROM_PUMP_A_ADDR, on ? 1 : 0);
  EEPROM.commit();
}

void setPumpStateB(bool on) {
  pumpB = on;
  digitalWrite(ZONE_B_RELAY_PIN, on ? HIGH : LOW);
  EEPROM.write(EEPROM_PUMP_B_ADDR, on ? 1 : 0);
  EEPROM.commit();
}

float readMoisturePercent(int pin) {
  int raw = analogRead(pin);
  return constrain(map(raw, 4095, 1200, 0, 100), 0, 100);
}

void publishValue(String topic, String payload) {
  mqtt.publish(topic.c_str(), payload.c_str(), true);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String t = String(topic);
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  if (t.endsWith("/zone_a/pump/command")) {
    setPumpStateA(msg == "ON");
  } else if (t.endsWith("/zone_b/pump/command")) {
    setPumpStateB(msg == "ON");
  } else if (t.endsWith("/config")) {
    // Config JSON can be parsed here if needed.
  }
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(300);
}

void connectMQTT() {
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  while (!mqtt.connected()) {
    String clientId = String("agromind-esp32-") + DEVICE_ID;
    if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      mqtt.subscribe((baseTopic() + "/zone_a/pump/command").c_str());
      mqtt.subscribe((baseTopic() + "/zone_b/pump/command").c_str());
      mqtt.subscribe((baseTopic() + "/config").c_str());
    } else {
      delay(2000);
    }
  }
}

void updateStatusLeds() {
  bool wifi = WiFi.status() == WL_CONNECTED;
  bool broker = mqtt.connected();
  digitalWrite(LED_GREEN, wifi && broker ? HIGH : LOW);
  digitalWrite(LED_AMBER, wifi && !broker ? HIGH : LOW);
  digitalWrite(LED_RED, wifi ? LOW : HIGH);
}

void setup() {
  Serial.begin(115200);
  EEPROM.begin(8);

  pinMode(ZONE_A_RELAY_PIN, OUTPUT);
  pinMode(ZONE_B_RELAY_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_AMBER, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), onFlowPulse, RISING);

  dht.begin();
  lcd.init();
  lcd.backlight();

  setPumpStateA(EEPROM.read(EEPROM_PUMP_A_ADDR) == 1);
  setPumpStateB(EEPROM.read(EEPROM_PUMP_B_ADDR) == 1);

  connectWiFi();
  connectMQTT();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();
  updateStatusLeds();

  unsigned long now = millis();
  if (now - lastPublishMs >= 15000) {
    noInterrupts();
    unsigned long pulses = flowPulses;
    flowPulses = 0;
    interrupts();
    flowRateLpm = pulses / PULSES_PER_LITRE * 4.0; // 15s window to per-minute

    float moistureA = readMoisturePercent(ZONE_A_SENSOR_PIN);
    float moistureB = readMoisturePercent(ZONE_B_SENSOR_PIN);
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    publishValue(baseTopic() + "/zone_a/moisture", String(moistureA, 2));
    publishValue(baseTopic() + "/zone_b/moisture", String(moistureB, 2));
    publishValue(baseTopic() + "/zone_a/pump/status", pumpA ? "ON" : "OFF");
    publishValue(baseTopic() + "/zone_b/pump/status", pumpB ? "ON" : "OFF");
    publishValue(baseTopic() + "/sensors/temperature", String(temp, 2));
    publishValue(baseTopic() + "/sensors/humidity", String(hum, 2));
    publishValue(baseTopic() + "/flow_rate", String(flowRateLpm, 2));
    publishValue(baseTopic() + "/device/heartbeat", String((unsigned long)time(nullptr)));
    lastPublishMs = now;
  }

  if (now - lastDisplayMs >= 3000) {
    float moistureA = readMoisturePercent(ZONE_A_SENSOR_PIN);
    float moistureB = readMoisturePercent(ZONE_B_SENSOR_PIN);
    lcd.clear();
    if (!displayToggle) {
      lcd.setCursor(0, 0); lcd.print("Zone A Moisture");
      lcd.setCursor(0, 1); lcd.print(String(moistureA, 1) + "% Pump:" + (pumpA ? "ON" : "OFF"));
    } else {
      lcd.setCursor(0, 0); lcd.print("Zone B Moisture");
      lcd.setCursor(0, 1); lcd.print(String(moistureB, 1) + "% Pump:" + (pumpB ? "ON" : "OFF"));
    }
    displayToggle = !displayToggle;
    lastDisplayMs = now;
  }
}
