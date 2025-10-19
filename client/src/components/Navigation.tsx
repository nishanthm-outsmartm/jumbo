import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, LogOut, ChevronDown } from "lucide-react";
import FeedbackSwitchDialog from "./home/FeedbackSwitchDialog";
import { QuickAnonymousJoin } from "@/components/auth/QuickAnonymousJoin";
import { ConnectAccountButton } from "./auth/ConnectAccountButton";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const logoHeight = window.innerWidth < 480 ? 80 : 90;
  const logoFontSize = window.innerWidth < 480 ? 20 : 32;
  const headerHeight = window.innerWidth < 480 ? 60 : 90;
  const headerPadding = "8px 20px";

  return (
    <>
      <nav
        className="shadow-sm border-b border-gray-800 sticky top-0 z-50"
        style={{ backgroundColor: "#0b2238" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex justify-between items-center"
            style={{ height: headerHeight, padding: headerPadding }}
          >
            {/* 🌟 Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <img
              src="src\\images\\logo.png"
              alt="JumboJolt"
              style={{
                height: logoHeight,
                width: "auto",
                borderRadius: 20,
                objectFit: "contain",
                marginRight: -20,
                zIndex: 1,
              }}
            />
                <span
                  style={{
                    color: "#00cfff",
                    fontWeight: 800,
                    fontSize: logoFontSize,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  JumboJolt
                </span>
              </div>
            </Link>

            {/* 👤 User / Logged out Section */}
            {!user ? (
              // Logged out: simple header like Home.tsx
              <div className="flex items-center space-x-4">
                <QuickAnonymousJoin
                  onSuccess={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                />
              </div>
            ) : (
              // Logged in: user dropdown menu
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-[#0f2d4d]"
                    >
                      <div className="bg-[#00cfff] p-2 rounded-full">
                        <span className="text-white font-bold text-sm">
                          {user.handle.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-200">
                        {user.handle}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-300" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    {user.role === "ADMIN" && (
                      <Link href="/admin">
                        <DropdownMenuItem>Admin Panel</DropdownMenuItem>
                      </Link>
                    )}
                    {user.role === "MODERATOR" && (
                      <Link href="/moderator">
                        <DropdownMenuItem>Moderator Panel</DropdownMenuItem>
                      </Link>
                    )}
                    <Link href="/privacy">
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy & Security
                      </DropdownMenuItem>
                    </Link>

                    {user.userType === "ANONYMOUS" && (
                      <div className="px-2 py-1" style={{ marginLeft: -10 }}>
                        <ConnectAccountButton
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        />
                      </div>
                    )}

                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 💬 Feedback Dialog */}
      <FeedbackSwitchDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
