"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { demoFarm, zoneCrop } from "@/lib/farm-config";
import { calcWaterRequirement, daysSince } from "@/lib/crop-intel";

interface ZoneProps {
  position: [number, number, number];
  name: string;
  cropName: string;
  moisture: number;
  waterNeededToday: number;
  daysToHarvest: number;
  cropColor: string;
  growthScale: number;
  isIrrigating: boolean;
  onClickZone: (name: string) => void;
}

function Zone({
  position,
  name,
  cropName,
  moisture,
  waterNeededToday,
  daysToHarvest,
  cropColor,
  growthScale,
  isIrrigating,
  onClickZone,
}: ZoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (isIrrigating && meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClickZone(name)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial color={hovered ? "white" : cropColor} roughness={0.8} />
      </mesh>
      
      {/* 3D Text Label */}
      <Text 
        position={[0, 0.5, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {/* Floating Crop Type Label */}
      <Html position={[0, 1.5, 0]} center sprite>
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded shadow text-[10px] font-bold text-center pointer-events-none transform translate-y-[-20px]">
              {cropName}
              <br/>
              <span className="text-gray-500 font-normal">{name}</span>
          </div>
      </Html>

      {/* Growth stage indicator */}
      <mesh position={[0, 0.8 * growthScale, 0]} castShadow>
        <coneGeometry args={[0.25 * growthScale, 1.2 * growthScale, 10]} />
        <meshStandardMaterial color="#3f8f4f" />
      </mesh>

      <mesh position={[1.5, 1, 1.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.5, 1.8, 1.5]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color={hovered ? "#378ADD" : "#1D9E75"} emissive={hovered ? "#378ADD" : "#000"} />
      </mesh>

      {/* Floating Info Card on Hover */}
      {hovered && (
        <Html position={[0, 2.5, 0]} center className="pointer-events-none">
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-900 dark:text-gray-100 p-3 rounded shadow-lg border border-gray-200 dark:border-zinc-700 w-48 text-sm">
            <h4 className="font-bold border-b pb-1 mb-1 border-gray-200 dark:border-zinc-700">{name}</h4>
            <div className="flex justify-between"><span>Crop:</span> <span className="font-semibold">{cropName}</span></div>
            <div className="flex justify-between"><span>Moisture:</span> <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{moisture}%</span></div>
            <div className="flex justify-between"><span>Water today:</span> <span className="font-mono">{waterNeededToday.toFixed(1)} L</span></div>
            <div className="flex justify-between"><span>To harvest:</span> <span className="font-mono">{daysToHarvest} days</span></div>
            <div className="flex justify-between"><span>Pump:</span> <span className="font-mono">{isIrrigating ? "ON" : "OFF"}</span></div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface FarmSceneProps {
    zonesData: {
      zoneA: { moisture: number; pump: boolean };
      zoneB: { moisture: number; pump: boolean };
    };
    isNight: boolean;
    onZoneClick: (name: string) => void;
}

export default function FarmScene({ zonesData, isNight, onZoneClick }: FarmSceneProps) {
  const zoneAConfig = demoFarm.zones[0];
  const zoneBConfig = demoFarm.zones[1];
  const cropA = zoneCrop(zoneAConfig);
  const cropB = zoneCrop(zoneBConfig);
  const waterA = calcWaterRequirement(cropA, zoneAConfig.areaSqm);
  const waterB = calcWaterRequirement(cropB, zoneBConfig.areaSqm);
  const daysA = daysSince(zoneAConfig.sowingDate);
  const daysB = daysSince(zoneBConfig.sowingDate);
  const growthA = Math.min(1.6, Math.max(0.6, daysA / cropA.growth_duration_days + 0.5));
  const growthB = Math.min(1.6, Math.max(0.6, daysB / cropB.growth_duration_days + 0.5));

  return (
    <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
      {/* Lighting based on Day/Night */}
      <ambientLight intensity={isNight ? 0.1 : 0.6} />
      <directionalLight
        castShadow
        position={[10, 20, 10]}
        intensity={isNight ? 0.2 : 1.5}
        color={isNight ? "#8aa2d3" : "#ffffff"}
        shadow-mapSize={[1024, 1024]}
      />

      <Sky 
        distance={450000} 
        sunPosition={isNight ? [0, -1, 0] : [1, 1, 0]} 
        inclination={isNight ? 0 : 0.49} 
        azimuth={0.25} 
      />
      
      <OrbitControls 
        makeDefault
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />

      {/* Base Field Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={isNight ? "#112211" : "#4a5d23"} />
      </mesh>

      <Zone
        position={[-2.5, 0, 0]}
        name="Zone A"
        cropName={`${cropA.name_en} (${cropA.name_hi})`}
        moisture={zonesData.zoneA.moisture}
        waterNeededToday={waterA.daily}
        daysToHarvest={Math.max(0, cropA.growth_duration_days - daysA)}
        cropColor="#d6ad3d"
        growthScale={growthA}
        isIrrigating={zonesData.zoneA.pump}
        onClickZone={onZoneClick}
      />
      <Zone
        position={[2.5, 0, 0]}
        name="Zone B"
        cropName={`${cropB.name_en} (${cropB.name_hi})`}
        moisture={zonesData.zoneB.moisture}
        waterNeededToday={waterB.daily}
        daysToHarvest={Math.max(0, cropB.growth_duration_days - daysB)}
        cropColor="#e9e7df"
        growthScale={growthB}
        isIrrigating={zonesData.zoneB.pump}
        onClickZone={onZoneClick}
      />
    </Canvas>
  );
}
