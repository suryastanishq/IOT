"use client";

import mqtt, { MqttClient } from "mqtt";

type LiveHandlers = {
  onConnect?: (connected: boolean) => void;
  onMessage?: (topic: string, payload: string) => void;
};

let client: MqttClient | null = null;

export function getMqttClient(handlers?: LiveHandlers) {
  if (client) return client;

  const wsUrl = process.env.NEXT_PUBLIC_MQTT_WS_URL;
  if (!wsUrl) return null;

  client = mqtt.connect(wsUrl, {
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME || undefined,
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || undefined,
    reconnectPeriod: 3000,
    connectTimeout: 10_000,
    clean: true,
  });

  client.on("connect", () => handlers?.onConnect?.(true));
  client.on("reconnect", () => handlers?.onConnect?.(false));
  client.on("close", () => handlers?.onConnect?.(false));
  client.on("error", () => handlers?.onConnect?.(false));
  client.on("message", (topic, payload) => handlers?.onMessage?.(topic, payload.toString()));

  return client;
}

export function baseTopic() {
  const device = process.env.NEXT_PUBLIC_MQTT_DEVICE_ID || "demo-device";
  return `agromind/${device}`;
}
