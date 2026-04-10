import os
import time
from datetime import datetime
from hashlib import sha256
from threading import Lock
from typing import Any, Dict, List

import joblib
import pandas as pd
import paho.mqtt.client as mqtt
import firebase_admin
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="AgroMind API", description="MQTT bridge + AI + prediction", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MQTT_HOST = os.getenv("MQTT_HOST", "")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")
MQTT_DEVICE_ID = os.getenv("MQTT_DEVICE_ID", "demo-device")
MQTT_BASE = f"agromind/{MQTT_DEVICE_ID}"
MODEL_PATH = os.getenv("ZONE_MODEL_PATH", "zone_moisture_model.pkl")
MODEL_COLS_PATH = os.getenv("ZONE_MODEL_COLUMNS_PATH", "zone_model_columns.json")

latest_cache: Dict[str, Any] = {}
cache_lock = Lock()
connected_websockets: List[WebSocket] = []
zone_model = None
zone_model_columns: List[str] = []
fs_client = None


class ChatRequest(BaseModel):
    message: str
    farm_context: Dict[str, Any]


class PredictZoneRequest(BaseModel):
    zone: str
    crop_name: str
    critical_threshold: float
    area_sqm: float
    current_moisture: float
    flow_rate_lpm: float


class MqttCommandRequest(BaseModel):
    zone: str
    command: str


def init_firestore():
    global fs_client
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    if not service_account_path:
        return None
    if not firebase_admin._apps:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    fs_client = firestore.client()
    return fs_client


def load_zone_model():
    global zone_model, zone_model_columns
    if os.path.exists(MODEL_PATH):
        zone_model = joblib.load(MODEL_PATH)
    if os.path.exists(MODEL_COLS_PATH):
        import json

        with open(MODEL_COLS_PATH, "r", encoding="utf-8") as fp:
            zone_model_columns = json.load(fp).get("columns", [])


def mqtt_on_connect(client, _userdata, _flags, reason_code, _properties=None):
    if reason_code != 0:
        print(f"MQTT connection failed: {reason_code}")
        return
    client.subscribe(f"{MQTT_BASE}/#")
    print(f"MQTT connected and subscribed to {MQTT_BASE}/#")


def mqtt_on_message(_client, _userdata, msg):
    payload = msg.payload.decode("utf-8", errors="ignore")
    snapshot = {"payload": payload, "ts": datetime.utcnow().isoformat()}
    with cache_lock:
        latest_cache[msg.topic] = snapshot
    if fs_client:
        try:
            fs_client.collection("mqtt_timeseries").add(
                {
                    "topic": msg.topic,
                    "payload": payload,
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "device_id": MQTT_DEVICE_ID,
                }
            )
            fs_client.collection("mqtt_latest").document(msg.topic.replace("/", "_")).set(
                {"topic": msg.topic, **snapshot, "timestamp": firestore.SERVER_TIMESTAMP}
            )
        except Exception as exc:
            print(f"Firestore write warning: {exc}")


mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
if MQTT_USERNAME:
    mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
mqtt_client.on_connect = mqtt_on_connect
mqtt_client.on_message = mqtt_on_message


@app.on_event("startup")
def startup_event():
    init_firestore()
    load_zone_model()
    if MQTT_HOST:
        try:
            mqtt_client.connect(MQTT_HOST, MQTT_PORT, keepalive=30)
            mqtt_client.loop_start()
        except Exception as exc:
            print(f"MQTT startup warning: {exc}")


@app.on_event("shutdown")
def shutdown_event():
    try:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()
    except Exception:
        pass


@app.get("/")
def read_root():
    return {"status": "AgroMind API is running", "mqtt_base_topic": MQTT_BASE}

@app.get("/healthz")
def healthz():
    return {
        "ok": True,
        "mqtt_configured": bool(MQTT_HOST),
        "firestore_configured": bool(os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")),
        "model_loaded": zone_model is not None and len(zone_model_columns) > 0,
    }


@app.get("/mqtt/cache")
def get_mqtt_cache():
    with cache_lock:
        return {"topics": latest_cache, "count": len(latest_cache)}


@app.post("/mqtt/command")
def publish_pump_command(req: MqttCommandRequest):
    cmd = req.command.upper()
    if req.zone.lower() not in {"a", "b"}:
        raise HTTPException(status_code=400, detail="zone must be A or B")
    if cmd not in {"ON", "OFF"}:
        raise HTTPException(status_code=400, detail="command must be ON or OFF")
    topic = f"{MQTT_BASE}/zone_{req.zone.lower()}/pump/command"
    info = mqtt_client.publish(topic, cmd, qos=1)
    return {"ok": True, "topic": topic, "mid": info.mid, "command": cmd}


@app.post("/predict/zone")
def predict_zone(req: PredictZoneRequest):
    if zone_model is None or not zone_model_columns:
        raise HTTPException(status_code=500, detail="Zone model not loaded. Train and save model first.")

    def predict_at(hours_ahead: int) -> float:
        row = {
            "zone": 0 if req.zone.upper() == "A" else 1,
            "threshold": req.critical_threshold,
            "moisture_now": req.current_moisture,
            "temp": 30.0,
            "humidity": 60.0,
            "hours_ahead": hours_ahead,
            f"crop_id_{req.crop_name.lower().replace(' ', '_')}": 1,
        }
        frame = pd.DataFrame([row])
        for col in zone_model_columns:
            if col not in frame.columns:
                frame[col] = 0
        frame = frame[zone_model_columns]
        pred = float(zone_model.predict(frame)[0])
        return max(0.0, min(100.0, pred))

    forecast_24 = predict_at(24)
    forecast_48 = predict_at(48)
    forecast_72 = predict_at(72)
    needs_irrigation = forecast_24 < req.critical_threshold
    litres_required = req.area_sqm * 4.5
    minutes = 0 if req.flow_rate_lpm <= 0 else round(litres_required / req.flow_rate_lpm)
    return {
        "zone": req.zone,
        "crop_name": req.crop_name,
        "threshold": req.critical_threshold,
        "forecast": {"24h": forecast_24, "48h": forecast_48, "72h": forecast_72},
        "needs_irrigation": needs_irrigation,
        "recommendation": f"Pump Zone {req.zone} for {minutes} minutes to deliver ~{round(litres_required, 1)} litres",
    }


@app.get("/report/data")
def report_data():
    with cache_lock:
        recent_topics = latest_cache.copy()
    return {
        "farm": {"device_id": MQTT_DEVICE_ID, "generated_at": datetime.utcnow().isoformat()},
        "mqtt_latest_count": len(recent_topics),
        "mqtt_latest": recent_topics,
    }


@app.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            await websocket.send_json({"type": "snapshot", "cache": latest_cache, "ts": time.time()})
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_websockets:
            connected_websockets.remove(websocket)


@app.post("/chat")
def chat_bot(req: ChatRequest):
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    ctx = req.farm_context
    zone_a = ctx.get("zone_a", {})
    zone_b = ctx.get("zone_b", {})
    system_prompt = (
        "You are AgroBot, an expert Indian agricultural AI assistant.\n"
        f"Zone A: {zone_a}\n"
        f"Zone B: {zone_b}\n"
        f"Current weather: {ctx.get('weather', 'unknown')}. User state: {ctx.get('state', 'unknown')}.\n"
        "Use Indian units and give practical local suggestions."
    )
    cache_key_source = f"{ctx.get('state','')}|{ctx.get('zone_a',{})}|{ctx.get('zone_b',{})}|{req.message.strip().lower()}"
    cache_key = sha256(cache_key_source.encode("utf-8")).hexdigest()
    if fs_client:
        try:
            cached = fs_client.collection("ai_cache").document(cache_key).get()
            if cached.exists:
                data = cached.to_dict() or {}
                return {"reply": data.get("reply", ""), "cached": True}
        except Exception as exc:
            print(f"Firestore AI cache read warning: {exc}")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message},
            ],
            max_tokens=250,
            temperature=0.5,
        )
        reply = response.choices[0].message.content
        if fs_client:
            try:
                fs_client.collection("ai_cache").document(cache_key).set(
                    {
                        "reply": reply,
                        "context": ctx,
                        "message": req.message,
                        "timestamp": firestore.SERVER_TIMESTAMP,
                    }
                )
            except Exception as exc:
                print(f"Firestore AI cache write warning: {exc}")
        return {"reply": reply, "cached": False}
    except Exception as exc:
        return {"reply": f"Error reaching AI service: {exc}"}
