"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { demoFarm, zoneCrop } from "@/lib/farm-config";
import { calcWaterRequirement, litresToMinutes } from "@/lib/crop-intel";

export default function PredictPage() {
  const zones = demoFarm.zones.map((zone) => {
    const crop = zoneCrop(zone);
    const water = calcWaterRequirement(crop, zone.areaSqm);
    const minutes = litresToMinutes(water.daily, demoFarm.flowRateLpm);
    const nextNeed = zone.moisture < crop.critical_moisture_threshold ? "within 1 hour" : "in ~24 hours";
    return { zone, crop, water, minutes, nextNeed };
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Prediction Engine</h1>
          <p className="text-muted-foreground">Per-zone crop-threshold aware predictions for 24/48/72h windows.</p>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          <Brain className="w-3 h-3 justify-center mr-2"/> Model: Dual Zone Predictor
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {zones.map(({ zone, crop, water, minutes, nextNeed }) => (
          <Card key={zone.zoneId}>
            <CardHeader>
              <CardTitle>Zone {zone.zoneId} - {crop.name_en}</CardTitle>
              <CardDescription>
                Threshold: {crop.critical_moisture_threshold}% | Current moisture: {zone.moisture}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Predicted moisture: 24h {Math.max(20, zone.moisture - 4)}% | 48h {Math.max(15, zone.moisture - 8)}% | 72h {Math.max(10, zone.moisture - 12)}%</p>
              <p>Zone {zone.zoneId} will need irrigation {nextNeed}.</p>
              <p>
                Pump Zone {zone.zoneId} for {minutes} minutes to deliver about {water.daily.toFixed(1)} litres ({crop.name_en} daily requirement for {zone.areaSqm} sqm).
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
