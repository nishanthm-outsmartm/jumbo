import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertTriangle, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RecoveryKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryKeyModal({ open, onOpenChange }: RecoveryKeyModalProps) {
  const { generateRecoveryKey } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<{
    keyDisplay: string;
    qrCodeData: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const key = await generateRecoveryKey();
      setRecoveryKey(key);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recovery key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (recoveryKey) {
      await navigator.clipboard.writeText(recoveryKey.keyDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Recovery key copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setRecoveryKey(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recovery Key
          </DialogTitle>
          <DialogDescription>
            Generate a recovery key to restore your anonymous account on other devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!recoveryKey ? (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Anyone with this key can access your handle and points. 
                  Keep it private. We cannot restore it if lost.
                </AlertDescription>
              </Alert>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Recovery Key
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Save this key securely!</strong> This is the only way to recover your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Your Recovery Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={recoveryKey.keyDisplay}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>QR Code Data</Label>
                <div className="p-3 bg-muted rounded-md">
                  <code className="text-sm break-all">{recoveryKey.qrCodeData}</code>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={handleGenerate} variant="outline" className="flex-1">
                  Generate New Key
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
