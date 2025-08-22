import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, House, Newspaper, Target, Zap } from "lucide-react";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  // const [navItems, setNavItems] = React.useState<
  //   Array<{ path: string; label: string; icon: string }>
  // >([]);

  const navItems = [
    { path: "/", label: "Home", icon: <House /> },
    // { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: "/news", label: "News", icon: <Newspaper /> },
    { path: "/missions", label: "Missions", icon: <Target /> },
  ];

  // { path: '/log-switch', label: 'Log Switch', icon: 'exchange-alt' },
  // { path: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  // { path: '/community', label: 'Community', icon: 'users' },

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
                <Zap className="text-white h-6 w-6" />
              </div>
              <span className="ml-3 text-2xl font-bold text-blue-900">
                JumboJolt
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`font-medium transition-colors cursor-pointer ${
                    location === item.path
                      ? "text-blue-900"
                      : "text-gray-500 hover:text-blue-900"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <div className="bg-gradient-to-r from-green-500 to-orange-500 p-2 rounded-full">
                      <span className="text-white font-bold text-sm">
                        {user.handle.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.handle}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Profile menu item based on user role */}
                  {user.role === "ADMIN" && (
                    <Link href="/admin/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                  )}
                  {user.role === "MODERATOR" && (
                    <Link href="/moderator/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                  )}
                  {user.role === "STRATEGIST" && (
                    <Link href="/strategist/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                  )}
                  {user.role === "MEMBER" && (
                    <Link href="/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                  )}
                  {/* ...existing admin/moderator panel links... */}
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
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-evenly py-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex flex-col items-center py-2 transition-colors cursor-pointer ${
                  location === item.path ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
          {/* <Link href="/profile">
            <div className="flex flex-col items-center py-2 text-gray-400 cursor-pointer">
              <i className="fas fa-user text-xl mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </div>
          </Link> */}
        </div>
      </div>
    </nav>
  );
}
