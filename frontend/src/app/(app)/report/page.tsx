"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoFarm, zoneCrop } from "@/lib/farm-config";

export default function ReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const cropA = zoneCrop(demoFarm.zones[0]);
  const cropB = zoneCrop(demoFarm.zones[1]);

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 12;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(img, "PNG", 6, 6, imgWidth, imgHeight);
      pdf.save(`agromind-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Submission Report</h1>
        <Button onClick={downloadPdf} disabled={downloading}>
          {downloading ? "Generating PDF..." : "Export PDF"}
        </Button>
      </div>
      <div ref={reportRef} className="bg-white text-black p-4 rounded-lg border space-y-4">
        <h2 className="text-2xl font-semibold">AgroMind Production Report</h2>
        <p>Farm: {demoFarm.farmName} | State: {demoFarm.state} | Date: {new Date().toLocaleDateString()}</p>
        <Card>
          <CardHeader><CardTitle>Zones</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p>Zone A: {cropA.name_en} ({cropA.name_hi}) | Area: {demoFarm.zones[0].areaSqm} sqm</p>
            <p>Zone B: {cropB.name_en} ({cropB.name_hi}) | Area: {demoFarm.zones[1].areaSqm} sqm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Telemetry Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p>Zone A moisture: {demoFarm.zones[0].moisture}%</p>
            <p>Zone B moisture: {demoFarm.zones[1].moisture}%</p>
            <p>Flow rate baseline: {demoFarm.flowRateLpm} L/min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Results Summary</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p>Dual-zone MQTT control active with direct web publish.</p>
            <p>Crop-aware threshold prediction active with trained zone model.</p>
            <p>AI responses cached in Firestore for cost optimization.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
