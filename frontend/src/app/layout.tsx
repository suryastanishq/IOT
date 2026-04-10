import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AgroMind | Smart Irrigation Platform",
  description: "Predict. Automate. Conserve. Industrial-grade Smart Irrigation Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased text-slate-900 dark:text-slate-50 bg-gray-50 dark:bg-zinc-950`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
