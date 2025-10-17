import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Key, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AccountVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
  action: "export" | "delete";
}

export function AccountVerification({
  onSuccess,
  onCancel,
  action,
}: AccountVerificationProps) {
  const [secretKey, setSecretKey] = useState("");
  const [password, setPassword] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      let verificationData;

      if (user.userType === "ANONYMOUS") {
        // For anonymous users, verify with secret key
        if (!secretKey.trim()) {
          toast({
            title: "Error",
            description: "Secret key is required for anonymous users",
            variant: "destructive",
          });
          return;
        }

        verificationData = {
          type: "secret_key",
          secretKey: secretKey.trim(),
        };
      } else {
        // For registered users, verify with password
        if (!password.trim()) {
          toast({
            title: "Error",
            description: "Password is required for registered users",
            variant: "destructive",
          });
          return;
        }

        verificationData = {
          type: "password",
          password: password.trim(),
        };
      }

      const response = await fetch(`/api/gdpr/verify-${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      toast({
        title: "Verification Successful",
        description: `You can now ${action} your account data.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getActionTitle = () => {
    return action === "export" ? "Export Account Data" : "Delete Account";
  };

  const getActionDescription = () => {
    return action === "export"
      ? "Verify your identity to export your account data"
      : "Verify your identity to permanently delete your account";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {getActionTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertDescription>{getActionDescription()}</AlertDescription>
          </Alert>

          {user?.userType === "ANONYMOUS" ? (
            <div className="space-y-2">
              <Label htmlFor="secretKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Secret Key
              </Label>
              <div className="relative">
                <Input
                  id="secretKey"
                  type={showSecretKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your secret key"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the secret key you received when you created your account
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your account password to verify your identity
              </p>
            </div>
          )}

          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong>{" "}
              {action === "delete"
                ? "This action cannot be undone. All your data will be permanently deleted."
                : "This will create a downloadable file with all your account data."}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button type="submit" disabled={isVerifying} className="flex-1">
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                `Verify & ${action === "export" ? "Export" : "Delete"}`
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
