import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { User, MapPin, Hash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const animalNames = [
  "Eagle",
  "Tiger",
  "Lion",
  "Wolf",
  "Bear",
  "Fox",
  "Hawk",
  "Owl",
  "Dolphin",
  "Shark",
  "Phoenix",
  "Dragon",
  "Falcon",
  "Panther",
  "Jaguar",
  "Lynx",
  "Cheetah",
  "Leopard",
];

const adjectives = [
  "Swift",
  "Brave",
  "Mighty",
  "Clever",
  "Bold",
  "Fierce",
  "Noble",
  "Wise",
  "Strong",
  "Agile",
  "Sharp",
  "Bright",
  "Quick",
  "Smart",
  "Elite",
  "Prime",
  "Alpha",
  "Royal",
];

export default function Register() {
  const [handle, setHandle] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const { firebaseUser } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    generateHandle();
  }, []);

  const generateHandle = () => {
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal =
      animalNames[Math.floor(Math.random() * animalNames.length)];
    setHandle(`${randomAdjective}${randomAnimal}`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firebaseUser) return;

    // Validate required fields
    if (!handle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a handle",
        variant: "destructive",
      });
      return;
    }

    if (!region.trim()) {
      toast({
        title: "Error",
        description: "Please select your state/region",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await apiRequest("POST", "/api/auth/register", {
        firebaseUid: firebaseUser.uid,
        phone: firebaseUser.phoneNumber,
        email: firebaseUser.email,
        handle: handle.trim(),
        region: region.trim(),
      });

      toast({
        title: "Account created successfully!",
        description: `You can now login to your account`,
      });

      // Registration successful, redirect to home
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error instanceof Error &&
        error.message.includes("Handle already taken")
      ) {
        generateHandle();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-gray-600">
            Join the movement for Indian products
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Anonymous Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <Label htmlFor="handle">Your Anonymous Handle</Label>
                <div className="mt-1 flex">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="handle"
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="pl-10"
                      placeholder="BraveEagle"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateHandle}
                    className="ml-2"
                  >
                    <i className="fas fa-dice h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be your public identity. Your real information stays
                  private.
                </p>
              </div>

              <div>
                <Label htmlFor="region">Your State/Region</Label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Select value={region} onValueChange={setRegion} required>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Helps us connect you with local alternatives and groups.
                </p>
              </div>

              <div className="bg-[#0b2238]/10 border border-[#0b2238]/20 rounded-lg p-4">
  <h4 className="font-medium text-[#0b2238] mb-2">Privacy First</h4>
  <ul className="text-sm text-[#0b2238]/80 space-y-1">
    <li>• Your handle keeps you anonymous</li>
    <li>• Phone/email stays completely private</li>
    <li>• Only you control what to share publicly</li>
    <li>• You can switch products silently or publicly</li>
  </ul>
</div>


              <Button
  type="submit"
  className="w-full bg-gradient-to-r from-[#0b2238] to-[#0b2238] hover:from-[#091b2c] hover:to-[#091b2c] text-white"
  disabled={loading}
>
  {loading ? "Creating Account..." : "Join JumboJolt"}
</Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
