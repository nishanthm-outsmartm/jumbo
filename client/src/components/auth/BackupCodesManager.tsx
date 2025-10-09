import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Copy,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function BackupCodesManager() {
  const [backupCodes, setBackupCodes] = useState<any[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load existing backup codes
  useEffect(() => {
    if (user) {
      loadBackupCodes();
    }
  }, [user]);

  const loadBackupCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backup-codes", {
        headers: {
          "x-user-id": user?.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.codes || []);
      }
    } catch (error) {
      console.error("Error loading backup codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewCodes = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/backup-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.codes || []);
        setShowCodes(true);
        toast({
          title: "New Backup Codes Generated",
          description: "Your old backup codes have been invalidated.",
        });
      } else {
        throw new Error("Failed to generate backup codes");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate backup codes",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `Jumbo Jolt Backup Codes\n\nUsername: ${
          user?.handle
        }\n\nBackup Codes:\n${backupCodes
          .map((code) => code.codeDisplay)
          .join(
            "\n"
          )}\n\nKeep these codes safe! Each code can only be used once.\n\nUse these codes if you lose access to your account.`,
      ],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `jumbo-jolt-backup-codes-${user?.handle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyAllCodes = async () => {
    const codesText = backupCodes.map((code) => code.codeDisplay).join("\n");
    try {
      await navigator.clipboard.writeText(codesText);
      toast({
        title: "Copied!",
        description: "All backup codes copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Backup Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please log in to manage backup codes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Backup Codes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Backup codes are used to recover your account if you lose access.
            Each code can only be used once. Generate new codes to invalidate
            old ones.
          </AlertDescription>
        </Alert>

        {backupCodes.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Your Backup Codes ({backupCodes.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCodes(!showCodes)}
                >
                  {showCodes ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showCodes ? "Hide" : "Show"} Codes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAllCodes}
                  disabled={!showCodes}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showCodes && (
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <Badge
                    key={code.id}
                    variant="outline"
                    className="font-mono text-xs justify-center py-2"
                  >
                    {code.codeDisplay}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={downloadBackupCodes}
                variant="outline"
                className="flex-1"
                disabled={!showCodes}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={generateNewCodes}
                variant="destructive"
                className="flex-1"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have any backup codes yet.
            </p>
            <Button onClick={generateNewCodes} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Generate Backup Codes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
