import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white dark:bg-zinc-950">
        <Link className="flex items-center justify-center font-bold text-green-600 text-xl" href="/">
          AgroMind
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
            <div className="container px-4 md:px-6 max-w-4xl grid gap-6 text-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                    Predict. Automate. Conserve.
                  </h1>
                  <p className="max-w-[800px] text-gray-500 md:text-xl dark:text-gray-400 mx-auto mt-4">
                    Industrial-grade Smart Irrigation Platform driven by AI, IoT telemetry, and interactive 3D visualizations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center pt-8">
                  <Link href="/login">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full md:w-auto h-12 px-8">Get Started</Button>
                  </Link>
                  <Link href="/docs">
                    <Button size="lg" variant="outline" className="w-full md:w-auto h-12 px-8">View Docs</Button>
                  </Link>
                </div>
              </div>
            </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-mono text-sm">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2026 AgroMind. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
