import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target, Star } from "lucide-react";
import { Link } from "wouter";
import FeedbackSwitchDialog from "./home/FeedbackSwitchDialog";
import { UserStatusCard } from "./auth/UserStatusCard";

export function UserStats({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { user } = useAuth();

  if (!isLoggedIn) {
    return (
      <Card className="relative">
        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-500 text-xl">👤</span>
            </div>
            <h3 className="font-semibold text-gray-600 mb-2">User Stats</h3>
            <p className="text-sm text-gray-500 mb-4">
              Login to view your progress
            </p>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
          </div>
        </div>
        <CardContent className="p-6 opacity-30">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-orange-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">XX</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Username</h3>
            <p className="text-sm text-gray-500 mb-4">Level X Switcher</p>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress to Level X</span>
                <span>XXX/XXX XP</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full w-1/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-2xl font-bold text-orange-500">XXX</p>
                <p className="text-xs text-gray-500">Total Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">XX</p>
                <p className="text-xs text-gray-500">Switches</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium py-2 rounded-lg">
                Log New Switch
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg">
                Suggest Idea
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const xpForNextLevel = user.level * 1000;
  const currentXP = user.points % 1000;
  const progressPercentage = (currentXP / xpForNextLevel) * 100;

  const userInitials = user.handle.substring(0, 2).toUpperCase();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  return (
    <>
      {/* Show UserStatusCard for anonymous users */}
      {user.userType === "ANONYMOUS" ? (
        <div className="mb-6">
          <UserStatusCard />
        </div>
     ) : (

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-orange-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {userInitials}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 text-lg">
              {user.handle}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Level {user.level} Switcher
            </p>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress to Level {user.level + 1}</span>
                <span>
                  {currentXP}/{xpForNextLevel} XP
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {currentXP}
                </p>
                <p className="text-xs text-gray-500">Total Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {user.switch_count}
                </p>
                <p className="text-xs text-gray-500">Switches</p>
              </div>
            </div>

            {/* Recent Achievement */}
            {/* <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              Latest Achievement
            </h4>
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="text-white h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900">
                  Switch Streak
                </p>
                <p className="text-xs text-gray-500">5 switches in a row</p>
              </div>
            </div>
          </div> */}

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
          </div>
        </CardContent>
      </Card>
)}
      {/* Feedback Dialog */}
      <FeedbackSwitchDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
