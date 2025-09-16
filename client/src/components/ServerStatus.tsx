import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { ServerInstructions } from "./ServerInstructions";

export function ServerStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServerStatus = async () => {
    setStatus("checking");
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch (error) {
      setStatus("offline");
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "checking":
        return "Checking server status...";
      case "online":
        return "Server is running";
      case "offline":
        return 'Server is not running. Please start with "npm run dev"';
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case "online":
        return "default";
      case "offline":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-2">
      <Alert variant={getStatusVariant()}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <AlertDescription>{getStatusMessage()}</AlertDescription>
        </div>
      </Alert>

      {status === "offline" && <ServerInstructions />}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={checkServerStatus}
          disabled={status === "checking"}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Again
        </Button>

        {lastChecked && (
          <span className="text-sm text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
