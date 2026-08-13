"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    password: string;
    phone_number: string;
    role: string;
  }>({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "patient",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone_number: formData.phone_number.trim(),
        role: formData.role,
      };

      await api.post("/auth/register", payload);
      toast.success("Account created successfully. Please login.");
      router.push("/login");
    } catch (error: any) {
      const detail = error.response?.data?.detail || "Failed to create account.";
      toast.error(typeof detail === "string" ? detail : "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
        <p className="text-balance text-muted-foreground">
          Enter your details below to get started
        </p>
      </div>
      <form onSubmit={handleRegister} className="grid gap-4">
        <div className="grid gap-2 text-left">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
        </div>
        
        <div className="grid gap-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="m@example.com" />
        </div>

        <div className="grid gap-2 text-left">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input id="phone_number" required value={formData.phone_number} onChange={handleChange} placeholder="+1 (555) 000-0000" />
        </div>

        <div className="grid gap-2 text-left">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(val: string | null) => setFormData(prev => ({ ...prev, role: val ?? "patient" }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 text-left">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline text-blue-600 font-medium hover:text-blue-800 transition-colors">
          Login
        </Link>
      </div>
    </>
  );
}
