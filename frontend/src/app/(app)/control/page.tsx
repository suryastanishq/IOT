"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Power, Settings, Clock, AlertTriangle } from "lucide-react";
import { demoFarm, zoneCrop } from "@/lib/farm-config";
import { calcWaterRequirement, litresToMinutes } from "@/lib/crop-intel";
import { baseTopic, getMqttClient } from "@/lib/mqtt-live";
import { useEffect } from "react";

export default function ControlPage() {
  const [pumpA, setPumpA] = useState(false);
  const [pumpB, setPumpB] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [pendingAAt, setPendingAAt] = useState<number | null>(null);
  const [pendingBAt, setPendingBAt] = useState<number | null>(null);
  const zoneA = demoFarm.zones[0];
  const zoneB = demoFarm.zones[1];
  const cropA = zoneCrop(zoneA);
  const cropB = zoneCrop(zoneB);
  const waterA = calcWaterRequirement(cropA, zoneA.areaSqm);
  const waterB = calcWaterRequirement(cropB, zoneB.areaSqm);
  const minutesA = litresToMinutes(waterA.daily, demoFarm.flowRateLpm);
  const minutesB = litresToMinutes(waterB.daily, demoFarm.flowRateLpm);

  useEffect(() => {
    const client = getMqttClient({
      onMessage: (topic) => {
        if (topic.endsWith("/zone_a/pump/status") && pendingAAt) {
          setLastLatencyMs(Date.now() - pendingAAt);
          setPendingAAt(null);
        }
        if (topic.endsWith("/zone_b/pump/status") && pendingBAt) {
          setLastLatencyMs(Date.now() - pendingBAt);
          setPendingBAt(null);
        }
      },
    });
    if (!client) return;
    client.subscribe(`${baseTopic()}/zone_a/pump/status`);
    client.subscribe(`${baseTopic()}/zone_b/pump/status`);
  }, [pendingAAt, pendingBAt]);

  const sendPumpCommand = (zone: "A" | "B", turnOn: boolean) => {
    const client = getMqttClient();
    if (!client) return;
    const topic = `${baseTopic()}/zone_${zone.toLowerCase()}/pump/command`;
    const now = Date.now();
    if (zone === "A") setPendingAAt(now);
    if (zone === "B") setPendingBAt(now);
    client.publish(topic, turnOn ? "ON" : "OFF");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Motor Control Panel</h1>
          <p className="text-muted-foreground">Manage pump states and automation rules manually.</p>
        </div>
        <Button variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> EMERGENCY STOP
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[{ zone: "A", pumpOn: pumpA, setPump: setPumpA, minutes: minutesA, crop: cropA }, { zone: "B", pumpOn: pumpB, setPump: setPumpB, minutes: minutesB, crop: cropB }].map((item) => (
        <Card key={item.zone} className={`border-2 ${item.pumpOn ? "border-blue-500 shadow-blue-100" : "border-gray-200"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
               Pump Zone {item.zone} ({item.crop.name_en})
               <Badge variant={item.pumpOn ? "default" : "secondary"} className={item.pumpOn ? "bg-blue-500 hover:bg-blue-600" : ""}>
                 {item.pumpOn ? "RUNNING" : "STOPPED"}
               </Badge>
            </CardTitle>
            <CardDescription>Auto rule: If moisture &lt; {item.crop.critical_moisture_threshold}% - run for {item.minutes} mins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
             <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                <Button 
                    onClick={() => {
                      const next = !item.pumpOn;
                      item.setPump(next);
                      sendPumpCommand(item.zone as "A" | "B", next);
                    }}
                    className={`h-32 w-32 rounded-full shadow-2xl transition-all flex flex-col gap-2 ${item.pumpOn ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/50 scale-105" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                    <Power className={`h-12 w-12 ${item.pumpOn ? "text-white" : ""}`} />
                    <span className="font-bold">{item.pumpOn ? "TURN OFF" : "TURN ON"}</span>
                </Button>
             </div>
             <p className="text-sm">Calculated runtime: <span className="font-semibold">{item.minutes} minutes</span> based on flow rate {demoFarm.flowRateLpm} L/min.</p>
             <p className="text-xs text-muted-foreground">Last command latency: {lastLatencyMs !== null ? `${lastLatencyMs} ms` : "--"}</p>
          </CardContent>
        </Card>
        ))}

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5"/> Automation Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border p-3 rounded-lg bg-green-50/50 dark:bg-zinc-900 border-green-100 dark:border-zinc-800">
                        <div>
                            <p className="font-medium text-sm">Rule 1: Auto-irrigate if Dry</p>
                            <p className="text-xs text-muted-foreground">If moisture &lt; 42% -&gt; pump ON for 15 mins</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between border p-3 rounded-lg bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800">
                        <div>
                            <p className="font-medium text-sm">Rule 2: Rain Skip</p>
                            <p className="text-xs text-muted-foreground">If rain forecast &gt; 70% -&gt; skip schedule</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between border p-3 rounded-lg border-red-100 bg-red-50/30 dark:bg-zinc-900 dark:border-zinc-800">
                        <div>
                            <p className="font-medium text-sm">Rule 3: Safety Cutoff</p>
                            <p className="text-xs text-muted-foreground">If pump ON &gt; 45 mins -&gt; force OFF + alert</p>
                        </div>
                        <Switch defaultChecked  />
                    </div>
                    <Button variant="outline" className="w-full mt-2">+ Add New Rule</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5"/> Pump Health Monitor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg text-center border">
                            <p className="text-sm text-gray-500 mb-1">Total Hours Run</p>
                            <p className="text-2xl font-mono font-bold">142.5 hrs</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg text-center border">
                            <p className="text-sm text-gray-500 mb-1">Est. Service Date</p>
                            <p className="text-lg font-bold">Oct 12, 2026</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
