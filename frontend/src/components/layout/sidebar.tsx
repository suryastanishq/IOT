"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trees, BarChart3, Settings, Bell, Zap, Route, MapPin, Sprout, BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Live Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Onboarding", href: "/onboarding", icon: MapPin },
  { name: "Crop Advisor", href: "/crop-advisor", icon: Sprout },
  { name: "3D Farm Config", href: "/farm-3d", icon: Trees },
  { name: "Prediction Engine", href: "/predict", icon: Zap },
  { name: "Motor Control", href: "/control", icon: Route },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Report", href: "/report", icon: FileText },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Docs", href: "/docs", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-zinc-950">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-600 text-xl">
          <Trees className="h-6 w-6" />
          <span>AgroMind</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-100"></span>
            <span className="text-xs text-gray-500">All Nodes Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
