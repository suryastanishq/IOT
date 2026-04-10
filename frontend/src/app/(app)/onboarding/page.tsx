"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { indianCrops, soils, calcCompatibility, getCropById } from "@/lib/crop-intel";

const states = ["Maharashtra", "Punjab", "Haryana", "UP", "Karnataka", "Tamil Nadu", "Gujarat"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [zoneACrop, setZoneACrop] = useState("wheat");
  const [zoneBCrop, setZoneBCrop] = useState("cotton");
  const [soilA, setSoilA] = useState("loamy");
  const [soilB, setSoilB] = useState("black cotton");
  const [farmName, setFarmName] = useState("AgroMind Farm");
  const [state, setState] = useState("Maharashtra");
  const [totalArea, setTotalArea] = useState(20);

  const cropA = getCropById(zoneACrop);
  const cropB = getCropById(zoneBCrop);
  const zoneArea = useMemo(() => Math.round(totalArea / 2), [totalArea]);
  const scoreA = calcCompatibility(cropA, soilA);
  const scoreB = calcCompatibility(cropB, soilB);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farm Onboarding Wizard</h1>
        <p className="text-muted-foreground">Dual-zone crop-aware setup for AgroMind.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 5</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="Farm name" />
              <select className="border rounded-md px-3" value={state} onChange={(e) => setState(e.target.value)}>
                {states.map((s) => <option key={s}>{s}</option>)}
              </select>
              <Input type="number" value={totalArea} onChange={(e) => setTotalArea(Number(e.target.value))} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <select className="border rounded-md px-3 py-2 w-full" value={zoneACrop} onChange={(e) => setZoneACrop(e.target.value)}>
                {indianCrops.map((c) => <option key={c.id} value={c.id}>{c.name_en} ({c.name_hi})</option>)}
              </select>
              <div className="flex items-center gap-3">
                <Badge>{cropA.category.toUpperCase()}</Badge>
                <span>{cropA.season}</span>
                <span>Area: {zoneArea} sqm</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <select className="border rounded-md px-3 py-2 w-full" value={zoneBCrop} onChange={(e) => setZoneBCrop(e.target.value)}>
                {indianCrops.map((c) => <option key={c.id} value={c.id}>{c.name_en} ({c.name_hi})</option>)}
              </select>
              <div className="flex items-center gap-3">
                <Badge>{cropB.category.toUpperCase()}</Badge>
                <span>{cropB.season}</span>
                <span>Area: {zoneArea} sqm</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 font-medium">Zone A Soil</p>
                <select className="border rounded-md px-3 py-2 w-full" value={soilA} onChange={(e) => setSoilA(e.target.value)}>
                  {soils.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Badge className="mt-2">{scoreA.label} ({scoreA.score}%)</Badge>
              </div>
              <div>
                <p className="mb-2 font-medium">Zone B Soil</p>
                <select className="border rounded-md px-3 py-2 w-full" value={soilB} onChange={(e) => setSoilB(e.target.value)}>
                  {soils.map((s) => <option key={s}>{s}</option>)}
                </select>
                <Badge className="mt-2">{scoreB.label} ({scoreB.score}%)</Badge>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <p>Farm: {farmName} ({state})</p>
              <p>Zone A: {cropA.name_en} @ {zoneArea} sqm</p>
              <p>Zone B: {cropB.name_en} @ {zoneArea} sqm</p>
              <p className="text-sm text-muted-foreground">Irrigation calendar generated from crop irrigation timings and frequency rules.</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep((v) => v - 1)}>Back</Button>
            <Button onClick={() => setStep((v) => Math.min(5, v + 1))}>{step === 5 ? "Finish" : "Next"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
