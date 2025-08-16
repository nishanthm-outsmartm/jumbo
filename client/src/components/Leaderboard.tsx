import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Leaderboard() {
  // const { data: leaderboardData, isLoading } = useQuery({
  //   queryKey: ["/api/leaderboard"],
  //   refetchInterval: 60000, // Refresh every minute
  // });

  // if (isLoading) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle className="flex items-center justify-between">
  //           <div className="flex items-center">
  //             <Trophy className="text-yellow-500 mr-2 h-5 w-5" />
  //             <span>Leaderboard</span>
  //           </div>
  //           <Skeleton className="h-8 w-24" />
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="space-y-3">
  //           {Array.from({ length: 5 }).map((_, i) => (
  //             <div key={i} className="flex items-center space-x-3 p-3">
  //               <Skeleton className="w-8 h-8 rounded-full" />
  //               <div className="flex-1">
  //                 <Skeleton className="h-4 w-20" />
  //                 <Skeleton className="h-3 w-32 mt-1" />
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // const leaderboard = leaderboardData?.leaderboard || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="text-yellow-500 mr-2 h-5 w-5" />
            <span>Leaderboard</span>
          </div>
          {/* <Select defaultValue="week">
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select> */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-500 text-sm text-center">
            You need to reach level 7 to unlock the full leaderboard.
          </p>
        </div>
        {/* <div className="space-y-3">
          {leaderboard.map((user: any, index: number) => {
            const position = index + 1;
            const isTop3 = position <= 3;
            const userInitials = user.handle.substring(0, 2).toUpperCase();

            return (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  position === 1
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                    : isTop3
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${
                    position === 1
                      ? "bg-yellow-500"
                      : position === 2
                      ? "bg-gray-400"
                      : position === 3
                      ? "bg-orange-400"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {position}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{user.handle}</p>
                    {position === 1 && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    {user.level >= 7 && (
                      <Badge variant="secondary" className="text-xs">
                        Elite
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">0 points • 0 switches</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <button className="text-orange-500 font-medium text-sm hover:text-blue-900 transition-colors">
            View Full Leaderboard <i className="fas fa-arrow-right ml-1" />
          </button>
        </div> */}
      </CardContent>
    </Card>
  );
}
