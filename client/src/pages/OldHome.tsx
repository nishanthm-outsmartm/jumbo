import React, { useState, useEffect } from "react";
import { SocialFeed } from "@/components/SocialFeed";
import { Leaderboard } from "@/components/Leaderboard";
import { EnhancedLeaderboard } from "@/components/EnhancedLeaderboard";
import { UserStats } from "@/components/UserStats";
import { EnhancedAnonymousRegistration } from "@/components/auth/EnhancedAnonymousRegistration";
import { SecretKeyLogin } from "@/components/auth/SecretKeyLogin";
import { TrendingContent } from "@/components/TrendingContent";
import { RewardsSection } from "@/components/RewardsSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Flame,
  Gift,
  Newspaper,
  Plus,
  Target,
} from "lucide-react";
import { Link } from "wouter";
import { toast, useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LogSwitchDialog from "@/components/LogSwitchDialog";
import { formatDistanceToNow } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import NewsLogSwitchDialog from "@/components/NewsLogSwitchDialog";

interface Brand {
  id: string;
  name: string;
  country: string;
  isIndian: boolean;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  targetCategory: string;
  pointsReward: number;
  startDate: string;
  endDate: string;
  status: string;
  impact: string;
  fromBrands?: Brand[];
  toBrands?: Brand[];
}

interface UserMission {
  id: string;
  missionId: string;
  // userId: string;
  status: string;
  completedAt?: string;
  createdAt: string;
}
interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrls: string[] | null;
  source: string | null;
  suggestedFromBrandIds: string[] | null;
  suggestedToBrandIds: string[] | null;
  commentsEnabled: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  fromBrands?: Brand[];
  toBrands?: Brand[];
}
export default function Home() {
  const { user } = useAuth();
  const [showAnonymousRegistration, setShowAnonymousRegistration] =
    useState(false);

 
  const [showSecretLogin, setShowSecretLogin] = useState(false);

  const queryClient = useQueryClient();
  const {
    data: articles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/news", "limit=5"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=5");
      const data = await res.json();
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });
  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ["/api/missions", "limit=3"],
    queryFn: () => fetch("/api/missions?limit=3").then((res) => res.json()),
  });

  const { data: userMissions = [] } = useQuery({
    queryKey: ["/api/user-missions"],
    queryFn: () =>
      fetch("/api/user-missions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(user && { "x-user-id": user.id }),
        },
      }).then((res) => res.json()),
  });

  const joinMission = useMutation({
    mutationFn: async (missionId: string) => {
      const response = await fetch(`/api/missions/${missionId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && { "x-user-id": user.id }),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to join mission");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mission joined!",
        description: "You can now submit switch logs for this mission.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-missions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join mission",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleParticipate = (missionId: string) => {
    joinMission.mutate(missionId);
  };

  const trendingCategories = [
    {
      name: "Food & Beverages",
      switches: 142,
      image:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Electronics",
      switches: 89,
      image:
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Fashion",
      switches: 67,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Beauty",
      switches: 45,
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <div className=" lg:block lg:col-span-3">
            {user ? (
              <UserStats isLoggedIn={!!user} />
            ) : (
              <div className="space-y-6">
                <div className="text-center p-6 bg-white rounded-lg border">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-xl">👤</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Join the Movement
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create an account to start earning points and competing on
                    the leaderboard.
                  </p>
                  <div className="space-y-2">
                    <button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      onClick={() => (window.location.href = "/signup")}
                    >
                      Create Account
                    </button>
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      onClick={() => setShowAnonymousRegistration(true)}
                    >
                      Join Anonymously
                    </button>
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      onClick={() => setShowSecretLogin(true)}
                    >
                      Login with Secret
                    </button>
                    {/* <button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      onClick={() => setShowAnonymousRegistration(true)}
                    >
                      Join Anonymously
                    </button> */}
                  </div>
                </div>
              </div>
            )}
            {/* Missions carousel */}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-xl p-6 mb-6 text-white">
              {user ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {user.handle}!
                  </h2>
                  <p className="opacity-90">
                    You're making a difference. See what others are switching to
                    today.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome to JumboJolt!
                  </h2>
                  <p className="opacity-90">
                    Join India's movement to support quality Indian products.
                    See the latest missions and news below.
                  </p>
                </>
              )}
            </div>

            {/* Your next actions */}
            {user && (
              <section className="px-1 pt-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Your next actions
                </h3>
                <div className="grid gap-3">
                  {/* Daily 60-sec Switch */}
                  <CardAction
                    kicker=""
                    icon={<Target className="text-orange-600" />}
                    title="Support Mission"
                    desc="Be part of the movement — choose Indian first."
                    cta="Do it now"
                    badge="+50 pts"
                  />
                </div>
              </section>
            )}

            {/* Call to action for non-logged users */}
            {!user && (
              <section className="px-1 pt-4">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Get Started
                </h3>
                <div className="grid gap-3">
                  <div className="rounded-2xl border p-4">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Choose Your Path
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-base font-semibold">
                      <Target className="text-orange-600" /> Join the Movement
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      Create an account or try anonymously to start earning
                      points.
                    </p>
                    <div className="space-y-2">
                      <button
                        className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white active:scale-[.99]"
                        onClick={() => (window.location.href = "/signup")}
                      >
                        Create Account
                      </button>
                      <button
                        className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 active:scale-[.99]"
                        onClick={() => setShowAnonymousRegistration(true)}
                      >
                        Join Anonymously
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
            <section className="px-1 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {user ? "Missions for you" : "Latest Missions"}
                </h3>
                {user && (
                  <Link to="/missions">
                    <button className="text-sm font-medium text-orange-600">
                      See all
                    </button>
                  </Link>
                )}
              </div>
              <div className="grid gap-3">
                {missions.map((mission: Mission) => {
                  const userMission = user
                    ? userMissions.find(
                        (um: UserMission) => um.missionId === mission.id
                      )
                    : undefined;

                  return (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      userMission={userMission}
                      onParticipate={handleParticipate}
                      isLoggedIn={!!user}
                    />
                  );
                })}
              </div>
            </section>

            {/* Trending Categories
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Trending Categories
                  </h3>
                  <button className="text-orange-500 text-sm hover:text-blue-900 transition-colors">
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trendingCategories.map((category, index) => (
                    <div
                      key={index}
                      className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover"
                      />
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      {/* <p className="text-xs text-orange-500">
                        +{category.switches} switches
                      </p> */}
            {/* </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Trending Header */}
            {/* <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Flame className="text-orange-500 mr-2 h-6 w-6" />
                    Trending Switches
                  </h2>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Today
                    </Button>
                    <Button size="sm" variant="outline">
                      Week
                    </Button>
                    <Button size="sm" variant="outline">
                      Month
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-orange-500 text-white rounded-full text-sm font-medium">
                    #PhoneSwitch
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #FoodChoice
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #ClothingBrand
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #TechGadgets
                  </span>
                </div>
              </CardContent>
            </Card> */}

            {/* Social Feed */}
            {/* <section className="px-4 pt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Posts</h3>
              <div className="grid gap-3">
                  <SocialFeed />
              </div>
            </section> */}

            {/* Load More */}
            {/* <div className="text-center mt-8">
              <Button variant="outline" className="hover:bg-gray-50">
                <i className="fas fa-refresh mr-2" />
                Load More Posts
              </Button>
            </div> */}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 mb-16">
            {/* News to act on */}
            <section className="px-1">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Newspaper className="text-slate-700" />
                  {user ? "Latest News to Act On" : "Latest News"}
                </h3>
                {user && (
                  <Link to="/news">
                    <button className="text-sm font-medium text-orange-600">
                      More
                    </button>
                  </Link>
                )}
              </div>
              <div className="grid gap-3">
                {articles.map((article: NewsArticle) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            </section>

            {/* <div className="mt-6">
              <EnhancedLeaderboard isLoggedIn={!!user} />
            </div> */}

            {/* Rewards Section */}
            {/* <div className="mt-6">
              <RewardsSection />
            </div> */}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {/* <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Link href="/log-switch">
        <Button
          
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all p-4"
        >
          <Plus className="h-6 w-6" />
        </Button>
        </Link>
      </div> */}

      {/* Anonymous Registration Modal */}
      {showAnonymousRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <EnhancedAnonymousRegistration
              onSuccess={(user) => {
                console.log("OldHome.tsx: onSuccess called with user:", user);
                console.log(
                  "OldHome.tsx: User has confirmed secret key - closing modal and reloading page"
                );
                setShowAnonymousRegistration(false);
                window.location.reload();
              }}
              onCancel={() => {
                console.log("OldHome.tsx: onCancel called");
                setShowAnonymousRegistration(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Secret Key Login Modal */}
      {showSecretLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <SecretKeyLogin
              onSuccess={() => {
                setShowSecretLogin(false);
                window.location.reload();
              }}
              onCancel={() => setShowSecretLogin(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CardAction({
  kicker,
  icon,
  title,
  desc,
  cta,
  badge,
}: {
  kicker: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {kicker}
      </div>
      <div className="mb-2 flex items-center gap-2 text-base font-semibold">
        {icon} {title}
      </div>
      <p className="text-sm text-slate-600">{desc}</p>
      <div className="mt-3 flex items-center justify-between">
        <Link to="/missions">
          <button className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white active:scale-[.99]">
            {cta}
          </button>
        </Link>
        {badge ? (
          <span className="rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CardProgress({
  title,
  desc,
  progress,
  cta,
}: {
  title: string;
  desc: string;
  progress: number;
  cta: string;
}) {
  const pct = Math.round(progress * 100);
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-1 text-base font-semibold">{title}</div>
      <p className="text-sm text-slate-600">{desc}</p>
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-600">{pct}%</span>
          <button className="rounded-full bg-slate-900 px-4 py-1.5 text-xs text-white active:scale-[.99]">
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsCard({
  article,
  isLoggedIn,
}: {
  article: NewsArticle;
  isLoggedIn: boolean;
}) {
  return (
    <div className="rounded-2xl border p-4">
      {/* <div className="text-xs text-slate-500">{article}</div> */}
      <div className="mt-1 text-base font-semibold">{article.title}</div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <button className="rounded-full border px-3 py-1.5">Read</button>
        {isLoggedIn ? (
          <NewsLogSwitchDialog newsId={article.id} />
        ) : (
          <button
            className="rounded-full px-4 py-1.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium transition-all"
            onClick={() => {
              // Show login prompt
              window.location.href = "/login";
            }}
          >
            Login to Act
          </button>
        )}
      </div>
    </div>
  );
}

function MissionCard({
  mission,
  userMission,
  onParticipate,
  isLoggedIn,
}: {
  mission: Mission;
  userMission?: UserMission;
  onParticipate: (missionId: string) => void;
  isLoggedIn: boolean;
}) {
  const switchLogSchema = z.object({
    targetBrandFrom: z.string().min(1, "Please select a brand to switch from"),
    targetBrandTo: z.string().min(1, "Please select a brand to switch to"),
    reason: z
      .string()
      .min(10, "Please provide a reason (at least 10 characters)"),
    experience: z.string().min(5, "Please describe your experience"),
    financialImpact: z.string().optional(),
    evidenceUrl: z.string().min(1, "Please upload evidence image"),
  });

  type SwitchLogFormData = z.infer<typeof switchLogSchema>;

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<SwitchLogFormData>({
    resolver: zodResolver(switchLogSchema),
    defaultValues: {
      targetBrandFrom: "",
      targetBrandTo: "",
      reason: "",
      experience: "",
      financialImpact: "",
      evidenceUrl: "",
    },
  });

  const submitSwitchLog = useMutation({
    mutationFn: async (data: SwitchLogFormData) => {
      const response = await fetch(`/api/missions/${mission.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && { "x-user-id": user.id }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to submit switch log");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Switch log submitted!",
        description: "Your submission is pending moderator verification.",
      });
      setShowSubmitForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-missions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: SwitchLogFormData) => {
    submitSwitchLog.mutate(data);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "STARTED":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "STARTED":
        return <Clock className="w-4 h-4" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };
  return (
    <div className="min-w-[240px] rounded-2xl border p-4">
      <div className="text-xs text-slate-500">{mission.targetCategory}</div>
      <div className="mt-1 text-base font-semibold">{mission.title}</div>
      <div>
        {/* Drawer for full details */}
        <Drawer>
          <DrawerTrigger asChild>
            <div className="flex justify-end">
              <Button
                variant="link"
                className="p-0 h-auto text-orange-600 text-xs underline"
              >
                View more details
              </Button>
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[75vh] max-h-[80vh] ">
            <div className="px-4 sm:px-8 md:px-12 lg:px-20 py-6 text-left overflow-y-auto">
              <DrawerHeader className="px-0">
                <DrawerTitle className="text-xl mb-2 text-left">
                  {mission.title}
                </DrawerTitle>
                <DrawerDescription className="text-gray-700 text-left  break-words overflow-hidden">
                  {mission.description}
                </DrawerDescription>
              </DrawerHeader>

              {/* Badges & Info */}
              <div className="flex flex-wrap items-center gap-2 my-4">
                <Badge variant="outline" className="text-xs">
                  {mission.targetCategory.replace("_", " ")}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  <Coins className="w-3 h-3" />
                  {mission.pointsReward} points
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    mission.impact === "HIGH"
                      ? "border-red-500 text-red-700"
                      : mission.impact === "MEDIUM"
                      ? "border-yellow-500 text-yellow-700"
                      : "border-green-500 text-green-700"
                  }`}
                >
                  {mission.impact} Impact
                </Badge>
                {userMission && (
                  <Badge
                    className={`text-xs flex items-center gap-1 ${getStatusColor(
                      userMission.status
                    )}`}
                  >
                    {getStatusIcon(userMission.status)}
                    {userMission.status}
                  </Badge>
                )}
              </div>

              {/* Brands full list */}
              {((mission.fromBrands && mission.fromBrands?.length > 0) ||
                (mission.toBrands && mission.toBrands?.length > 0)) && (
                <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-3 mb-6">
                  <div className="flex flex-col gap-4 text-sm">
                    {mission.fromBrands && mission.fromBrands.length > 0 && (
                      <div>
                        <span className="text-red-600 font-medium mb-1 block">
                          Switch From:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {mission.fromBrands.map((brand: Brand) => (
                            <Badge
                              key={brand.id}
                              variant="destructive"
                              className="text-xs"
                            >
                              {brand.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {mission.toBrands && mission.toBrands?.length > 0 && (
                      <div>
                        <span className="text-green-600 font-medium mb-1 block">
                          Switch To:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {mission.toBrands.map((brand: Brand) => (
                            <Badge
                              key={brand.id}
                              className="text-xs bg-green-600 text-white"
                            >
                              {brand.name} {brand.isIndian ? "🇮🇳" : ""}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-6">
                <Calendar className="w-3 h-3" />
                {mission.endDate
                  ? `Ends ${formatDistanceToNow(
                      new Date(mission.endDate)
                    )} from now`
                  : "Always"}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isLoggedIn ? (
                  <button
                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-medium transition-all px-4 py-2 text-sm text-white active:scale-[.99]"
                    onClick={() => {
                      // Show login prompt
                      window.location.href = "/login";
                    }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Login to Join
                  </button>
                ) : !userMission ? (
                  <button
                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-medium transition-all px-4 py-2 text-sm text-white active:scale-[.99]"
                    onClick={() => onParticipate(mission.id)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Join Mission
                  </button>
                ) : userMission.status === "STARTED" ? (
                  <LogSwitchDialog missionId={mission.id} />
                ) : (
                  <Button className="bg-gradient-to-r w-full from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                    {userMission.status === "COMPLETED"
                      ? "Mission Completed!"
                      : "Pending verification..."}
                  </Button>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {!isLoggedIn ? (
          <button
            className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-medium transition-all px-4 py-2 text-sm text-white active:scale-[.99]"
            onClick={() => {
              // Show login prompt
              window.location.href = "/login";
            }}
          >
            Login to Join
          </button>
        ) : !userMission ? (
          <button
            className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-medium transition-all px-4 py-2 text-sm text-white active:scale-[.99]"
            onClick={() => onParticipate(mission.id)}
          >
            Join Mission
          </button>
        ) : userMission.status === "STARTED" ? (
          <div>
            <LogSwitchDialog missionId={mission.id} />
          </div>
        ) : (
          <button className="rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-medium transition-all px-4 py-2 text-sm text-white active:scale-[.99]">
            {userMission.status === "COMPLETED"
              ? "Mission Completed!"
              : "Pending verification..."}
          </button>
        )}

        <span className="rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
          +{mission.pointsReward} pts
        </span>
      </div>
    </div>
  );
}
