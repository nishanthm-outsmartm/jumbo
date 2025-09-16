import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface RecoveryKeyLoginProps {
  onSuccess?: () => void;
}

export function RecoveryKeyLogin({ onSuccess }: RecoveryKeyLoginProps) {
  const { useRecoveryKey } = useAuth();
  const [keyDisplay, setKeyDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyDisplay.trim()) {
      setError('Please enter your recovery key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await useRecoveryKey(keyDisplay.trim());
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Invalid recovery key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Restore Account
        </CardTitle>
        <CardDescription>
          Enter your recovery key to restore your anonymous account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recoveryKey">Recovery Key</Label>
            <Input
              id="recoveryKey"
              type="text"
              placeholder="Enter your recovery key"
              value={keyDisplay}
              onChange={(e) => setKeyDisplay(e.target.value)}
              disabled={loading}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              This is the key you saved when creating your anonymous account
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your recovery key can only be used once. After using it, you'll need to generate a new one.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Restore Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
