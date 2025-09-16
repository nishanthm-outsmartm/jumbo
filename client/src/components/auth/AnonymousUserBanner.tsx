import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, UserPlus, Shield } from "lucide-react";
import { ConnectAccountButton } from "./ConnectAccountButton";

export function AnonymousUserBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Only show for anonymous users
  if (!user || user.userType !== "ANONYMOUS" || dismissed) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Shield className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>Anonymous User:</strong> Your progress is saved locally.
          Connect your account to protect your {user.points} points and access
          them from any device.
        </div>
        <div className="flex items-center gap-2 ml-4">
          <ConnectAccountButton
            variant="outline"
            size="sm"
            showIcon={false}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
