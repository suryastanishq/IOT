"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Download, Map as MapIcon } from "lucide-react";
import { demoFarm, zoneCrop } from "@/lib/farm-config";

// Dynamically import the 3D scene to prevent SSR issues with Three.js
const FarmScene = dynamic(() => import("@/components/3d/FarmScene"), { ssr: false });

export default function Farm3DPage() {
  const [isNight, setIsNight] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const [zones, setZones] = useState({
    zoneA: { moisture: 45, pump: false },
    zoneB: { moisture: 30, pump: true },
  });
  const cropA = zoneCrop(demoFarm.zones[0]);
  const cropB = zoneCrop(demoFarm.zones[1]);

  // Simulated live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev => ({
        ...prev,
        zoneA: { ...prev.zoneA, moisture: Math.max(0, Math.min(100, prev.zoneA.moisture + (Math.random() > 0.5 ? 1 : -1))) }
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleZoneClick = (name: string) => {
    setSelectedZone(name);
  };

  return (
    <div className="h-full flex flex-col -m-6 relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-lg shadow border flex gap-2 items-center">
          <Button variant={isNight ? "outline" : "default"} size="sm" onClick={() => setIsNight(false)}>
            <Sun className="h-4 w-4 mr-2" /> Day
          </Button>
          <Button variant={isNight ? "default" : "outline"} size="sm" onClick={() => setIsNight(true)}>
            <Moon className="h-4 w-4 mr-2" /> Night
          </Button>
        </div>
        <Button variant="outline" size="sm" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <Download className="h-4 w-4 mr-2" />
          Export PNG
        </Button>
      </div>

      <div className="flex-1 w-full relative bg-blue-50 dark:bg-zinc-900 rounded-lg overflow-hidden border">
        <FarmScene zonesData={zones} isNight={isNight} onZoneClick={handleZoneClick} />
        
        {/* Minimap overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-2 rounded-lg shadow-lg border w-32 h-32 flex flex-col">
            <h4 className="text-xs font-bold mb-1 flex items-center gap-1"><MapIcon className="h-3 w-3"/> Mini-map</h4>
            <div className="flex-1 grid grid-cols-2 gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded">
                <div className={`rounded ${zones.zoneA.moisture < 40 ? 'bg-red-400' : zones.zoneA.moisture > 60 ? 'bg-green-400' : 'bg-amber-400'}`} />
                <div className={`rounded ${zones.zoneB.moisture < 40 ? 'bg-red-400' : zones.zoneB.moisture > 60 ? 'bg-green-400' : 'bg-amber-400'}`} />
                <div className="rounded bg-gray-300" />
                <div className="rounded bg-gray-300" />
            </div>
        </div>
      </div>

      {/* Side Panel for Selected Zone */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-l shadow-2xl transition-transform duration-300 transform ${selectedZone ? "translate-x-0" : "translate-x-full"}`}>
        {selectedZone && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{selectedZone}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>Close</Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Live Moisture</p>
                <div className="text-3xl font-mono font-bold text-green-600">
                  {selectedZone === "Zone A" ? zones.zoneA.moisture : zones.zoneB.moisture}%
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Crop</p>
                <p className="font-semibold">{selectedZone === "Zone A" ? cropA.name_en : cropB.name_en}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Pump Status</p>
                <Badge variant={(selectedZone === "Zone A" && zones.zoneA.pump) || (selectedZone === "Zone B" && zones.zoneB.pump) ? "default" : "secondary"}>
                  {((selectedZone === "Zone A" && zones.zoneA.pump) || (selectedZone === "Zone B" && zones.zoneB.pump)) ? "RUNNING" : "STOPPED"}
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full mb-2">Test Pump</Button>
                <Button variant="outline" className="w-full">View Detailed Analytics</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
