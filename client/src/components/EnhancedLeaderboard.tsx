import { useState } from 'react';
import { Trophy, Medal, Award, Crown, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface EnhancedLeaderboardProps {
  className?: string;
}

export function EnhancedLeaderboard({ className }: EnhancedLeaderboardProps) {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const { data: weeklyLeaderboard = [], isLoading: weeklyLoading } = useQuery({
    queryKey: ['/api/leaderboard/weekly'],
    enabled: period === 'weekly'
  });

  const { data: monthlyLeaderboard = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ['/api/leaderboard/monthly'],
    enabled: period === 'monthly'
  });

  const { data: allTimeLeaderboard = [], isLoading: allTimeLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    enabled: period === 'alltime'
  });

  const getCurrentLeaderboard = () => {
    switch (period) {
      case 'weekly': return weeklyLeaderboard;
      case 'monthly': return monthlyLeaderboard;
      default: return allTimeLeaderboard;
    }
  };

  const getCurrentLoading = () => {
    switch (period) {
      case 'weekly': return weeklyLoading;
      case 'monthly': return monthlyLoading;
      default: return allTimeLoading;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{rank}</div>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  const leaderboard = getCurrentLeaderboard();
  const isLoading = getCurrentLoading();

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="alltime" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="w-12 h-6 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((user: any, index: number) => {
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <div
                      key={user.id || user.user?.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:shadow-md",
                        isTopThree 
                          ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-200 dark:border-yellow-800" 
                          : "bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-center min-w-[2rem]">
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-semibold truncate",
                            isTopThree ? "text-lg" : "text-base"
                          )}>
                            @{user.handle || user.user?.handle || 'Anonymous'}
                          </span>
                          {getRankBadge(rank)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>{user.points || 0} points</span>
                          </div>
                          {user.switches && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{user.switches} switches</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              Level {Math.floor((user.points || 0) / 100) + 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          "font-bold",
                          isTopThree ? "text-xl text-yellow-700 dark:text-yellow-400" : "text-lg"
                        )}>
                          {user.points || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  );
                })}
                
                {leaderboard.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No leaderboard data available for this period</p>
                    <p className="text-sm mt-2">Start making switches to see rankings!</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Progress towards next level */}
        {leaderboard.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border">
            <div className="text-sm font-medium mb-2">Your Progress</div>
            <div className="text-xs text-muted-foreground mb-2">
              Keep switching to climb the ranks and unlock new achievements!
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Log Your Next Switch
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}