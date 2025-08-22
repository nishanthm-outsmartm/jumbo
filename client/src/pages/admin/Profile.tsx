import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProfile() {
  const { user, updateEmail, updatePhoneNumber, resetPassword } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [editingEmail, setEditingEmail] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [editingPhone, setEditingPhone] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleEmailChange = async () => {
    setEmailError("");
    setSuccessMsg("");
    try {
      await updateEmail(email);
      setEditingEmail(false);
      setSuccessMsg("Email updated successfully.");
    } catch (err: any) {
      setEmailError(err.message || "Failed to update email.");
    }
  };

  const handlePhoneChange = async () => {
    setPhoneError("");
    setSuccessMsg("");
    try {
      await updatePhoneNumber(phone);
      setEditingPhone(false);
      setSuccessMsg("Phone number updated successfully.");
    } catch (err: any) {
      setPhoneError(err.message || "Failed to update phone number.");
    }
  };

  const handleResetPassword = async () => {
    setSuccessMsg("");
    try {
      await resetPassword();
      setSuccessMsg("Password reset email sent.");
    } catch (err: any) {
      setSuccessMsg("Failed to send password reset email.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <div className="mt-1">{user?.handle || "-"}</div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (varchar)</label>
            {editingEmail ? (
              <div className="flex gap-2 mt-1">
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button onClick={handleEmailChange}>Save</Button>
                <Button variant="outline" onClick={() => { setEditingEmail(false); setEmail(user?.email || ""); }}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span>{user?.email}</span>
                <Button variant="outline" size="sm" onClick={() => setEditingEmail(true)}>
                  Change
                </Button>
              </div>
            )}
            {emailError && <div className="text-red-500 text-xs mt-1">{emailError}</div>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (varchar)</label>
            {editingPhone ? (
              <div className="flex gap-2 mt-1">
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full"
                  placeholder="+91 9876543210"
                />
                <Button onClick={handlePhoneChange}>{user?.phone ? "Change" : "Add"}</Button>
                <Button variant="outline" onClick={() => { setEditingPhone(false); setPhone(user?.phone || ""); }}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span>{user?.phone || <span className="text-gray-400">Not added</span>}</span>
                <Button variant="outline" size="sm" onClick={() => setEditingPhone(true)}>
                  {user?.phone ? "Change" : "Add"}
                </Button>
              </div>
            )}
            {phoneError && <div className="text-red-500 text-xs mt-1">{phoneError}</div>}
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Region (varchar)</label>
            <div className="mt-1">{user?.region || "-"}</div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role (user_role)</label>
            <div className="mt-1">{user?.role || "-"}</div>
          </div>

          {/* Reset Password */}
          <div>
            <Button variant="destructive" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>

          {/* Success Message */}
          {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
