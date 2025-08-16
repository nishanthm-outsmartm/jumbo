import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import NotFound from "./not-found";

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
  userId: string;
  status: string;
  completedAt?: string;
  createdAt: string;
}

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
          // "x-user-id": user.id,
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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{mission.title}</CardTitle>
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
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{mission.description}</p>

        {/* Brand Information */}
        {(mission.fromBrands?.length > 0 || mission.toBrands?.length > 0) && (
          <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              {mission.fromBrands && mission.fromBrands.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-red-600 font-medium mb-1">
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

              {(mission.fromBrands?.length || 0) > 0 &&
                (mission.toBrands?.length || 0) > 0 && (
                  <ArrowRight className="text-gray-400 mx-2" size={16} />
                )}

              {mission.toBrands && mission.toBrands.length > 0 && (
                <div className="flex flex-col">
                  <span className="text-green-600 font-medium mb-1">
                    Switch To:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {mission.toBrands.map((brand: Brand) => (
                      <Badge
                        key={brand.id}
                        variant="default"
                        className="text-xs bg-green-600"
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

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Ends {formatDistanceToNow(new Date(mission.endDate))} from now
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" size="sm" disabled>
            <Target className="w-4 h-4 mr-2" />
            Join Mission
          </Button>

          {/* {!userMission ? (
            <Button
              onClick={() => onParticipate(mission.id)}
              className="flex-1"
              size="sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Join Mission
            </Button>
          ) : userMission.status === "STARTED" ? (
            <Dialog open={showSubmitForm} onOpenChange={setShowSubmitForm}>
              <DialogTrigger asChild>
                <Button className="flex-1" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Switch Log
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit Switch Log</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="targetBrandFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Switched From</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand you switched from" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mission.fromBrands?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetBrandTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Switched To</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Indian brand you switched to" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mission.toBrands?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name} 🇮🇳
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Switch</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Why did you make this switch?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How was your experience with the Indian brand?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financialImpact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financial Impact (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Saved ₹500 per month"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="evidenceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evidence Image (Required)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // For demo purposes, use a placeholder URL
                                    // In production, this would upload to object storage
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      field.onChange(
                                        e.target?.result as string,
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                              />
                              <p className="text-xs text-gray-500">
                                Upload a photo showing your purchase/switch
                                (receipt, product image, etc.)
                              </p>
                              {field.value && (
                                <div className="mt-2">
                                  <img
                                    src={field.value}
                                    alt="Evidence preview"
                                    className="w-20 h-20 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSubmitForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitSwitchLog.isPending}
                        className="flex-1"
                      >
                        {submitSwitchLog.isPending ? "Submitting..." : "Submit"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex-1 text-center text-sm text-gray-500">
              {userMission.status === "COMPLETED" ? (
                <span className="flex items-center justify-center gap-1 text-green-600">
                  <Award className="w-4 h-4" />
                  Mission Completed!
                </span>
              ) : (
                "Pending verification..."
              )}
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Missions() {
  const { user } = useAuth();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ["/api/missions"],
    queryFn: () => fetch("/api/missions").then((res) => res.json()),
  });

  const { data: userMissions = [] } = useQuery({
    queryKey: ["/api/user-missions"],
    queryFn: () => fetch("/api/user-missions").then((res) => res.json()),
  });

  const joinMission = useMutation({
    mutationFn: async (missionId: string) => {
      const response = await fetch(`/api/missions/${missionId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
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

  if (missionsLoading) {
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

      {missions.length === 0 ? (
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
      )}
    </div>
  );
}
