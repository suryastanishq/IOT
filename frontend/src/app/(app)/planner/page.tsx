"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, Droplet, ThermometerSun, AlertTriangle, CheckCircle2 } from "lucide-react";

type PlannerResult = {
  suitability: { verdict: string; prob: number; precautions: string[] };
  water: { eto: string; reqWater: string };
};

export default function PlannerPage() {
  const [state, setState] = useState("Punjab");
  const [crop, setCrop] = useState("Wheat");
  const [area, setArea] = useState(1000); // in sqm
  const [temp, setTemp] = useState(35);
  const [hum, setHum] = useState(40);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);

  const testBackend = () => {
      setLoading(true);
      // Simulate backend endpoint delay since backend is running separately
      setTimeout(() => {
          // Dummy logic mimicking our Python FastAPI
          let prob = 85;
          const precautions: string[] = [];
          if (crop.toLowerCase() === "wheat") {
            if (state.toLowerCase().includes("maharashtra") || state.toLowerCase().includes("kerala")) {
                prob = 40;
                precautions.push("High heat stress expected. Requires high-frequency drip irrigation.");
            } else {
                prob = 92;
                precautions.push("Optimal standard rotation. Monitor for leaf rust.");
            }
          } else if (crop.toLowerCase() === "sugarcane") {
             if (state.toLowerCase().includes("maharashtra")) {
                prob = 90;
                precautions.push("Black soil cracking during summer—mulching required.");
             } else {
                prob = 75;
                precautions.push("Requires massive volumetric water overhead.");
             }
          }

          const verdict = prob > 80 ? "Highly Viable" : prob > 50 ? "Moderate" : "Not Recommended";
          
          const baseEto = Math.max(2.0, (temp * 0.15) - (hum * 0.05) + 3.0);
          const kc = crop.toLowerCase() === "wheat" ? 1.15 : crop.toLowerCase() === "sugarcane" ? 1.25 : 1.0;
          const reqWater = area * (baseEto * kc);

          setResult({
              suitability: { verdict, prob, precautions },
              water: { eto: baseEto.toFixed(2), reqWater: reqWater.toFixed(1) }
          });
          setLoading(false);
      }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farm Planner & AI Suitability</h1>
        <p className="text-muted-foreground">Geographical crop analysis and volumetric water forecasting.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className="space-y-6">
            <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5"/> Regional Parameters</CardTitle>
                   <CardDescription>Setup your Indian geo-location and target crop</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>State / Region</Label>
                        <Input value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Maharashtra, Punjab" />
                    </div>
                    <div className="space-y-2">
                        <Label>Target Crop Type</Label>
                        <Input value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g. Wheat, Sugarcane, Rice" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5"/> Farm Volume & Weather</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Area (Square Meters)</Label>
                        <Input type="number" value={area} onChange={e => setArea(Number(e.target.value))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label>Avg Temp (°C)</Label>
                             <Input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                             <Label>Humidity (%)</Label>
                             <Input type="number" value={hum} onChange={e => setHum(Number(e.target.value))} />
                        </div>
                    </div>
                    <Button onClick={testBackend} className="w-full mt-4 bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? "Analyzing..." : "Generate AI Planner Report"}
                    </Button>
                </CardContent>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="h-full border-2 border-green-100 dark:border-green-900 bg-green-50/10 dark:bg-zinc-900 shadow-lg">
                <CardHeader>
                   <CardTitle>AI Suitability Report</CardTitle>
                </CardHeader>
                <CardContent>
                    {!result ? (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                             <ThermometerSun className="h-16 w-16 mb-4 opacity-20" />
                             <p>Run the analysis to see the report.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                             <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-lg border shadow-sm">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500">Survival Probability</h4>
                                    <p className="text-3xl font-bold font-mono">{result.suitability.prob}%</p>
                                </div>
                                <Badge className={result.suitability.prob > 80 ? "bg-green-500" : "bg-amber-500"}>
                                    {result.suitability.verdict}
                                </Badge>
                             </div>

                             <div className="space-y-3">
                                 <h4 className="font-bold flex items-center gap-2"><Droplet className="text-blue-500 w-5 h-5"/> Daily Volumetric Need</h4>
                                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                     <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight">{result.water.reqWater} <span className="text-sm">Liters</span></p>
                                     <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">Calculated internally via Evapotranspiration (ETc: {result.water.eto}mm)</p>
                                 </div>
                             </div>

                             <div className="space-y-3">
                                 <h4 className="font-bold flex items-center gap-2"><AlertTriangle className="text-amber-500 w-5 h-5"/> Geographical Precautions</h4>
                                 <ul className="space-y-2">
                                     {result.suitability.precautions.map((p: string, i: number) => (
                                         <li key={i} className="flex gap-2 items-start text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded text-amber-900 dark:text-amber-100">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 text-amber-600 shrink-0"/> {p}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                        </div>
                    )}
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
