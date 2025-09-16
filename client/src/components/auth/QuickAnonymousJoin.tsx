import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Shuffle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { testServerConnection } from "@/utils/testServer";

interface QuickAnonymousJoinProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function QuickAnonymousJoin({
  onSuccess,
  variant = "outline",
  size = "default",
  className = "",
}: QuickAnonymousJoinProps) {
  const { createAnonymousUser } = useAuth();
  const [loading, setLoading] = useState(false);

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

  const handleQuickJoin = async () => {
    setLoading(true);

    try {
      // Test server connection first
      const serverRunning = await testServerConnection();
      if (!serverRunning) {
        throw new Error(
          "Server is not running. Please start the development server with 'npm run dev'"
        );
      }

      const randomHandle = generateRandomHandle();
      console.log("Creating anonymous user with handle:", randomHandle);

      const user = await createAnonymousUser(randomHandle);
      console.log("Anonymous user created successfully:", user);

      toast({
        title: "Welcome!",
        description: `You're now logged in as ${randomHandle}. You can connect your account later to protect your progress.`,
      });

      onSuccess?.();
    } catch (err: any) {
      console.error("Anonymous user creation error:", err);
      toast({
        title: "Error",
        description:
          err.message ||
          "Failed to create anonymous account. Please make sure the server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleQuickJoin}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Shuffle className="h-4 w-4" />
      )}
      <Shield className="h-4 w-4" />
      {loading ? "Joining..." : "Join Anonymously"}
    </Button>
  );
}
