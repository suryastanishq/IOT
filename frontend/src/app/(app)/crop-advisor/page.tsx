"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoFarm, zoneCrop } from "@/lib/farm-config";
import { calcCompatibility, calcWaterRequirement, daysSince, harvestProbability } from "@/lib/crop-intel";

export default function CropAdvisorPage() {
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const zoneA = demoFarm.zones[0];
  const zoneB = demoFarm.zones[1];

  const zones = [zoneA, zoneB].map((zone) => {
    const crop = zoneCrop(zone);
    const water = calcWaterRequirement(crop, zone.areaSqm);
    const dayCount = daysSince(zone.sowingDate);
    const soil = calcCompatibility(crop, zone.soilType);
    const harvestScore = harvestProbability({
      moistureScore: 78,
      soilScore: soil.score,
      seasonScore: 82,
      baseSurvival: crop.survival_probability_optimal_conditions,
    });
    return { zone, crop, water, dayCount, soil, harvestScore };
  });

  const getAiSuggestions = async () => {
    setLoadingAdvice(true);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Provide 5 specific suggestions to improve yield for both zones this week.",
          farm_context: {
            state: demoFarm.state,
            weather: "Hot afternoon, low rain chance",
            zone_a: { crop: zoneCrop(zoneA).name_en, moisture: zoneA.moisture, soil: zoneA.soilType, area: zoneA.areaSqm },
            zone_b: { crop: zoneCrop(zoneB).name_en, moisture: zoneB.moisture, soil: zoneB.soilType, area: zoneB.areaSqm },
          },
        }),
      });
      const data = await resp.json();
      setAiAdvice(data.reply || "No suggestions received.");
    } catch {
      setAiAdvice("Unable to load AI suggestions right now.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Crop Intelligence Panel</h1>
      <div className="flex items-center gap-2">
        <Button onClick={getAiSuggestions} disabled={loadingAdvice}>
          {loadingAdvice ? "Fetching..." : "Get AI Suggestions"}
        </Button>
      </div>
      {aiAdvice && (
        <Card>
          <CardHeader><CardTitle>AI Suggestions (Firestore cached)</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{aiAdvice}</p>
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {zones.map(({ zone, crop, water, dayCount, soil, harvestScore }) => (
          <Card key={zone.zoneId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Zone {zone.zoneId} - {crop.name_en} ({crop.name_hi})
                <Badge>{crop.category.toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Season: {crop.season}</p>
              <p>Days since sowing: {dayCount}</p>
              <p>Days to harvest: {Math.max(0, crop.growth_duration_days - dayCount)}</p>
              <p>Water/day: {water.daily.toFixed(1)} L</p>
              <p>Water/week: {water.weekly.toFixed(1)} L</p>
              <p>Water/month: {water.monthly.toFixed(1)} L</p>
              <p>Soil compatibility: <Badge variant="outline">{soil.label} ({soil.score}%)</Badge></p>
              <p>Harvest probability: <Badge>{harvestScore}%</Badge></p>
              <p>Irrigation times: {crop.irrigation_times.join(", ")}</p>
              <p>Pest risks: {crop.pest_risk.join(", ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
