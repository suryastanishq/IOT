# AgroMind - Dual-Zone Smart Irrigation Platform

AgroMind is a production-style smart irrigation stack for Indian agriculture using dual-zone crop-aware logic, MQTT real-time telemetry, and AI guidance.

## What is implemented

- Next.js 14 frontend with dual-zone pages:
  - `/onboarding`, `/dashboard`, `/farm-3d`, `/crop-advisor`, `/predict`, `/control`, `/analytics`, `/report`, `/alerts`, `/settings`, `/docs`
- Indian crop intelligence dataset at `frontend/src/data/indian_crops.json`
- FastAPI backend MQTT bridge:
  - topic cache endpoint: `GET /mqtt/cache`
  - command publish endpoint: `POST /mqtt/command`
  - websocket stream: `GET /ws/live`
  - dual-zone prediction endpoint: `POST /predict/zone`
  - AgroBot endpoint: `POST /chat`
  - Firestore-backed MQTT telemetry persistence and AI cache
- ESP32 firmware in `hardware/smart_irrigation.ino`
- Firestore security rules:
  - `firestore.rules` + `firebase.json`
- ML training pipeline seed script:
  - `backend/train_model.py` builds `zone_moisture_model.pkl`
- Pre-filled report template:
  - `report-template.md`
  - dual moisture sensors, dual relays, DHT22, flow meter, EEPROM state, MQTT command/telemetry topics

## MQTT topic contract

Base topic: `agromind/{device_id}`

- Subscribe:
  - `zone_a/pump/command`
  - `zone_b/pump/command`
  - `config`
- Publish:
  - `zone_a/moisture`
  - `zone_b/moisture`
  - `zone_a/pump/status`
  - `zone_b/pump/status`
  - `sensors/temperature`
  - `sensors/humidity`
  - `flow_rate`
  - `device/heartbeat`

## Setup

### 1) Environment variables
- Copy root `.env.example` to `.env`
- Copy `frontend/.env.example` to `frontend/.env.local`

### 2) Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### 3) Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload --port 8000`

### 4) ESP32
1. Open `hardware/smart_irrigation.ino`
2. Set WiFi + MQTT credentials
3. Flash to ESP32
4. Verify live data at backend `GET /mqtt/cache`

## HiveMQ / EMQX quick guide

1. Create a free cluster on [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/) or [EMQX Cloud](https://www.emqx.com/en/cloud).
2. Create username/password credentials.
3. Use TCP port `1883` for ESP32 and secure WebSocket endpoint for frontend.
4. Put broker details in backend and frontend env files.

## Notes

- Current implementation includes core dual-zone architecture and MQTT replacement over ThingSpeak polling.
- Firebase security rules, PDF report template, and full ML training pipeline can be layered next as a follow-up milestone.
