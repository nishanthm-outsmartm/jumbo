import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Shuffle,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Copy,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SecretKeyLogin } from "./SecretKeyLogin";

interface EnhancedAnonymousRegistrationProps {
  onSuccess?: (user: any) => void;
  onCancel?: () => void;
}

const INDIAN_STATES = [
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
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function EnhancedAnonymousRegistration({
  onSuccess,
  onCancel,
}: EnhancedAnonymousRegistrationProps) {
  console.log("EnhancedAnonymousRegistration component mounted/updated");

  // Debug component unmounting
  useEffect(() => {
    return () => {
      console.log("EnhancedAnonymousRegistration component unmounting");
    };
  }, []);

  // Track component lifecycle
  useEffect(() => {
    console.log("EnhancedAnonymousRegistration component mounted");
    return () => {
      console.log("EnhancedAnonymousRegistration component unmounting");
    };
  }, []);

  const [handle, setHandle] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [hasExplicitlyConfirmed, setHasExplicitlyConfirmed] = useState(false);
  const [showSecretLogin, setShowSecretLogin] = useState(false);


  // Debug state changes
  useEffect(() => {
    console.log("showSecretKey changed to:", showSecretKey);
  }, [showSecretKey]);

  useEffect(() => {
    console.log("keyConfirmed changed to:", keyConfirmed);
  }, [keyConfirmed]);

  // Debug onSuccess callback
  useEffect(() => {
    console.log("onSuccess callback changed:", onSuccess);
  }, [onSuccess]);
  const { createUserWithSecretKey, confirmSecretKeyUser } = useAuth();
  const { toast } = useToast();

  // Generate random handle suggestion
  const generateRandomHandle = () => {
    const adjectives = [
      "Swift",
      "Bold",
      "Bright",
      "Clever",
      "Daring",
      "Eager",
      "Fierce",
      "Gentle",
      "Happy",
      "Jolly",
      "Kind",
      "Lively",
      "Merry",
      "Noble",
      "Proud",
      "Quick",
      "Radiant",
      "Smart",
      "Tough",
      "Vibrant",
      "Wise",
      "Zesty",
      "Brave",
      "Calm",
      "Cool",
      "Epic",
      "Fresh",
      "Golden",
      "Heroic",
      "Lucky",
      "Magic",
      "Neon",
      "Ocean",
      "Peppy",
      "Royal",
      "Super",
      "Turbo",
      "Ultra",
      "Wild",
      "Zen",
    ];

    const nouns = [
      "Tiger",
      "Eagle",
      "Lion",
      "Wolf",
      "Bear",
      "Fox",
      "Hawk",
      "Falcon",
      "Phoenix",
      "Dragon",
      "Shark",
      "Panther",
      "Jaguar",
      "Leopard",
      "Cheetah",
      "Raven",
      "Crow",
      "Owl",
      "Sparrow",
      "Robin",
      "Cardinal",
      "Falcon",
      "Hawk",
      "Warrior",
      "Guardian",
      "Champion",
      "Hero",
      "Legend",
      "Master",
      "Ninja",
      "Samurai",
      "Knight",
      "Wizard",
      "Mage",
      "Sage",
      "Explorer",
      "Pioneer",
      "Voyager",
      "Adventurer",
      "Seeker",
      "Hunter",
      "Ranger",
      "Scout",
      "Spy",
    ];

    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;

    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  // Generate initial handle suggestion
  useEffect(() => {
    if (!handle) {
      setHandle(generateRandomHandle());
    }
  }, []);

  // Check handle availability
   const checkHandleAvailability = async (handleToCheck: string) => {
    if (!handleToCheck.trim()) {
      setIsAvailable(null);
      return;
    }
    setIsCheckingAvailability(true);
    try {
      const res = await fetch("/api/auth/check-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handleToCheck }),
      });
      const data = await res.json();
      setIsAvailable(data.available);
    } catch (err) {
      console.error(err);
      setIsAvailable(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  }

  // Debounced availability check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (handle) checkHandleAvailability(handle);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [handle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !selectedState) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (isAvailable === false) {
      toast({ title: "Error", description: "Handle is not available", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setIsGeneratingKey(true);
    try {
      const result = await createUserWithSecretKey(handle, selectedState);
      if (result && result.secretKey) {
        setSecretKey(result.secretKey);
        setShowSecretKey(true);
        setIsGeneratingKey(false);
        setCreatedUser(result.user);
        toast({ title: "Success!", description: "Your anonymous account has been created with a secret key." });
      } else {
        throw new Error("No secret key received from server");
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Failed to create account.", variant: "destructive" });
      setIsGeneratingKey(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSecretLogin) {
    return <SecretKeyLogin onCancel={() => setShowSecretLogin(false)} onSuccess={onSuccess} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Anonymously</CardTitle>
      </CardHeader>
      <CardContent>
        {showSecretKey ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>⚠️ CRITICAL:</strong> Save your secret key now! You won't see it again.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <Input value={secretKey} readOnly className="font-mono text-sm bg-yellow-50 border-yellow-200 flex-1" />
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (keyConfirmed && createdUser && hasExplicitlyConfirmed) {
                  confirmSecretKeyUser(createdUser);
                  onSuccess?.(createdUser);
                }
              }}
              disabled={!keyConfirmed || !createdUser || !hasExplicitlyConfirmed}
            >
              Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle">Choose a Username</Label>
              <div className="flex gap-2">
                <Input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="Enter username"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHandle(generateRandomHandle())}
                  disabled={isCheckingAvailability}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
              {isCheckingAvailability && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking availability...
                </div>
              )}
              {isAvailable === true && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Username is available
                </div>
              )}
              {isAvailable === false && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4" /> Username is taken
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Select Your State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> Your progress will be saved with a secret key.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="flex-1"
                style={{ backgroundColor: "#0b2238", color: "#fff" }}
                disabled={isSubmitting || isAvailable === false || !selectedState}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Create Account"}
              </Button>

              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>

              {/* Secret login button */}
              <Button
                type="button"
                size="sm"
                style={{ backgroundColor: "#0b2238", color: "#fff" }}
                onClick={() => setShowSecretLogin(true)}
              >
                Login with Secret
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
