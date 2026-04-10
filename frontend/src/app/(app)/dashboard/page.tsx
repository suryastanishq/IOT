"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Power, CalendarClock } from "lucide-react";
import { demoFarm, zoneCrop } from "@/lib/farm-config";
import { calcWaterRequirement } from "@/lib/crop-intel";

export default function DashboardPage() {
  const zones = demoFarm.zones.map((zone) => {
    const crop = zoneCrop(zone);
    const water = calcWaterRequirement(crop, zone.areaSqm);
    const isDry = zone.moisture < crop.critical_moisture_threshold;
    return { zone, crop, water, isDry };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Dual-Zone Dashboard</h1>
          <p className="text-muted-foreground">Crop-aware irrigation intelligence for both zones.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {zones.map(({ zone, crop, water, isDry }) => (
          <Card key={zone.zoneId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Zone {zone.zoneId} - {crop.name_en} ({crop.name_hi})
                <Badge>{crop.category.toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="flex items-center gap-2"><Droplet className="w-4 h-4" /> Moisture: {zone.moisture}% (optimal {crop.optimal_soil_moisture_min}-{crop.optimal_soil_moisture_max}%)</p>
              <p className="flex items-center gap-2"><Power className="w-4 h-4" /> Pump: {zone.pumpOn ? "ON" : "OFF"}</p>
              <p>Water dispensed today: {(water.daily * 0.72).toFixed(1)} L / Required: {water.daily.toFixed(1)} L</p>
              <p className="flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Next irrigation: {crop.irrigation_times[0]}</p>
              <Badge variant={isDry ? "destructive" : "outline"}>
                {isDry
                  ? `Below critical threshold ${crop.critical_moisture_threshold}%`
                  : "Moisture within crop-safe range"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
