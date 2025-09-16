import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Zap } from "lucide-react";
import { ConnectAccountButton } from "./ConnectAccountButton";

export function UserStatusCard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
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

        {user.userType === "ANONYMOUS" && (
          <div className="pt-2 border-t">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your progress is saved locally. Connect your account to protect
                your data and access it from any device.
              </p>
              <ConnectAccountButton
                variant="default"
                size="sm"
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
