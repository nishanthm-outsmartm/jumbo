import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

export function ServerInstructions() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("npm run dev");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Alert>
      <Terminal className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-medium">Server is not running</p>
          <p className="text-sm">
            To start the development server, open a terminal in the project
            directory and run:
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
              npm run dev
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The server will start on port 3006. Once running, you can use the
            anonymous login feature.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

