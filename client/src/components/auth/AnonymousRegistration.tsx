import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, AlertTriangle, Shuffle } from "lucide-react";

interface AnonymousRegistrationProps {
  onSuccess?: () => void;
}

export function AnonymousRegistration({
  onSuccess,
}: AnonymousRegistrationProps) {
  const { createAnonymousUser } = useAuth();
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate random handle names
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

  const handleGenerateRandom = () => {
    setHandle(generateRandomHandle());
    setError(""); // Clear any previous errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError("Please enter a handle");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Creating anonymous user with handle:", handle.trim());
      const user = await createAnonymousUser(handle.trim());
      console.log("Anonymous user created successfully:", user);
      onSuccess?.();
    } catch (err: any) {
      console.error("Anonymous user creation error:", err);
      setError(
        err.message ||
          "Failed to create anonymous account. Please make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Join Anonymously
        </CardTitle>
        <CardDescription>
          Start participating without signing up. Your progress will be saved
          locally.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle">Choose a Handle</Label>
            <div className="flex gap-2">
              <Input
                id="handle"
                type="text"
                placeholder="Enter your handle or generate one"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                disabled={loading}
                maxLength={20}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateRandom}
                disabled={loading}
                className="px-3"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This will be your public name on the platform. Click the shuffle
              icon to generate a random handle.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Your progress is only saved on this
              device. Clearing cookies or switching devices may erase it. You
              can connect your account later to protect your points.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Anonymously
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
