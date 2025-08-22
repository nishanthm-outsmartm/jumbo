import React, { useState } from "react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Zap, Phone, Shield, Mail, Chrome } from "lucide-react";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "verification">("phone");
  const [authMethod, setAuthMethod] = useState<"phone" | "email" | "google">(
    "email"
  );
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    // Initialize reCAPTCHA
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        }
      );
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmationResult);
      setStep("verification");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(
        "Phone authentication is not enabled in Firebase. Please use email login or contact admin."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const user = userCredential.user;

      // Try to login or handle registration
      try {
        await login(user.uid);
        navigate("/");
      } catch (error: any) {
        // Check for user-not-found error from your backend
        const msg = error?.message?.toLowerCase?.() || "";
        if (isSignUp) {
          navigate("/register");
        } else if (msg.includes("not found") || msg.includes("no user")) {
          alert("Account exists in Firebase but not registered. Please sign up first.");
        } else {
          alert(error.message || "An unexpected error occurred during login.");
        }
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      if (error.code === "auth/user-not-found" && !isSignUp) {
        alert("No account found. Please sign up first.");
        setIsSignUp(true);
      } else if (error.code === "auth/email-already-in-use") {
        alert("Account already exists. Please sign in.");
        setIsSignUp(false);
      } else {
        alert(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Try to login or handle registration
      try {
        await login(user.uid);
        navigate("/");
      } catch (error: any) {
        const msg = error?.message?.toLowerCase?.() || "";
        if (msg.includes("not found") || msg.includes("no user")) {
          alert("Account exists in Google but not registered. Please sign up first.");
        } else {
          alert(error.message || "An unexpected error occurred during login.");
        }
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      alert(error.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(verificationCode);
        const user = result.user;

        // Try to login or redirect to registration
        try {
          await login(user.uid);
          navigate("/");
        } catch (error) {
          // User not registered, redirect to registration
          navigate("/register");
        }
      }
    } catch (error) {
      console.error("Error verifying code:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Zap className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-blue-900">JumboJolt</h2>
          <p className="mt-2 text-gray-600">
            Switch to Indian alternatives with confidence
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === "phone"
                ? "Sign in with Phone"
                : "Enter Verification Code"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <div className="mt-1 relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="pl-10"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Check your SMS for the verification code
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("phone");
                    setVerificationCode("");
                    setConfirmationResult(null);
                  }}
                  className="w-full"
                >
                  Back to Phone Number
                </Button>
              </form>
            )}

            <div id="recaptcha-container" />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <a href="#" className="text-orange-500 hover:text-orange-600">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-orange-500 hover:text-orange-600">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
