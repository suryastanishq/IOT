import crops from "@/data/indian_crops.json";

export type FertilizerItem = { day: number; type: string; dose: string };

export type IndianCrop = {
  id: string;
  name_en: string;
  name_hi: string;
  category: "kharif" | "rabi" | "zaid";
  season: string;
  water_per_day_litres_per_sqm: number;
  irrigation_frequency_days: number;
  optimal_soil_moisture_min: number;
  optimal_soil_moisture_max: number;
  critical_moisture_threshold: number;
  irrigation_times: string[];
  total_water_litres_per_sqm_full_season: number;
  growth_duration_days: number;
  harvest_window_days_from_sowing: [number, number];
  recommended_soil_types: string[];
  soil_ph_range: [number, number];
  fertilizer_schedule: FertilizerItem[];
  pest_risk: string[];
  yield_per_acre_kg: [number, number];
  survival_probability_optimal_conditions: number;
  survival_probability_stressed_conditions: number;
  companion_crops: string[];
  avoid_with: string[];
  tips_for_better_yield: string[];
  water_stress_symptoms: string;
  overwatering_symptoms: string;
  market_price_inr_per_quintal: number;
  msp_inr_per_quintal: number;
  states_commonly_grown: string[];
};

export const indianCrops = crops as IndianCrop[];

export const soils = [
  "sandy",
  "loamy",
  "clay",
  "clay loam",
  "alluvial",
  "black cotton",
  "red laterite",
];

export function getCropById(id: string): IndianCrop {
  const crop = indianCrops.find((item) => item.id === id);
  return crop ?? indianCrops[0];
}

export function calcWaterRequirement(crop: IndianCrop, areaSqm: number) {
  const daily = crop.water_per_day_litres_per_sqm * areaSqm;
  return {
    daily,
    weekly: daily * 7,
    monthly: daily * 30,
  };
}

export function calcCompatibility(crop: IndianCrop, soil: string) {
  if (crop.recommended_soil_types.includes(soil)) {
    return { score: 95, label: "Excellent" };
  }
  if (soil.includes("loam")) {
    return { score: 78, label: "Good" };
  }
  if (soil === "sandy" || soil === "clay") {
    return { score: 58, label: "Fair" };
  }
  return { score: 42, label: "Poor" };
}

export function daysSince(dateISO: string) {
  const start = new Date(dateISO).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

export function harvestProbability(params: {
  moistureScore: number;
  soilScore: number;
  seasonScore: number;
  baseSurvival: number;
}) {
  const { moistureScore, soilScore, seasonScore, baseSurvival } = params;
  return Math.round(
    moistureScore * 0.4 + soilScore * 0.25 + seasonScore * 0.25 + baseSurvival * 0.1,
  );
}

export function litresToMinutes(litres: number, flowRateLitresPerMinute: number) {
  if (flowRateLitresPerMinute <= 0) return 0;
  return Math.ceil(litres / flowRateLitresPerMinute);
}
