"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, UserCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { baseTopic, getMqttClient } from "@/lib/mqtt-live";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [mqttConnected, setMqttConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    const client = getMqttClient({
      onConnect: setMqttConnected,
      onMessage: (topic, payload) => {
        if (!topic.endsWith("/device/heartbeat")) return;
        const ts = Number(payload);
        if (!Number.isFinite(ts)) return;
        const nowSec = Date.now() / 1000;
        setLatencyMs(Math.max(0, Math.round((nowSec - ts) * 1000)));
      },
    });
    if (!client) return;
    client.subscribe(`${baseTopic()}/device/heartbeat`);
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-6 bg-white dark:bg-zinc-950">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold dark:text-zinc-100 flex items-center gap-2">
           Good Morning, {user?.displayName || "Farmer"}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs border rounded-full px-3 py-1">
          <span className={`h-2 w-2 rounded-full ${mqttConnected ? "bg-green-500" : "bg-gray-400"}`} />
          <span>{mqttConnected ? "MQTT Live" : "Polling Fallback"}</span>
          <span className="text-muted-foreground">{latencyMs !== null ? `${latencyMs} ms` : "-- ms"}</span>
        </div>
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-green-600">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <UserCircle className="h-6 w-6 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
