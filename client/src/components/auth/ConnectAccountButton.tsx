import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { UserPlus, Shield } from "lucide-react";
import { AccountMigrationDialog } from "./AccountMigrationDialog";

interface ConnectAccountButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function ConnectAccountButton({
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
}: ConnectAccountButtonProps) {
  const { user } = useAuth();

  // Only show for anonymous users
  if (!user || user.userType !== "ANONYMOUS") {
    return null;
  }

  return (
    <AccountMigrationDialog>
      <Button
  variant={variant}
  size={size}
  className={`flex items-center gap-2 ${className}`}
  style={{ backgroundColor: "#0b2238", color: "#fff" }}
>
  {showIcon && <UserPlus className="h-4 w-4" />}
  <Shield className="h-4 w-4" />
  Connect Account
</Button>

    </AccountMigrationDialog>
  );
}
