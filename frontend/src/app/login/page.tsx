"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const normalizeAuthError = (err: unknown) => {
    if (err instanceof Error) {
      return err.message.replace("Firebase: ", "").replace(/\(auth.*\)/, "").trim();
    }
    return "Failed to authenticate. Please check your credentials.";
  };

  const handleBypass = () => {
    if (typeof window !== "undefined") {
        localStorage.setItem("demo_logged_in", "true");
        window.location.href = "/dashboard"; // hard reload to trigger context
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-api-key" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        handleBypass();
        return;
    }
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name && userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        router.push("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorMessage = normalizeAuthError(err);
      setError(errorMessage || "Failed to authenticate. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async () => {
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-api-key" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        handleBypass();
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        router.push("/dashboard");
    } catch (err: unknown) {
        setError(`${normalizeAuthError(err)} - Did you set valid firebase keys?`);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center justify-center text-green-600 dark:text-green-500">
             AgroMind
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Create a new smart farming account" : "Sign in to your smart irrigation dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</div>}
            
            {isSignUp && (
               <div className="space-y-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input 
                   id="name" 
                   type="text" 
                   placeholder="John Doe" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   required
                 />
               </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="farmer@agromind.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
            
            <div className="text-center mt-2 text-sm text-gray-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                type="button" 
                className="text-green-600 hover:underline border-0 bg-transparent cursor-pointer"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
              Google
            </Button>
            
            {(process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-api-key" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) && (
                <div className="text-xs text-center mt-4 text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                   <strong>Demo Mode Active:</strong> Ensure keys in .env.local are correct.
                </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
