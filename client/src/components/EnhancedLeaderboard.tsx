import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Trophy, Medal, Award, Users, UserCheck } from "lucide-react";

interface LeaderboardUser {
  id: string;
  handle: string;
  points: number;
  switchCount: number;
  level: number;
  userType: "ANONYMOUS" | "REGISTERED";
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
}
// ...imports remain unchanged

export function EnhancedLeaderboard({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [allUsers, setAllUsers] = useState<LeaderboardUser[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [userPosition, setUserPosition] = useState<{
    position: number;
    user: LeaderboardUser;
  } | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const [allResponse, registeredResponse, userPositionResponse] =
        await Promise.all([
          fetch("/api/leaderboard?limit=20&minPoints=100"),
          fetch("/api/leaderboard?limit=20&userType=registered&minPoints=100"),
          isLoggedIn
            ? fetch("/api/leaderboard/user-position")
            : Promise.resolve(null),
        ]);

      const allData: LeaderboardData = await allResponse.json();
      const registeredData: LeaderboardData = await registeredResponse.json();

      setAllUsers(allData.leaderboard || []);
      setRegisteredUsers(registeredData.leaderboard || []);

      if (userPositionResponse) {
        const userPositionData = await userPositionResponse.json();
        setUserPosition(userPositionData);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-[#0b2238]" />;
      case 1:
        return <Medal className="h-5 w-5 text-[#0b2238]/70" />;
      case 2:
        return <Award className="h-5 w-5 text-[#0b2238]/60" />;
      default:
        return (
          <span className="text-sm font-medium text-muted-foreground">
            #{index + 1}
          </span>
        );
    }
  };

  const getUserTypeIcon = (userType: string) => {
    return userType === "REGISTERED" ? (
      <UserCheck className="h-4 w-4 text-[#0b2238]" />
    ) : (
      <Users className="h-4 w-4 text-[#0b2238]/70" />
    );
  };

  const getUserTypeBadge = (userType: string) => {
    return userType === "REGISTERED" ? (
      <Badge variant="secondary" className="bg-[#0b2238]/10 text-[#0b2238]">
        Registered
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-[#0b2238]/20 text-[#0b2238]/70">
        Anonymous
      </Badge>
    );
  };

  const LeaderboardList = ({ users }: { users: LeaderboardUser[] }) => (
    <div className="space-y-3">
      {users.map((user, index) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getRankIcon(index)}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#0b2238] text-white">
                      {user.handle.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#0b2238]">{user.handle}</h3>
                    {getUserTypeIcon(user.userType)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getUserTypeBadge(user.userType)}
                    <span className="text-sm text-muted-foreground">
                      Level {user.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-2xl font-bold text-[#0b2238]">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.switchCount} switches
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {users.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-[#0b2238]">No users yet</h3>
          <p className="text-muted-foreground">
            Be the first to start earning points!
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#0b2238]">Leaderboard</h2>
        <p className="text-muted-foreground mt-2">
          {isLoggedIn
            ? "See who's making the biggest impact"
            : "Top performers (100+ points required)"}
        </p>
      </div>

      {!isLoggedIn && userPosition && (
        <Card className="border-[#0b2238]/20 bg-[#0b2238]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0b2238]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#0b2238] font-bold">
                    #{userPosition.position}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0b2238]">Your Position</h3>
                  <p className="text-sm text-[#0b2238]/80">
                    {userPosition.user.points} points
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#0b2238]">Anonymous</p>
                <p className="text-xs text-[#0b2238]/70">
                  Create account to compete publicly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#0b2238]" />
            {isLoggedIn ? "All Participants" : "Top Performers"}
          </TabsTrigger>
          <TabsTrigger value="registered" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#0b2238]" />
            Registered Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0b2238]">
                <Users className="h-5 w-5" />
                {isLoggedIn ? "All Participants" : "Top Performers"}
              </CardTitle>
              <CardDescription>
                {isLoggedIn
                  ? "Everyone participating in the platform, including anonymous users"
                  : "Users with 100+ points who are making the biggest impact"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardList users={allUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0b2238]">
                <UserCheck className="h-5 w-5" />
                Registered Users Only
              </CardTitle>
              <CardDescription>
                {isLoggedIn
                  ? "Registered users eligible for prizes and rewards"
                  : "Registered users with 100+ points eligible for prizes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardList users={registeredUsers} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
