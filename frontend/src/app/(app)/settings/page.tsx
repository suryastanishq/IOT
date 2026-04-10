"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
       <div>
          <h1 className="text-3xl font-bold tracking-tight">Farm Settings</h1>
          <p className="text-muted-foreground">Manage profile, API integrations, and notification preferences.</p>
       </div>

       <Card>
          <CardHeader>
             <CardTitle>Profile</CardTitle>
             <CardDescription>Your personal and farm details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Full Name</label>
                     <Input defaultValue={user?.displayName || "Demo Farmer"} />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Email</label>
                     <Input disabled value={user?.email || "farmer@agromind.local"} />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Farm Name</label>
                     <Input defaultValue="Main Field - Zone A" />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Crop Type</label>
                     <Input defaultValue="Wheat & Soybeans" />
                 </div>
             </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button>Save Profile</Button>
          </CardFooter>
       </Card>

      <Card>
          <CardHeader>
             <CardTitle>Hardware Connectivity (MQTT)</CardTitle>
             <CardDescription>Configure broker settings for ESP32 and web client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                 <label className="text-sm font-medium">MQTT Host</label>
                 <Input defaultValue="your-cluster.s1.eu.hivemq.cloud" />
             </div>
             <div className="space-y-2">
                 <label className="text-sm font-medium">MQTT Username</label>
                 <Input defaultValue="agromind_user" type="password" />
             </div>
             <div className="space-y-2">
                 <label className="text-sm font-medium">MQTT Password</label>
                 <Input defaultValue="•••••••••••••" type="password" />
             </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
             <Button>Verify Connection</Button>
          </CardFooter>
       </Card>

       <Card>
          <CardHeader>
             <CardTitle>Alert Preferences (Twilio)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between border-b pb-4">
                 <div>
                     <p className="font-medium text-sm">WhatsApp Alerts</p>
                     <p className="text-xs text-muted-foreground">Receive critical automation alerts on WhatsApp</p>
                 </div>
                 <Switch defaultChecked />
             </div>
             <div className="flex items-center justify-between">
                 <div>
                     <p className="font-medium text-sm">Email Weekly Summary</p>
                     <p className="text-xs text-muted-foreground">Every Sunday at 5:00 PM</p>
                 </div>
                 <Switch defaultChecked />
             </div>
          </CardContent>
       </Card>
    </div>
  );
}
