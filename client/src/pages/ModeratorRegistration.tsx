import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Zap, Mail, Chrome, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ModeratorRegistration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const searchParams = new URLSearchParams(window.location.search);
  const [isModeratorInvitation, setIsModeratorInvitation] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  React.useEffect(() => {
    const token = searchParams.get("invite");
    console.log(token);

    // Only accept invites with the correct format
    if (token && token.startsWith("mod_")) {
      setIsModeratorInvitation(true);
      setInviteToken(token);
    }
  }, [searchParams]);

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
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const user = userCredential.user;

      // Try to login or redirect to registration
      try {
        await login(user.uid);
        navigate("/");
      } catch (error) {
        // User not registered, redirect to registration
        if (isModeratorInvitation) {
          navigate("/register?invite=mod_ueiqwenkskald");
        } else {
          navigate("/register");
        }
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

      // Try to login or redirect to registration
      try {
        await login(user.uid);
        navigate("/");
      } catch (error) {
        // User not registered, redirect to registration
        navigate("/register");
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled");
      } else {
        setError(error.message || "Google authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-green-600">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to JumboJolt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join India's largest community switching to quality Indian products
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Shield className="h-5 w-5 text-orange-600" />
              Sign In to Continue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="email" className="space-y-4">
              {/* <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="google">
                  <Chrome className="h-4 w-4 mr-2" />
                  Google
                </TabsTrigger>
              </TabsList> */}

              <TabsContent value="email" className="space-y-4">
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1"
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : isSignUp
                      ? "Create Account"
                      : "Sign In"}
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
                      ? "Already have an account? Sign In"
                      : "Need an account? Sign Up"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="google" className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-lg"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                >
                  <Chrome className="h-5 w-5 mr-3" />
                  {loading ? "Signing in..." : "Continue with Google"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Quick and secure sign-in with your Google account
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
