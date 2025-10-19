import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Key,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BackupCodesDialogProps {
  children: React.ReactNode;
}

interface BackupCode {
  id: string;
  code: string;
  used: boolean;
  createdAt: string;
}

export function BackupCodesDialog({ children }: BackupCodesDialogProps) {
  const { user, generateRecoveryKey } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [codesGenerated, setCodesGenerated] = useState(false);
  const [hasExistingCodes, setHasExistingCodes] = useState(false);

  // Check if backup codes already exist
  useEffect(() => {
    if (user && user.userType === "ANONYMOUS") {
      checkExistingBackupCodes();
    }
  }, [user]);

  const checkExistingBackupCodes = async () => {
    try {
      console.log("Checking existing backup codes for user:", user?.id);
      const response = await fetch(
        `/api/backup-codes/check?userId=${user?.id}`
      );
      console.log("Check response:", response);
      if (response.ok) {
        const data = await response.json();
        console.log("Check data:", data);
        setHasExistingCodes(data.hasCodes);
        if (data.hasCodes) {
          // Fetch the actual backup codes to display them
          await fetchExistingBackupCodes();
        }
      } else {
        console.error(
          "Failed to check backup codes:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Failed to check existing backup codes:", error);
    }
  };

  const fetchExistingBackupCodes = async () => {
    try {
      console.log("Fetching backup codes for user:", user?.id);
      const response = await fetch(`/api/backup-codes?userId=${user?.id}`);
      console.log("Backup codes response:", response);
      if (response.ok) {
        const data = await response.json();
        console.log("Backup codes data:", data);
        const codes: BackupCode[] = data.codes.map(
          (code: any, index: number) => ({
            id: `code_${index + 1}`,
            code: code.codeDisplay,
            used: code.isUsed,
            createdAt: code.createdAt,
          })
        );
        console.log("Mapped backup codes:", codes);
        setBackupCodes(codes);
        setCodesGenerated(true);
        setShowCodes(true);
      } else {
        console.error(
          "Failed to fetch backup codes:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Failed to fetch existing backup codes:", error);
    }
  };

  const generateBackupCodes = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Generate 8 backup codes locally for display
      const codes: BackupCode[] = Array.from({ length: 8 }, (_, index) => ({
        id: `code_${index + 1}`,
        code: generateRandomCode(),
        used: false,
        createdAt: new Date().toISOString(),
      }));

      // Save backup codes to server
      const response = await fetch("/api/backup-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ codes: codes.map((c) => c.code) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save backup codes");
      }

      setBackupCodes(codes);
      setCodesGenerated(true);
      setShowCodes(true);
      setHasExistingCodes(true);

      toast({
        title: "Backup Codes Generated!",
        description: "Please save these codes in a secure location.",
      });
    } catch (err: any) {
      console.error("Backup codes generation error:", err);
      setError(
        err.message || "Failed to generate backup codes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyAllCodes = () => {
    const unusedCodes = backupCodes.filter((code) => !code.used);
    const codesText = unusedCodes.map((code) => code.code).join("\n");
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Codes Copied!",
      description: `${unusedCodes.length} unused backup codes have been copied to your clipboard.`,
    });
  };

  const downloadCodes = () => {
    const unusedCodes = backupCodes.filter((code) => !code.used);
    const codesText = `JumboJolt Backup Codes\nGenerated: ${new Date().toLocaleDateString()}\n\nUnused Codes:\n${unusedCodes
      .map((code) => code.code)
      .join("\n")}\n\nUsed Codes:\n${backupCodes
      .filter((code) => code.used)
      .map((code) => `${code.code} (Used on ${code.createdAt})`)
      .join(
        "\n"
      )}\n\nIMPORTANT: Keep these codes safe and private. Anyone with these codes can access your account.`;

    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jumbojolt-backup-codes-${user?.handle || "anonymous"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Codes Downloaded!",
      description: "Backup codes have been saved to your device.",
    });
  };

  const resetDialog = () => {
    setBackupCodes([]);
    setShowCodes(false);
    setCodesGenerated(false);
    setError("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetDialog();
    }
  };

  if (!user || user.userType !== "ANONYMOUS") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Generate Backup Codes
          </DialogTitle>
          <DialogDescription>
            Create backup codes to recover your anonymous account if you lose
            access.
          </DialogDescription>
        </DialogHeader>

        {!codesGenerated ? (
          <div className="space-y-4">
            {hasExistingCodes ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Backup codes already generated!</strong> You can
                    only generate backup codes once when creating your account.
                    If you've lost your codes, you'll need to create a new
                    account.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={fetchExistingBackupCodes}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  View My Backup Codes
                </Button>
              </div>
            ) : (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recovery Warning:</strong> Anyone with this key/QR
                    can access your handle and points. Keep it private. We can't
                    restore it if lost.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div
  className="p-4 rounded-lg"
  style={{ backgroundColor: "#0b2238", border: "1px solid #0b2238" }}
>
  <h3 className="font-semibold mb-2" style={{ color: "#0b2238" }}>
    What are backup codes?
  </h3>
  <ul className="text-sm space-y-1" style={{ color: "#0b2238" }}>
    <li>• 8 unique codes to recover your account</li>
    <li>• Each code can only be used once</li>
    <li>• Store them in a secure location</li>
    <li>• Use them if you lose access to your device</li>
  </ul>
</div>


                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={generateBackupCodes}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate 8 Backup Codes
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Your backup codes have been generated.
                Please save them now - you won't be able to see them again.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Your Backup Codes</h3>
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
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyAllCodes}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCodes}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                {backupCodes.map((code, index) => (
                  <div
                    key={code.id}
                    className={`flex items-center justify-between p-2 rounded border ${
                      code.used
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <span className="text-sm font-mono">
                      {showCodes ? code.code : "••••••••"}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                      {code.used && (
                        <span className="text-xs text-red-500">Used</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Store these codes in a secure
                  location. Anyone with these codes can access your account. We
                  cannot recover them if lost.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetDialog}
                  className="flex-1"
                >
                  Generate New Codes
                </Button>
                <Button
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
