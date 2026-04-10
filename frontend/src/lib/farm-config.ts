import { getCropById } from "@/lib/crop-intel";

export type ZoneConfig = {
  zoneId: "A" | "B";
  cropId: string;
  areaSqm: number;
  soilType: string;
  sowingDate: string;
  moisture: number;
  pumpOn: boolean;
};

export const demoFarm = {
  farmName: "AgroMind Demo Farm",
  state: "Maharashtra",
  totalAreaSqm: 20,
  waterSource: "borewell",
  flowRateLpm: 2.5,
  zones: [
    {
      zoneId: "A",
      cropId: "wheat",
      areaSqm: 10,
      soilType: "loamy",
      sowingDate: "2026-01-05",
      moisture: 36,
      pumpOn: false,
    },
    {
      zoneId: "B",
      cropId: "cotton",
      areaSqm: 10,
      soilType: "black cotton",
      sowingDate: "2025-11-25",
      moisture: 55,
      pumpOn: false,
    },
  ] as ZoneConfig[],
};

export function getZoneLabel(zoneId: "A" | "B") {
  return `Zone ${zoneId}`;
}

export function zoneCrop(zone: ZoneConfig) {
  return getCropById(zone.cropId);
}
