"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingDown, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const waterData = [
  { name: "Mon", smart: 340, manual: 450 },
  { name: "Tue", smart: 310, manual: 450 },
  { name: "Wed", smart: 0, manual: 400 }, // Rain day
  { name: "Thu", smart: 280, manual: 450 },
  { name: "Fri", smart: 290, manual: 450 },
  { name: "Sat", smart: 310, manual: 450 },
  { name: "Sun", smart: 300, manual: 450 },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const downloadReport = () => router.push("/report");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Historical records, cost savings, and AI insights.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline"><Database className="mr-2 h-4 w-4"/> Export CSV</Button>
           <Button className="bg-green-600 hover:bg-green-700" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4"/> PDF Report
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-green-800 dark:text-green-300">Water Savings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">1,270 L</div>
                <p className="text-sm font-medium text-green-600 dark:text-green-500 mt-1 flex items-center">
                    <TrendingDown className="mr-1 h-4 w-4"/> 23% vs manual scheduling
                </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>Crop Health Score</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end mb-2">
                    <div className="text-3xl font-bold font-mono">94<span className="text-lg text-gray-500 font-sans">/100</span></div>
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Excellent</Badge>
                </div>
                <Progress value={94} className="h-2 bg-gray-100" />
                <p className="text-xs text-muted-foreground mt-3">Derived from moisture consistency (Zone A & B)</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
                <CardTitle>Irrigation Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end mb-2">
                    <div className="text-3xl font-bold font-mono">88<span className="text-lg text-gray-500 font-sans">%</span></div>
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Optimal</Badge>
                </div>
                <Progress value={88} className="h-2 bg-blue-100" />
                <p className="text-xs text-muted-foreground mt-3">Time spent in optimal moisture range</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card className="md:col-span-2">
           <CardHeader>
             <CardTitle>Water Usage Comparison (Litres)</CardTitle>
             <CardDescription>Smart Strategy vs Manual Timer Strategy</CardDescription>
           </CardHeader>
           <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip cursor={{fill: 'transparent'}}/>
                        <Bar dataKey="smart" name="Smart Irrigation" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="manual" name="Est. Manual" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
           </CardContent>
         </Card>

         <div className="space-y-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">AI Generated Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-900 dark:text-blue-100">
                        <span className="font-bold block mb-1">Cost Savings Goal</span>
                        You have conserved enough water to save approx ₹450 on pumping electricity costs this month.
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded text-sm text-amber-900 dark:text-amber-100">
                        <span className="font-bold block mb-1">Zone B Anomaly</span>
                        Zone B is drying 15% faster than other zones. Check for potential soil exposure or localized heat.
                    </div>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
