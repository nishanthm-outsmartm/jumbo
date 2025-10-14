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
import {
  Loader2,
  Key,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BackupCodeLoginProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function BackupCodeLogin({ onSuccess, onBack }: BackupCodeLoginProps) {
  const { useRecoveryKey } = useAuth();
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) {
      setError("Please enter a backup code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backup-codes/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: backupCode.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid backup code");
      }

      const data = await response.json();

      // Use the recovery key function to set the user in context
      await useRecoveryKey(backupCode.trim());

      toast({
        title: "Login Successful!",
        description: "You have been logged in using your backup code.",
      });

      onSuccess?.();
    } catch (err: any) {
      console.error("Backup code login error:", err);
      setError(
        err.message || "Invalid backup code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Login with Backup Code
        </CardTitle>
        <CardDescription>
          Enter one of your backup codes to recover your anonymous account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backupCode">Backup Code</Label>
            <Input
              id="backupCode"
              type="text"
              placeholder="Enter your 8-character backup code"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={8}
              className="font-mono text-center text-lg tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              Enter any one of your 8 backup codes. Each code can only be used
              once.
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
              <strong>Important:</strong> Using a backup code will invalidate
              it. Make sure you have other backup codes saved if you need to
              recover your account again.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login with Code
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
