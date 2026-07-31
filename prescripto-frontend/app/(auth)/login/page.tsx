"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth, User } from "@/lib/store/useAuth";
import { Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      
      const { access_token } = response.data;
      
      const decoded: any = jwtDecode(access_token);
      
      const user: User = {
        id: decoded.id || 1,
        email: decoded.sub,
        role: decoded.role || 'patient',
        full_name: decoded.name || decoded.sub.split('@')[0],
        avatar_url: decoded.avatar_url ?? null,
      };

      setAuth(access_token, user);
      toast.success("Successfully logged in");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Login</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <form onSubmit={handleLogin} className="grid gap-4">
        <div className="grid gap-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2 text-left">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className="ml-auto inline-block text-sm underline text-slate-600 hover:text-slate-900"
            >
              Forgot your password?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">
          Sign up
        </Link>
      </div>
    </>
  );
}
