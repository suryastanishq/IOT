"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { AgroBot } from "@/components/chat/AgroBot";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Mock mode logic might bypass this, but standard
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading AgroMind...</div>;
  }

  if (!user) {
    return null; // Don't render layout elements if actively redirecting
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto w-full p-6">
          {children}
        </main>
      </div>
      <AgroBot />
    </div>
  );
}
