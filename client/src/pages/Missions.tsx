import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
// Import shadcn Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Target,
  Coins,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Upload,
  Award,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NotFound from "./not-found";
import { Link } from "wouter";
import LogSwitchDialog from "@/components/LogSwitchDialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
// type userMissions ={
//     id: string;
//     missionId: string | null;
//     status: string | null;
//     completedAt: Date | null;
//     createdAt: Date | null;
// }[]

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

function MissionCard({
  mission,
  userMission,
  onParticipate,
}: {
  mission: Mission;
  userMission?: UserMission;
  onParticipate: (missionId: string) => void;
}) {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const { user } = useAuth();

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
    <Card className="max-h-[420px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2 min-h-[30px]">
              {mission.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
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
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Short Preview */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3  break-all overflow-hidden">
          {mission.description}
        </p>

        {/* Show only first brand inline */}
        {((mission.fromBrands && mission.fromBrands.length > 0) ||
          (mission.toBrands && mission.toBrands.length > 0)) && (
          <div className="flex items-center gap-2 mb-4">
            {mission.fromBrands && mission.fromBrands.length > 0 && (
              <>
                <span className="text-red-600 font-medium text-xs">From:</span>
                <Badge variant="destructive" className="text-xs">
                  {mission.fromBrands[0].name}
                </Badge>
                {mission.fromBrands.length > 1 && (
                  <span className="text-gray-400 text-xs">
                    +{mission.fromBrands.length - 1} more
                  </span>
                )}
              </>
            )}
            {mission.toBrands && mission.toBrands.length > 0 && (
              <>
                <span className="text-green-600 font-medium text-xs">To:</span>
                <Badge className="text-xs bg-green-600 text-white">
                  {mission.toBrands[0].name}{" "}
                  {mission.toBrands[0].isIndian ? "🇮🇳" : ""}
                </Badge>
                {mission.toBrands.length > 1 && (
                  <span className="text-gray-400 text-xs">
                    +{mission.toBrands.length - 1} more
                  </span>
                )}
              </>
            )}
          </div>
        )}

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
                {!user ? (
                  <Button
                    onClick={() => (window.location.href = "/login")}
                    className="flex-1"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Login to Join
                  </Button>
                ) : !userMission ? (
                  <Button
                    onClick={() => onParticipate(mission.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Join Mission
                  </Button>
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
        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          {!user ? (
            <Button
              onClick={() => (window.location.href = "/login")}
              className="flex-1"
              size="sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Login to Join
            </Button>
          ) : !userMission ? (
            <Button
              onClick={() => onParticipate(mission.id)}
              className="flex-1"
              size="sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Join Mission
            </Button>
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
      </CardContent>
    </Card>
  );
}

export default function Missions() {
  const { user } = useAuth();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: missions,
    isLoading: missionsLoading,
    hasMore,
    loadMore,
    error,
  } = usePaginatedData({
    fetchFunction: async (page: number, limit: number) => {
      const response = await fetch(`/api/missions?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch missions");
      }
      return response.json();
    },
    initialLimit: 12,
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
    staleTime: 1000 * 60 * 5, // 5 minutes, adjust as needed
    gcTime: 1000 * 60 * 10, // cache data for 10 minutes
    refetchOnWindowFocus: false, // don’t refetch every time you focus the tab
    refetchOnReconnect: false, // don’t refetch when network reconnects
    refetchInterval: false, // disable polling
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

  if (missionsLoading && missions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Active Missions
        </h1>
        <p className="text-gray-600">
          Join missions to earn points by switching to Indian brands. Complete
          switch logs and get verified by moderators.
        </p>
      </div>

      {error && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Missions
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      )}

      {!error && missions.length === 0 && !missionsLoading ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Missions
          </h3>
          <p className="text-gray-500">
            Check back later for new missions to participate in.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((mission: Mission) => {
              const userMission = userMissions.find(
                (um: UserMission) => um.missionId === mission.id
              );

              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  userMission={userMission}
                  onParticipate={handleParticipate}
                />
              );
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                disabled={missionsLoading}
                variant="outline"
                className="px-8"
              >
                {missionsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Missions"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
