import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User, Zap, Key, Download, Trash2, Target } from "lucide-react";
import { ConnectAccountButton } from "./ConnectAccountButton";
import { BackupCodesDialog } from "./BackupCodesDialog";
import { BackupCodeVerification } from "./BackupCodeVerification";
import { Link } from "wouter";
import FeedbackSwitchDialog from "../home/FeedbackSwitchDialog";

export function UserStatusCard() {
  const { user } = useAuth();
  const [showExportVerification, setShowExportVerification] = useState(false);
  const [showDeleteVerification, setShowDeleteVerification] = useState(false);
const [feedbackOpen, setFeedbackOpen] = useState(false);
  if (!user) return null;

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jumbojolt-data-${user.handle}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Logout and redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <>
        <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Account Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{user.handle}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  user.userType === "ANONYMOUS" ? "secondary" : "default"
                }
              >
                {user.userType === "ANONYMOUS" ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Anonymous
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Registered
                  </>
                )}
              </Badge>
              {user.role && <Badge variant="outline">{user.role}</Badge>}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              {user.points} points
            </div>
            <div className="text-sm text-muted-foreground">
              Level {user.level}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
                    <div className="space-y-3">
                      <Link href="/log-switch">
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all">
                          <Zap className="mr-2 h-4 w-4" />
                          Log New Switch
                        </Button>
                      </Link>
        
                      <Button
                        variant="outline"
                        className="w-full text-gray-700 hover:bg-gray-50 transition-all"
                        onClick={() => setFeedbackOpen(true)}
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Suggest Idea
                      </Button>
                    </div>

        {user.userType === "ANONYMOUS" && (
          <div className="pt-2 border-t">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your progress is saved locally. Connect your account to protect
                your data and access it from any device.
              </p>
              <div className="space-y-2">
                <ConnectAccountButton
                  variant="default"
                  size="sm"
                  className="w-full"
                />
                <BackupCodesDialog>
                  <Button variant="outline" size="sm" className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Generate Backup Codes
                  </Button>
                </BackupCodesDialog>
              </div>

              {/* Sensitive Actions */}
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Account Actions (Requires Backup Code)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportVerification(true)}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteVerification(true)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Dialogs */}
        <BackupCodeVerification
          open={showExportVerification}
          onOpenChange={setShowExportVerification}
          onVerified={handleExportData}
          action="Export Data"
          description="Export your account data including points, missions, and progress. This action requires backup code verification."
        />

        <BackupCodeVerification
          open={showDeleteVerification}
          onOpenChange={setShowDeleteVerification}
          onVerified={handleDeleteAccount}
          action="Delete Account"
          description="Permanently delete your anonymous account and all associated data. This action cannot be undone and requires backup code verification."
        />
      </CardContent>
    </Card>
    {/* Feedback Dialog */}
    <FeedbackSwitchDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
