import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, AlertTriangle, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BackupCodeVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  action: string;
  description: string;
}

export function BackupCodeVerification({
  open,
  onOpenChange,
  onVerified,
  action,
  description,
}: BackupCodeVerificationProps) {
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) {
      setError("Please enter a backup code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backup-codes/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: backupCode.trim(),
          action: action.toLowerCase().replace(/\s+/g, "_"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid backup code");
      }

      toast({
        title: "Verification Successful!",
        description: "Your backup code has been verified.",
      });

      onVerified();
      onOpenChange(false);
      setBackupCode("");
      setError("");
    } catch (err: any) {
      console.error("Backup code verification error:", err);
      setError(
        err.message || "Invalid backup code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setBackupCode("");
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verify Backup Code
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleVerification} className="space-y-4">
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
              Enter any one of your 8 backup codes to verify this action.
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
              <strong>Security Notice:</strong> This action requires backup code
              verification for your protection. The code will be invalidated
              after use.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & {action}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
