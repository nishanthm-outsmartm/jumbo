import React, { useEffect, useLayoutEffect, useState } from "react";
import {
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
import { useLocation } from "wouter";
import { Chrome, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ForgotPasswordForm from "@/components/auth/ForgetPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type AuthView = "login" | "forgot-password" | "reset-password";

export default function EnhancedLogin(mode: { mode?: "login" | "signup" }) {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  useLayoutEffect(() => {
    if (mode.mode === "signup") {
      setIsSignUp(true);
    }
  }, [mode.mode]);

  const getUrlParameter = (name: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  const resetToken = getUrlParameter("token");

  useEffect(() => {
    if (resetToken) {
      setCurrentView("reset-password");
    }
  }, [resetToken]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      try {
        await login(user.uid);
        navigate("/");
      } catch (error) {
        if (isSignUp) navigate("/register");
        else setError("Account exists in Firebase but not registered. Please sign up first.");
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      if (error.code === "auth/user-not-found" && !isSignUp) {
        setError("No account found. Please sign up first.");
        setIsSignUp(true);
      } else if (error.code === "auth/email-already-in-use") {
        setError("Account already exists. Please sign in.");
        setIsSignUp(false);
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Incorrect email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      try {
        await login(user.uid);
        navigate("/");
      } catch (error) {
        setError("Account exists in Google but not registered. Please sign up first.");
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      if (error.code === "auth/popup-closed-by-user") setError("Sign-in cancelled");
      else setError(error.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSuccess = () => setCurrentView("login");
  const handleResetPasswordSuccess = () => {
    setCurrentView("login");
    setEmail("");
    setPassword("");
  };

  if (currentView === "forgot-password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm onBackToLogin={() => setCurrentView("login")} />
      </div>
    );
  }

  if (currentView === "reset-password" && resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm
          token={resetToken}
          onSuccess={handleResetPasswordSuccess}
          onBackToLogin={() => setCurrentView("login")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2238]/10 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {`Welcome ${!isSignUp ? "back " : ""}to JumboJolt`}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp
              ? "Join India's largest community switching to quality Indian products"
              : "Continue discovering and supporting quality Indian products."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              {isSignUp ? "Sign Up" : "Log In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-lg"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <Chrome className="h-5 w-5 mr-3" />
              {"Continue with Google"}
            </Button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                    minLength={6}
                  />
                </div>

                {!isSignUp && (
                  <div className="text-sm text-[#0b2238] hover:text-gray-900 hover:underline pr-2 cursor-pointer text-right self-end">
                    <Button
                      variant="link"
                      className="px-0 font-normal text-sm"
                      onClick={() => setCurrentView("forgot-password")}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0b2238] to-green-600 hover:from-[#091b2c] hover:to-green-700"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : isSignUp
                    ? "Create Account"
                    : "Log In"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                >
                  {isSignUp
                    ? "Already have an account? Log In"
                    : "Need an account? Sign Up"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
