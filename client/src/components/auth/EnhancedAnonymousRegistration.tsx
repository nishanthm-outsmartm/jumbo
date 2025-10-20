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
      console.log("Starting registration with:", { handle, selectedState });
      const result = await createUserWithSecretKey(handle, selectedState);
      console.log("Registration result:", result);

      if (result && result.secretKey) {
        setSecretKey(result.secretKey);
        setShowSecretKey(true);
        setIsGeneratingKey(false);
        console.log("Secret key set:", result.secretKey);
        console.log("Dialog should stay open to show secret key");
        console.log(
          "NOT calling onSuccess automatically - waiting for user confirmation"
        );
        // Store the user for the onSuccess callback
        setCreatedUser(result.user);

        toast({
          title: "Success!",
          description:
            "Your anonymous account has been created with a secret key.",
        });
      } else {
        console.error("No secret key in result:", result);
        setIsGeneratingKey(false);
        toast({
          title: "Error",
          description: "No secret key received from server",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setIsGeneratingKey(false);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      toast({
        title: "Copied!",
        description: "Secret key copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadSecretKey = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `Jumbo Jolt Secret Key\n\nUsername: ${handle}\nSecret Key: ${secretKey}\n\nKeep this safe! You'll need it to log in on other devices.\n\nThis is your only way to access your account from other devices.`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `jumbo-jolt-secret-key-${handle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadQRCode = () => {
    // This would generate a QR code with the secret key
    // For now, we'll just show a message
    toast({
      title: "QR Code",
      description: "QR code generation will be implemented soon",
    });
  };

  if (showSecretLogin) {
    return (
      <SecretKeyLogin
        onCancel={() => setShowSecretLogin(false)}
        onSuccess={onSuccess}
      />
    );
  }

  // ✅ Secret Key Display view
  if (showSecretKey) {
    console.log("Rendering secret key display, keyConfirmed:", keyConfirmed);
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            🎉 Account Created!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>⚠️ CRITICAL:</strong> Save your secret key now! This is
              your only way to log in again.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Your Secret Key:</Label>
            <div className="flex items-center gap-2">
              <Input
                value={secretKey}
                readOnly
                className="font-mono text-sm bg-yellow-50 border-yellow-200"
              />
              <Button
                size="sm"
                onClick={copySecretKey}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-amber-600 font-medium">
              🔑 This key allows you to log in from any device using your
              username.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={downloadSecretKey}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Secret Key
            </Button>
          </div>

          {!keyConfirmed && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm">⚠️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 mb-1">
                    Confirm you've saved your key
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Please copy or download your secret key before continuing.
                  </p>
                  <Button
                    onClick={() => {
                      setKeyConfirmed(true);
                      setHasExplicitlyConfirmed(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    size="sm"
                  >
                    I have saved my secret key
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (keyConfirmed && createdUser && hasExplicitlyConfirmed) {
                  confirmSecretKeyUser(createdUser);
                  onSuccess?.(createdUser);
                }
              }}
              className="flex-1 bg-[#0b2238] text-white"
              disabled={
                !keyConfirmed || !createdUser || !hasExplicitlyConfirmed
              }
            >
              Continue
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Default Registration Form
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Anonymously</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle">Choose a Username</Label>
            <div className="flex gap-2">
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onBlur={() => checkHandleAvailability(handle)}
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
                <Loader2 className="h-4 w-4 animate-spin" /> Checking
                availability...
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
              <strong>Note:</strong> Your progress will be saved with a secret
              key. Keep it safe - you'll need it to log in again.
            </AlertDescription>
          </Alert>

          {isGeneratingKey && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">
                  Generating your secret key...
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Please wait while we create your secure access key.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="flex-1 bg-[#0b2238] text-white"
              disabled={isSubmitting || isAvailable === false || !selectedState}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>

            <p className="text-center text-sm font-medium text-gray-500 my-1">
              OR
            </p>

            <Button
              type="button"
              className="flex-1 bg-[#0b2238] text-white"
              onClick={() => setShowSecretLogin(true)}
            >
              Login with Secret
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
