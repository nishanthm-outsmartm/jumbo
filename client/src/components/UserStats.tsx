import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Target, Star } from "lucide-react";
import { Link } from "wouter";

export function UserStats() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const xpForNextLevel = user.level * 1000;
  const currentXP = user.points % 1000;
  const progressPercentage = (currentXP / xpForNextLevel) * 100;

  const userInitials = user.handle.substring(0, 2).toUpperCase();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-orange-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{userInitials}</span>
          </div>

          <h3 className="font-semibold text-gray-900 text-lg">{user.handle}</h3>
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
              <p className="text-2xl font-bold text-orange-500">0</p>
              <p className="text-xs text-gray-500">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">0</p>
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
            <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all">
              <Zap className="mr-2 h-4 w-4" />
              Log New Switch
            </Button>

            <Button
              variant="outline"
              className="w-full text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Target className="mr-2 h-4 w-4" />
              Suggest Idea
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
