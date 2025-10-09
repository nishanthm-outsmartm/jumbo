import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Shield } from "lucide-react";
import { ConnectAccountButton } from "./ConnectAccountButton";

export function AnonymousUserBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.userType !== "ANONYMOUS" || dismissed) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Icon and text */}
        <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left flex-1">
          <div className="flex justify-center sm:justify-start mb-2 sm:mb-0">
            <Shield className="h-5 w-5 text-orange-600 mr-0 sm:mr-2" />
          </div>
          <AlertDescription className="text-sm sm:text-base text-orange-800">
            <strong>Anonymous User:</strong> Your progress is saved locally.
            Connect your account to protect your {user.points} points and access
            them from any device.
          </AlertDescription>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <ConnectAccountButton
            variant="outline"
            size="sm"
            showIcon={false}
            className="text-orange-700 border-orange-300 hover:bg-orange-100 w-full sm:w-auto"
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
      </div>
    </Alert>
  );
}
