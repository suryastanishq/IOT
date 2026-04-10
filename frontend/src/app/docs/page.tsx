"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="space-y-6 max-w-4xl p-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">AgroMind Hardware Setup Guide</h1>
         <p className="text-muted-foreground mt-2">How to connect the Tinkercad simulation or Real ESP32/Arduino</p>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>1. Wiring Diagram (ESP32 / Arduino)</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
             <div className="bg-gray-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-sm leading-relaxed">
                <p><span className="text-blue-500 font-bold">Zone A / Zone B Moisture Sensors</span></p>
                 <p>VCC &rarr; 5V / 3.3V</p>
                 <p>GND &rarr; GND</p>
                <p>SIG A &rarr; GPIO34, SIG B &rarr; GPIO35</p>
                 
                <p className="mt-4"><span className="text-green-500 font-bold">Dual Relay + Pumps</span></p>
                 <p>VCC &rarr; 5V</p>
                 <p>GND &rarr; GND</p>
                <p>IN A &rarr; GPIO26, IN B &rarr; GPIO27</p>
                <p className="mt-4"><span className="text-yellow-500 font-bold">DHT22 + Flow Meter + LCD</span></p>
                <p>DHT22 &rarr; GPIO14, Flow Meter &rarr; GPIO13, I2C LCD &rarr; SDA/SCL</p>
             </div>
         </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>2. MQTT Broker Setup (HiveMQ / EMQX)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
              <p>Create broker credentials and use these topics:</p>
              <ul className="list-disc pl-6">
                  <li><strong>Subscribe (commands):</strong> <code>agromind/&lt;device_id&gt;/zone_a/pump/command</code>, <code>.../zone_b/pump/command</code></li>
                  <li><strong>Publish (sensors):</strong> moisture, pump status, temp, humidity, flow_rate, heartbeat under <code>agromind/&lt;device_id&gt;/...</code></li>
              </ul>
              <p>Add credentials in <Badge>.env</Badge> and in <code className="bg-gray-200 dark:bg-zinc-800 px-1 rounded">hardware/smart_irrigation.ino</code>.</p>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>3. Running the Simulation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <p>Tinkercad can simulate the sensor logic. For live cloud control, move the same sketch to real ESP32 hardware.</p>
              <ol className="list-decimal pl-6 space-y-2">
                  <li>Flash <code>hardware/smart_irrigation.ino</code> to ESP32.</li>
                  <li>Start backend: <code>uvicorn main:app --reload</code>.</li>
                  <li>Open frontend and verify MQTT status in navbar and dashboard tiles.</li>
                  <li>Use motor control page to publish ON/OFF commands per zone.</li>
                  <li>Confirm topic flow in backend <code>/mqtt/cache</code>.</li>
              </ol>
          </CardContent>
      </Card>
    </div>
  );
}
