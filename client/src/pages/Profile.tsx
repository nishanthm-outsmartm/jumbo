import React, { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ForgotPasswordForm from "@/components/auth/ForgetPasswordForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type ProfileView = "profile" | "forgot-password" | "reset-password";

export default function Profile() {
  const [currentView, setCurrentView] = useState<ProfileView>("profile");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { user: loggedInUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(undefined); // undefined = loading
  const [error, setError] = useState<string | null>(null);

  // ✅ Get username from URL: /profile/:username
  const [match, params] = useRoute("/profile/:username");
  const username = params?.username;

  // ✅ Fetch profile data (case-insensitive handled in backend)
  useEffect(() => {
    if (!username) return;

    setProfileUser(undefined);
    setError(null);

    fetch(`/api/users/${username}`) // ✅ removed .toLowerCase()
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => setProfileUser(data))
      .catch((err: any) => setError(err.message || "Failed to load profile"));
  }, [username]);

  // ---------- Forgot/Reset Password Flow ----------
  const handleForgotPasswordClick = () => {
    setCurrentView("forgot-password");
  };

  const handleForgotPasswordSuccess = (token?: string) => {
    if (token) {
      setResetToken(token);
      setCurrentView("reset-password");
    } else {
      setCurrentView("profile");
    }
  };

  const handleResetPasswordSuccess = () => {
    setResetToken(null);
    setCurrentView("profile");
  };

  // ---------- Loading ----------
  if (profileUser === undefined && !error) {
    return (
      <div className="text-center mt-20 text-gray-600">Loading profile...</div>
    );
  }

  // ---------- Error / 404 ----------
  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
  }

  // ---------- Forgot Password View ----------
  if (currentView === "forgot-password") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm
          onBackToLogin={() => setCurrentView("profile")}
          onSuccess={handleForgotPasswordSuccess}
        />
      </div>
    );
  }

  // ---------- Reset Password View ----------
  if (currentView === "reset-password" && resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm
          token={resetToken}
          onSuccess={handleResetPasswordSuccess}
          onBackToLogin={() => setCurrentView("profile")}
        />
      </div>
    );
  }

  // ---------- Profile View ----------
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            {profileUser.handle}'s Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ✅ Username Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 font-semibold text-gray-900 text-base">
              {profileUser.handle}
            </div>
          </div>

          {/* ✅ Forgot Password Button (only for logged-in user's own profile) */}
          {loggedInUser?.handle === profileUser.handle && (
            <div>
              <Button
                variant="link"
                className="px-0 font-normal text-sm"
                onClick={handleForgotPasswordClick}
              >
                Forgot your password?
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
