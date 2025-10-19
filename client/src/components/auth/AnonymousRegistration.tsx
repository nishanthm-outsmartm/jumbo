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
import { SecretKeyLogin } from "./SecretKeyLogin"; // import the SecretKeyLogin component

interface AnonymousRegistrationProps {
  onSuccess?: () => void;
}

export function AnonymousRegistration({ onSuccess }: AnonymousRegistrationProps) {
  const { createAnonymousUser } = useAuth();
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecretLogin, setShowSecretLogin] = useState(false); // toggle for SecretKeyLogin

  const generateRandomHandle = () => {
    const adjectives = ["Swift", "Bold", "Bright", "Clever", "Daring", "Eager", "Fierce", "Gentle", "Happy", "Jolly"];
    const nouns = ["Tiger", "Eagle", "Lion", "Wolf", "Bear", "Fox", "Hawk", "Falcon", "Phoenix", "Dragon"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const handleGenerateRandom = () => {
    setHandle(generateRandomHandle());
    setError("");
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
      const user = await createAnonymousUser(handle.trim());
      onSuccess?.();
    } catch (err: any) {
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
          Start participating without signing up. Your progress will be saved locally.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSecretLogin ? (
          <SecretKeyLogin onCancel={() => setShowSecretLogin(false)} onSuccess={onSuccess} />
        ) : (
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
                This will be your public name on the platform. Click the shuffle icon to generate a random handle.
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
                <strong>Important:</strong> Your progress is only saved on this device. Clearing cookies or switching devices may erase it. You can connect your account later to protect your points.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join Anonymously
              </Button>

              {/* Secret Login Button */}
              <Button
                type="button"
                className="w-full text-white"
                style={{ backgroundColor: "#0b2238" }}
                size="sm"
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
