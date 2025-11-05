import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedAnonymousRegistration } from "@/components/auth/EnhancedAnonymousRegistration";
import { SecretKeyLogin } from "@/components/auth/SecretKeyLogin";
import { useLocation } from "wouter";
import { LogIn, KeyRound, ShieldCheck } from "lucide-react";

export default function Connect() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showSecretLogin, setShowSecretLogin] = useState(false);
  const [showAnonymousRegistration, setShowAnonymousRegistration] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
;

  if (showAnonymousRegistration) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0b2238 0%, #154a7a 100%)" }}
      >
        <div className="max-w-md w-full px-4">
          <EnhancedAnonymousRegistration
            onSuccess={() => navigate("/")}
            onCancel={() => setShowAnonymousRegistration(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #0b2238 0%, #154a7a 100%)" }}
    >
      <div className="max-w-md w-full px-4">
        <Card className="shadow-2xl rounded-3xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Pick a Handle</h2>
              <p className="text-sm text-gray-600">
                Choose how you want to join JumboJolt. You can start anonymously or use your secret key to continue your journey.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setShowAnonymousRegistration(true)}
                className="w-full justify-center py-6 text-base rounded-xl bg-[#0b2238] hover:bg-[#132f56] text-white flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Join Anonymously
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center py-6 text-base rounded-xl border-2"
                onClick={() => setShowSecretLogin(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Login with Secret Key
              </Button>

              <Button
                className="w-full justify-center py-6 text-base rounded-xl bg-[#3b63f0] hover:bg-[#3357d8] text-white"
                onClick={() => navigate("/login")}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login / Sign Up
              </Button>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <ShieldCheck className="h-4 w-4 text-[#0b2238]" />
              <span>
                Your data is anonymous by default. You can later secure it using a recovery key.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSecretLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <SecretKeyLogin
              onSuccess={() => {
                setShowSecretLogin(false);
                navigate("/");
              }}
              onCancel={() => setShowSecretLogin(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}