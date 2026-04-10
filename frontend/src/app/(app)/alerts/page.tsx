"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoFarm } from "@/lib/farm-config";
import { zoneCrop } from "@/lib/farm-config";

export default function AlertsPage() {
  const [zoneA, zoneB] = demoFarm.zones;
  const cropA = zoneCrop(zoneA);
  const cropB = zoneCrop(zoneB);

  const alerts = [
    `Zone A (${cropA.name_en}) moisture at ${zoneA.moisture}% - below critical threshold of ${cropA.critical_moisture_threshold}%. Irrigate now.`,
    `Zone B (${cropB.name_en}) moisture optimal at ${zoneB.moisture}%. Next irrigation in 14 hours.`,
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Notification Centre</h1>
      {alerts.map((alert) => (
        <Card key={alert}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Smart Alert <Badge variant="destructive">High</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>{alert}</CardContent>
        </Card>
      ))}
    </div>
  );
}
