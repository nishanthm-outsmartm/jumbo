import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Gift, Star, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  description: string;
  type: "FREEBEE" | "COUPON" | "PRIZE_ENTRY";
  pointsRequired: number;
  value?: string;
  imageUrl?: string;
  maxClaims?: number;
  currentClaims: number;
}

export function RewardsSection() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/rewards");
      const data = await response.json();
      setRewards(data.rewards || []);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!user) return;

    setClaiming(rewardId);
    try {
      const response = await fetch(`/api/rewards/${rewardId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        toast({
          title: "Reward Claimed!",
          description: "Your reward has been successfully claimed.",
        });
        fetchRewards(); // Refresh rewards
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim reward");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClaiming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "FREEBEE":
        return <Gift className="h-5 w-5" />;
      case "COUPON":
        return <Star className="h-5 w-5" />;
      case "PRIZE_ENTRY":
        return <Trophy className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case "FREEBEE":
        return "bg-green-100 text-green-800";
      case "COUPON":
        return "bg-blue-100 text-blue-800";
      case "PRIZE_ENTRY":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isAnonymous = user?.userType === "ANONYMOUS";
  const canClaim = user && user.points >= 0; // Anonymous users can see but not claim

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
        <h2 className="text-3xl font-bold">Rewards</h2>
        <p className="text-muted-foreground mt-2">
          Earn points and claim amazing rewards
        </p>
      </div>

      {isAnonymous && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>Anonymous handles aren't eligible for rewards.</strong> Sign
            up to unlock freebies, coupons, and prize entries!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id} className="relative">
            {isAnonymous && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sign up to unlock
                  </p>
                </div>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRewardIcon(reward.type)}
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                </div>
                <Badge className={getRewardTypeColor(reward.type)}>
                  {reward.type}
                </Badge>
              </div>
              <CardDescription>{reward.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Points Required:</span>
                <span className="font-medium">{reward.pointsRequired}</span>
              </div>

              {reward.value && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">{reward.value}</span>
                </div>
              )}

              {reward.maxClaims && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium">
                    {reward.maxClaims - reward.currentClaims} left
                  </span>
                </div>
              )}

              {!isAnonymous && canClaim && (
                <Button
                  className="w-full"
                  disabled={
                    claiming === reward.id ||
                    user.points < reward.pointsRequired
                  }
                  onClick={() => handleClaimReward(reward.id)}
                >
                  {claiming === reward.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {user.points < reward.pointsRequired
                    ? "Insufficient Points"
                    : "Claim Reward"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-8">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
          <p className="text-muted-foreground">
            Check back later for new rewards and prizes!
          </p>
        </div>
      )}
    </div>
  );
}
