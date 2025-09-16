import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Chrome,
  Mail,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

interface AccountMigrationDialogProps {
  children: React.ReactNode;
}

export function AccountMigrationDialog({
  children,
}: AccountMigrationDialogProps) {
  const { user, migrateToRegistered, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<
    "method" | "email" | "email-new" | "email-existing" | "google" | "success"
  >("method");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create Firebase user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Migrate anonymous user to registered user
      await migrateToRegistered(userCredential.user.uid, formData.email);

      setStep("success");
      toast({
        title: "Account Connected!",
        description:
          "Your anonymous account has been successfully connected to your email.",
      });
    } catch (error: any) {
      console.error("Account migration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please use 'Connect Existing Account' instead or use a different email."
        );
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address. Please check your email.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError(
          error.message || "Failed to connect account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Sign in with existing email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Check if this Firebase user already has an account in our system
      try {
        // Try to login with the existing account first
        await migrateToRegistered(userCredential.user.uid, formData.email);
        setStep("success");
        toast({
          title: "Account Connected!",
          description:
            "Your anonymous account has been successfully connected to your existing account.",
        });
      } catch (migrationError: any) {
        // If migration fails, it might be because the account already exists
        // In this case, we should inform the user that they already have an account
        if (
          migrationError.message?.includes("already exists") ||
          migrationError.message?.includes("User already registered")
        ) {
          setError(
            "This email is already registered. Please sign in with your existing account or use a different email to create a new account."
          );
        } else {
          throw migrationError;
        }
      }
    } catch (error: any) {
      console.error("Account migration error:", error);
      if (error.code === "auth/user-not-found") {
        setError(
          "No account found with this email. Please create a new account or check your email address."
        );
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address. Please check your email.");
      } else {
        setError(
          error.message ||
            "Failed to connect account. Please check your credentials."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Migrate anonymous user to registered user
      try {
        await migrateToRegistered(firebaseUser.uid, firebaseUser.email);
        setStep("success");
        toast({
          title: "Account Connected!",
          description:
            "Your anonymous account has been successfully connected to your Google account.",
        });
      } catch (migrationError: any) {
        // If migration fails, it might be because the account already exists
        if (
          migrationError.message?.includes("already exists") ||
          migrationError.message?.includes("User already registered")
        ) {
          setError(
            "This Google account is already registered. Please sign in with your existing account or use a different Google account."
          );
        } else {
          throw migrationError;
        }
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setError(
          "An account already exists with this email using a different sign-in method."
        );
      } else {
        setError(error.message || "Google authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
    setError("");
    setStep("method");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  if (!user || user.userType !== "ANONYMOUS") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Connect Your Account
          </DialogTitle>
          <DialogDescription>
            Connect your anonymous account to an email or phone number to
            protect your progress and access it from any device.
          </DialogDescription>
        </DialogHeader>

        {step === "method" && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current Status:</strong> You're logged in as{" "}
                <strong>{user.handle}</strong> with {user.points} points.
                Connecting your account will preserve all your progress.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setStep("email")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Connect with Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setStep("google")}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Connect with Google
              </Button>
            </div>
          </div>
        )}

        {step === "email" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("method")}
              >
                ← Back
              </Button>
              <span>Connect with Email</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setStep("email-new")}
                >
                  Create New Account
                </Button>
                <p className="text-xs text-muted-foreground ml-2">
                  I don't have an account yet
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setStep("email-existing")}
                >
                  Connect Existing Account
                </Button>
                <p className="text-xs text-muted-foreground ml-2">
                  I already have an account with this email
                </p>
              </div>
            </div>

            {step === "email-new" && (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("email")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            {step === "email-existing" && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("email")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Connect Account
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {step === "google" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("method")}
              >
                ← Back
              </Button>
              <span>Connect with Google</span>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current Status:</strong> You're logged in as{" "}
                <strong>{user.handle}</strong> with {user.points} points.
                Connecting with Google will preserve all your progress.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Chrome className="mr-3 h-5 w-5" />
              )}
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Quick and secure sign-in with your Google account
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Account Connected Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your anonymous account has been connected. You will now be
                signed out to complete the process.
              </p>
            </div>
            <Button
              onClick={async () => {
                await logout();
                handleOpenChange(false);
              }}
              className="w-full"
            >
              Sign Out & Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
