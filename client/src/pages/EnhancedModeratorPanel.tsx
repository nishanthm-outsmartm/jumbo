import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ModeratorPostCreator from "@/components/ModeratorPostCreator";
import {
  Shield,
  Users,
  TrendingUp,
  MessageSquare,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BarChart3,
  UserCheck,
  AlertTriangle,
  FileText,
  Target,
  Award,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Image,
  Link2,
  Star,
  Bookmark,
  Menu,
  X,
  MessageCircle,
  FileImage,
  ChevronRight,
  Home,
  Flag,
  Zap,
  Upload,
  Wifi,
  WifiOff,
  Newspaper,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { BrandSelector } from "@/components/BrandSelector";
import { EnhancedMissionDialog } from "@/components/EnhancedMissionDialog";
import { MessagingSystem } from "@/components/MessagingSystem";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Brand {
  id: string;
  name: string;
  category: string;
  isIndian: boolean;
  description?: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  fromBrandIds: string[];
  toBrandIds: string[];
  pointsReward: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface MissionSubmission {
  id: string;
  userId: string;
  missionId: string;
  reason: string;
  experience: string;
  financialImpact: string;
  evidenceUrl: string;
  status: string;
  createdAt: string;
  userName: string;
  missionTitle: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  targetAlternatives: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}
const categoryEnum: Record<string, string> = {
  FOOD_BEVERAGES: "Food & Beverages",
  ELECTRONICS: "Electronics",
  FASHION: "Fashion & Clothing",
  BEAUTY: "Beauty & Personal Care",
  HOME_GARDEN: "Home & Garden",
  AUTOMOTIVE: "Automotive",
  SPORTS: "Sports & Fitness",
  BOOKS_MEDIA: "Books & Education",
  OTHER: "Other",
};
const newsArticleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrls: z.array(z.string().url()).optional(),
  suggestedFromBrandIds: z.array(z.string()).optional(),
  suggestedToBrandIds: z.array(z.string()).optional(),
  commentsEnabled: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  createdBy: z.string(),
});
export default function EnhancedModeratorPanel() {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected for moderator panel");
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Real-time update received:", data);

            // Invalidate relevant queries to refresh data
            if (data.type === "update") {
              queryClient.invalidateQueries();
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket disconnected");
          setWsConnected(false);

          // Attempt to reconnect after 3 seconds if not a clean close
          if (!event.wasClean) {
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setWsConnected(false);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  // Send real-time updates
  const sendRealtimeUpdate = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type,
          data,
          source: "moderator_panel",
        })
      );
    }
  }, []);

  // Post form state
  const [newPostData, setNewPostData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    targetAlternatives: "",
    isActive: true,
  });

  // Queries
  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ["/api/moderation/missions"],
  });

  const { data: moderatorPosts = [] } = useQuery<Post[]>({
    queryKey: ["/api/moderation/posts"],
  });

  const { data: missionSubmissions = [] } = useQuery<MissionSubmission[]>({
    queryKey: ["/api/moderation/mission-submissions"],
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/moderation/analytics"],
  });

  const { data: newsArticles = [] } = useQuery<any[]>({
    queryKey: ["/api/moderation/news"],
    enabled: !!user,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    enabled: !!user,
  });

  const [showNewsDialog, setShowNewsDialog] = useState(false);
  const [selectedSuggestedFromBrands, setSelectedSuggestedFromBrands] =
    useState<string[]>([]);
  const [selectedSuggestedToBrands, setSelectedSuggestedToBrands] = useState<
    string[]
  >([]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const newsForm = useForm({
    resolver: zodResolver(newsArticleSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrls: [],
      suggestedFromBrandIds: [],
      suggestedToBrandIds: [],
      commentsEnabled: true,
      isPublished: true,
      createdBy: user?.id || "",
    },
  });

  const [showEditMissionDialog, setShowEditMissionDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const handleSelectMission = (mission: Mission) => {
    const missionData = {
      ...mission,
      // Keep the dates as strings to match the Mission interface
      startDate: mission.startDate,
      endDate: mission.endDate,
    };

    setSelectedMission(missionData);
    setShowEditMissionDialog(true);
  };
  const [showDeleteMissionDialog, setShowDeleteMissionDialog] = useState(false);
  const handleDeleteMission = () => {
    if (!selectedMission) return;

    apiRequest("DELETE", `/api/moderation/missions/${selectedMission.id}`)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["/api/moderation/missions"],
        });
        sendRealtimeUpdate("mission_deleted", {
          missionId: selectedMission.id,
        });
      })
      .catch((error) => {
        console.error("Error deleting mission:", error);
      });
    setShowDeleteMissionDialog(false);
    setSelectedMission(null);
  };

  // Utility functions
  const addBrandToSelection = (
    brandId: string,
    type: "from" | "to" | "suggestedFrom" | "suggestedTo"
  ) => {
    switch (type) {
      case "from":
        if (!selectedFromBrands.includes(brandId)) {
          setSelectedFromBrands([...selectedFromBrands, brandId]);
        }
        break;
      case "to":
        if (!selectedToBrands.includes(brandId)) {
          setSelectedToBrands([...selectedToBrands, brandId]);
        }
        break;
      case "suggestedFrom":
        if (!selectedSuggestedFromBrands.includes(brandId)) {
          setSelectedSuggestedFromBrands([
            ...selectedSuggestedFromBrands,
            brandId,
          ]);
        }
        break;
      case "suggestedTo":
        if (!selectedSuggestedToBrands.includes(brandId)) {
          setSelectedSuggestedToBrands([...selectedSuggestedToBrands, brandId]);
        }
        break;
    }
  };

  const [selectedFromBrands, setSelectedFromBrands] = useState<string[]>([]);
  const [selectedToBrands, setSelectedToBrands] = useState<string[]>([]);

  const removeBrandFromSelection = (
    brandId: string,
    type: "from" | "to" | "suggestedFrom" | "suggestedTo"
  ) => {
    switch (type) {
      case "from":
        setSelectedFromBrands(
          selectedFromBrands.filter((id) => id !== brandId)
        );
        break;
      case "to":
        setSelectedToBrands(selectedToBrands.filter((id) => id !== brandId));
        break;
      case "suggestedFrom":
        setSelectedSuggestedFromBrands(
          selectedSuggestedFromBrands.filter((id) => id !== brandId)
        );
        break;
      case "suggestedTo":
        setSelectedSuggestedToBrands(
          selectedSuggestedToBrands.filter((id) => id !== brandId)
        );
        break;
    }
  };

  const createNewsArticleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/moderation/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrls: imageUrls.filter((url) => url.trim()),
          suggestedFromBrandIds: selectedSuggestedFromBrands,
          suggestedToBrandIds: selectedSuggestedToBrands,
        }),
      });
      if (!response.ok) throw new Error("Failed to create news article");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/news"] });
      toast({ title: "News article created successfully" });
      newsForm.reset();
      setShowNewsDialog(false);
      setImageUrls([""]);
      setSelectedSuggestedFromBrands([]);
      setSelectedSuggestedToBrands([]);
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: any) =>
      apiRequest("POST", "/api/moderation/posts", postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/posts"] });
      setNewPostData({
        title: "",
        content: "",
        imageUrl: "",
        linkUrl: "",
        targetAlternatives: "",
        isActive: true,
      });
      setShowPostDialog(false);
      sendRealtimeUpdate("post_created", { createdBy: user?.id });
    },
  });

  const handleCreatePost = () => {
    if (!newPostData.title || !newPostData.content) return;

    const postPayload = {
      ...newPostData,
      createdBy: user?.id,
    };

    createPostMutation.mutate(postPayload);
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    // { id: "content", label: "Create Content", icon: PlusCircle },
    {
      id: "news",
      label: "News Articles",
      icon: Newspaper,
      count: newsArticles.length,
    },
    { id: "missions", label: "Missions", icon: Target },
    { id: "submissions", label: "Mission Submissions", icon: CheckCircle },
    // { id: "posts", label: "Posts", icon: FileText },
    // { id: "messages", label: "Messages", icon: MessageCircle },
    // { id: "analytics", label: "Analytics", icon: TrendingUp },
    // { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Moderator Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* WebSocket Status */}
            <div
              className={`flex items-center gap-2 text-sm ${
                wsConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              {wsConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {wsConnected ? "Live Updates" : "Offline"}
            </div>

            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {user?.role}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 border-r bg-card h-[calc(100vh-73px)]`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${!sidebarOpen && "px-2"}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && <span className="ml-2">{item.label}</span>}
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Missions
                      </p>
                      <p className="text-2xl font-bold">
                        {missions.filter((m: Mission) => m.isActive).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Posts Created
                      </p>
                      <p className="text-2xl font-bold">
                        {moderatorPosts.length}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Messages
                      </p>
                      <p className="text-2xl font-bold">-</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center p-6">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Platform Growth
                      </p>
                      <p className="text-2xl font-bold">+12%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">New mission created</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          2 hours ago
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Member message received</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          4 hours ago
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Post published</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          1 day ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        className="w-full justify-start"
                        onClick={() => setShowMissionDialog(true)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Create New Mission
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setActiveTab("content")}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Community Content
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => setActiveTab("messages")}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Check Messages
                      </Button>
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </div>
          )}

          {/* Content Creation Tab */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Create Community Content
                  </h2>
                  <p className="text-muted-foreground">
                    Create engaging posts to encourage community participation
                    and brand switching
                  </p>
                </div>
              </div>

              <ModeratorPostCreator
                onPostCreated={() => {
                  // Refresh data after post creation
                  queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
                  sendRealtimeUpdate("content_created", {
                    createdBy: user?.id,
                  });
                }}
              />
            </div>
          )}

          {/* Missions Tab */}
          {activeTab === "missions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Missions Management</h2>
                <Button onClick={() => setShowMissionDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Mission
                </Button>
              </div>

              <div className="grid gap-4">
                {missions.map((mission: Mission) => (
                  <Card key={mission.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{mission.title}</h3>
                            <Badge
                              variant={
                                mission.isActive ? "default" : "secondary"
                              }
                            >
                              {mission.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {mission.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {mission.pointsReward} points
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {mission.startDate
                                ? format(new Date(mission.startDate), "MMM dd")
                                : "No start date"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {mission.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleSelectMission(mission);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowDeleteMissionDialog(true);
                              setSelectedMission(mission);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Mission Submissions Tab */}
          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Mission Submissions</h2>
                <Badge variant="outline">
                  {missionSubmissions.length} pending
                </Badge>
              </div>

              <div className="grid gap-4">
                {missionSubmissions.map((submission: MissionSubmission) => (
                  <Card key={submission.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {submission.missionTitle}
                              </h3>
                              <Badge variant="secondary">
                                {submission.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Submitted by: {submission.userName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(submission.createdAt),
                                "MMM dd, yyyy at h:mm a"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">
                              Reason for Switch:
                            </Label>
                            <p className="text-sm mt-1">{submission.reason}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              Experience:
                            </Label>
                            <p className="text-sm mt-1">
                              {submission.experience}
                            </p>
                          </div>

                          {submission.financialImpact && (
                            <div>
                              <Label className="text-sm font-medium">
                                Financial Impact:
                              </Label>
                              <p className="text-sm mt-1">
                                {submission.financialImpact}
                              </p>
                            </div>
                          )}

                          {submission.evidenceUrl && (
                            <div>
                              <Label className="text-sm font-medium">
                                Evidence:
                              </Label>
                              <img
                                src={submission.evidenceUrl}
                                alt="Evidence"
                                className="mt-1 w-20 h-20 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              // Verify submission as approved
                              apiRequest(
                                "POST",
                                `/api/switch-logs/${submission.id}/verify`,
                                {
                                  approved: true,
                                  feedback: "Mission submission approved",
                                }
                              ).then(() => {
                                queryClient.invalidateQueries({
                                  queryKey: [
                                    "/api/moderation/mission-submissions",
                                  ],
                                });
                              });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              // Verify submission as rejected
                              apiRequest(
                                "POST",
                                `/api/switch-logs/${submission.id}/verify`,
                                {
                                  approved: false,
                                  feedback: "Mission submission rejected",
                                }
                              ).then(() => {
                                queryClient.invalidateQueries({
                                  queryKey: [
                                    "/api/moderation/mission-submissions",
                                  ],
                                });
                              });
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {missionSubmissions.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No pending submissions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All mission submissions have been reviewed.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Posts Management</h2>
                <Button onClick={() => setShowPostDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>

              <div className="grid gap-4">
                {moderatorPosts.map((post: Post) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{post.title}</h3>
                            <Badge
                              variant={post.isActive ? "default" : "secondary"}
                            >
                              {post.isActive ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.createdAt), "MMM dd, yyyy")}
                            </span>
                            {post.imageUrl && (
                              <span className="flex items-center gap-1">
                                <Image className="h-3 w-3" />
                                Has Image
                              </span>
                            )}
                            {post.linkUrl && (
                              <span className="flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                Has Link
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "news" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">News Management</h3>
                <Dialog open={showNewsDialog} onOpenChange={setShowNewsDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create News Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create News Article</DialogTitle>
                    </DialogHeader>
                    <Form {...newsForm}>
                      <form
                        onSubmit={newsForm.handleSubmit((data) =>
                          createNewsArticleMutation.mutate(data)
                        )}
                        className="space-y-4"
                      >
                        <FormField
                          control={newsForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Article Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter news title"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={newsForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Article Content</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Write your news article content..."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* <div>
                          <Label>Image URLs</Label>
                          <div className="space-y-2 mt-2">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder="https://example.com/image.jpg"
                                  value={url}
                                  onChange={(e) =>
                                    updateImageUrl(index, e.target.value)
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => removeImageUrl(index)}
                                  disabled={imageUrls.length === 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addImageUrl}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                        </div> */}

                        <div>
                          <Label>Suggested Switch From Brands</Label>
                          <div className="mt-2 space-y-2">
                            <Select
                              onValueChange={(brandId) =>
                                addBrandToSelection(brandId, "suggestedFrom")
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select brands to suggest switching from" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands
                                  .filter(
                                    (brand: any) =>
                                      !selectedSuggestedFromBrands.includes(
                                        brand.id
                                      )
                                  )
                                  .map((brand: any) => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                      {brand.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {selectedSuggestedFromBrands.map((brandId) => {
                                const brand = brands.find(
                                  (b: any) => b.id === brandId
                                );
                                return (
                                  <Badge
                                    key={brandId}
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                  >
                                    {brand?.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() =>
                                        removeBrandFromSelection(
                                          brandId,
                                          "suggestedFrom"
                                        )
                                      }
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Suggested Switch To Brands</Label>
                          <div className="mt-2 space-y-2">
                            <Select
                              onValueChange={(brandId) =>
                                addBrandToSelection(brandId, "suggestedTo")
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select brands to suggest switching to" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands
                                  .filter(
                                    (brand: any) =>
                                      !selectedSuggestedToBrands.includes(
                                        brand.id
                                      )
                                  )
                                  .map((brand: any) => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                      {brand.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {selectedSuggestedToBrands.map((brandId) => {
                                const brand = brands.find(
                                  (b: any) => b.id === brandId
                                );
                                return (
                                  <Badge
                                    key={brandId}
                                    variant="default"
                                    className="flex items-center gap-1"
                                  >
                                    {brand?.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() =>
                                        removeBrandFromSelection(
                                          brandId,
                                          "suggestedTo"
                                        )
                                      }
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="comments-enabled"
                              checked={newsForm.watch("commentsEnabled")}
                              onCheckedChange={(checked) =>
                                newsForm.setValue("commentsEnabled", checked)
                              }
                            />
                            <Label htmlFor="comments-enabled">
                              Enable Comments
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-published"
                              checked={newsForm.watch("isPublished")}
                              onCheckedChange={(checked) =>
                                newsForm.setValue("isPublished", checked)
                              }
                            />
                            <Label htmlFor="is-published">
                              Publish Immediately
                            </Label>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={createNewsArticleMutation.isPending}
                          className="w-full"
                        >
                          Create News Article
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {newsArticles.map((article: any) => (
                  <Card key={article.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {article.description}
                          </p>

                          {(article.suggestedFromBrandIds?.length > 0 ||
                            article.suggestedToBrandIds?.length > 0) && (
                            <div className="space-y-2 mb-4">
                              {article.suggestedFromBrandIds?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-red-600 mb-1">
                                    Suggested switches from:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {article.suggestedFromBrandIds.map(
                                      (brandId: string) => {
                                        const brand = brands.find(
                                          (b: any) => b.id === brandId
                                        );
                                        return (
                                          <Badge
                                            key={brandId}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {brand?.name || brandId}
                                          </Badge>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}

                              {article.suggestedToBrandIds?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-green-600 mb-1">
                                    Suggested switches to:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {article.suggestedToBrandIds.map(
                                      (brandId: string) => {
                                        const brand = brands.find(
                                          (b: any) => b.id === brandId
                                        );
                                        return (
                                          <Badge
                                            key={brandId}
                                            variant="default"
                                            className="text-xs"
                                          >
                                            {brand?.name || brandId}
                                          </Badge>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {new Date(
                                article.publishedAt
                              ).toLocaleDateString()}
                            </span>
                            <Badge
                              variant={
                                article.commentsEnabled
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              Comments {article.commentsEnabled ? "On" : "Off"}
                            </Badge>
                            <Badge
                              variant={
                                article.isPublished ? "default" : "secondary"
                              }
                            >
                              {article.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Messages</h2>
              <MessagingSystem />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Member Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Mission Completion</span>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <Progress value={78} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Switch Logging</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <Progress value={65} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Mission Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Missions</span>
                        <span className="font-medium">{missions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Missions</span>
                        <span className="font-medium">
                          {missions.filter((m: Mission) => m.isActive).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Completion Rate</span>
                        <span className="font-medium text-green-600">89%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Communication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Messages Today</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="font-medium">2.3 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Member Satisfaction</span>
                        <span className="font-medium text-green-600">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Mission Confirmation Dialog */}
      <Dialog
        open={showDeleteMissionDialog}
        onOpenChange={setShowDeleteMissionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this mission? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteMissionDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteMission()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Mission Dialog */}
      <EnhancedMissionDialog
        open={showMissionDialog}
        onOpenChange={setShowMissionDialog}
        onMissionCreated={() =>
          sendRealtimeUpdate("mission_created", { createdBy: user?.id })
        }
      />

      {/* Enhanced Mission Dialog */}
      <EnhancedMissionDialog
        open={showEditMissionDialog}
        onOpenChange={setShowEditMissionDialog}
        mission={selectedMission}
        onMissionCreated={() =>
          sendRealtimeUpdate("mission_updated", { createdBy: user?.id })
        }
      />

      {/* Post Creation Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create New Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="postTitle">Title *</Label>
              <Input
                id="postTitle"
                value={newPostData.title}
                onChange={(e) =>
                  setNewPostData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label htmlFor="postContent">Content *</Label>
              <Textarea
                id="postContent"
                value={newPostData.content}
                onChange={(e) =>
                  setNewPostData((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Write your post content..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="targetAlternatives">Target Alternatives</Label>
              <Input
                id="targetAlternatives"
                value={newPostData.targetAlternatives}
                onChange={(e) =>
                  setNewPostData((prev) => ({
                    ...prev,
                    targetAlternatives: e.target.value,
                  }))
                }
                placeholder="e.g., Indian brands to recommend"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={newPostData.imageUrl}
                  onChange={(e) =>
                    setNewPostData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                <Input
                  id="linkUrl"
                  value={newPostData.linkUrl}
                  onChange={(e) =>
                    setNewPostData((prev) => ({
                      ...prev,
                      linkUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newPostData.isActive}
                onCheckedChange={(checked) =>
                  setNewPostData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">Publish immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={
                !newPostData.title ||
                !newPostData.content ||
                createPostMutation.isPending
              }
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
