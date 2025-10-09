import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 text-primary">
                <Cookie className="h-6 w-6" />
                <Shield className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">
                  Cookie & Privacy Notice
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We use essential cookies to store your handle and progress.
                  You can request your data or delete it anytime. See our
                  Privacy Policy for more details.
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Anonymous Users:</strong> Your data is stored locally
                  on your device and can be recovered using your recovery key.{" "}
                  <strong>Registered Users:</strong> Your data is stored
                  securely on our servers and can be exported or deleted at any
                  time.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAccept} className="flex-1">
                  Accept & Continue
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="flex-1"
                >
                  Decline
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecline}
              className="flex-shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
