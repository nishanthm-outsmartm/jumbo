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
  ArrowUpDown,
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
import NewsDialog from "@/components/NewsDialog";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Skeleton } from "@/components/ui/skeleton";

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
  financialValue: number;
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
  financialValue: number;
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
interface News {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  source: string;
  suggestedFromBrandIds: string[];
  suggestedToBrandIds: string[];
  commentsEnabled: boolean;
  isPublished: boolean;
  createdBy: string;
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
  source: z.string().optional(),
  suggestedFromBrandIds: z.array(z.string()).optional(),
  suggestedToBrandIds: z.array(z.string()).optional(),
  commentsEnabled: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  createdBy: z.string(),
});
type Feedback = {
  id: string;
  userId: string;
  fromBrands: string;
  toBrands: string;
  url?: string;
  message: string;
  isPublic: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  moderatorId?: string;
  moderatorNotes?: string;
  approvedAt?: Date;
  createdAt: Date;
};
interface FeedbackResponse {
  feedbacks: Feedback[];
  pagination: {
    page: number;
    limit: number;
    total: number | string;
    totalPages: number;
  };
}

// Fetch feedbacks with filters, sorting, and search
const fetchFeedbacks = async (
  page: number,
  limit: number,
  status?: string,
  search?: string,
  sort: "asc" | "desc" = "desc"
): Promise<FeedbackResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
  });
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const response = await fetch(`/api/feedbacks?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch feedbacks");
  }
  return response.json();
};

export default function EnhancedModeratorPanel() {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [showNewsDialog, setShowNewsDialog] = useState(false);

  const [showUpdateNewsArticleDialog, setShowUpdateNewsArticleDialog] =
    useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:3006"; // Fallback for undefined host
    const wsUrl = `${protocol}//${host}/ws`;

    console.log("WebSocket URL:", wsUrl); // Debug log

    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        console.log("Attempting WebSocket connection to:", wsUrl); // Debug log
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // console.log("WebSocket connected for moderator panel");
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // console.log("Real-time update received:", data);

            // Invalidate relevant queries to refresh data
            if (data.type === "update") {
              queryClient.invalidateQueries();
            }
          } catch (error) {
            // console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onclose = (event) => {
          // console.log("WebSocket disconnected");
          setWsConnected(false);

          // Attempt to reconnect after 3 seconds if not a clean close
          if (!event.wasClean) {
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        ws.onerror = (error) => {
          // console.error("WebSocket error:", error);
          setWsConnected(false);
        };
      } catch (error) {
        // console.error("Failed to create WebSocket connection:", error);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 720) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // run once on mount
    handleResize();

    // listen for resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

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

  //feedbacks
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["feedbacks", page, limit, statusFilter, search, sort],
    queryFn: () => fetchFeedbacks(page, limit, statusFilter, search, sort),
    // keepPreviousData: true,
    enabled: activeTab === "feedback", // Only fetch when tab is active
  });

  const handleSortToggle = () => {
    setSort((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (error) {
    toast({
      title: "Error",
      description: (error as Error).message,
      variant: "destructive",
    });
  }
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
      source: "",
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
  const [showDeleteNewsDialog, setShowDeleteNewsDialog] = useState(false);
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
        // console.error("Error deleting mission:", error);
      });
    setShowDeleteMissionDialog(false);
    setSelectedMission(null);
  };
  const handleDeleteNews = () => {
    if (!selectedNews) return;

    apiRequest("DELETE", `/api/moderation/news/${selectedNews.id}`)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["/api/moderation/missions"],
        });
        sendRealtimeUpdate("news_deleted", {
          newsId: selectedNews.id,
        });
      })
      .catch((error) => {
        // console.error("Error deleting mission:", error);
      });
    setShowDeleteNewsDialog(false);
    setSelectedNews(null);
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
    { id: "feedback", label: "Suggested Feedbacks", icon: CheckCircle },
    // { id: "posts", label: "Posts", icon: FileText },
    // { id: "messages", label: "Messages", icon: MessageCircle },
    // { id: "analytics", label: "Analytics", icon: TrendingUp },
    // { id: "settings", label: "Settings", icon: Settings },
  ];
  const mobileSidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    // { id: "content", label: "Create Content", icon: PlusCircle },
    {
      id: "news",
      label: "News",
      icon: Newspaper,
      count: newsArticles.length,
    },
    { id: "missions", label: "Missions", icon: Target },
    { id: "submissions", label: "Submissions", icon: CheckCircle },
    { id: "feedback", label: "Feedbacks", icon: CheckCircle },
    // { id: "posts", label: "Posts", icon: FileText },
    // { id: "messages", label: "Messages", icon: MessageCircle },
    // { id: "analytics", label: "Analytics", icon: TrendingUp },
    // { id: "settings", label: "Settings", icon: Settings },
  ];
  const handleNewsUpdateChange = (data: News) => {
    setSelectedNews(data);
    setShowUpdateNewsArticleDialog(true);
  };

  const handleAfterNewsUpdate = (state: boolean) => {
    setSelectedNews(null);
    setShowUpdateNewsArticleDialog(state);
  };

  const metricsQuery = useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const response = await fetch("/api/metrics");
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      return response.json() as Promise<{
        active24h: number;
        active7d: number;
        active30d: number;
      }>;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: activeTab === "dashboard", // Fetch only when dashboard tab is active
  });

  const metrics = metricsQuery.data;
  return (
    <div className="min-h-screen bg-background mb-12 md:mb-0">
      {/* Header */}
      <header className="border-b bg-card w-screen">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:block"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold sm:text-sm">Moderator Panel</h1>
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
              {wsConnected ? (
                <span className="text-wrap">Live</span>
              ) : (
                "Offline"
              )}
            </div>

            {/* <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {user?.role}
            </Badge> */}
          </div>
        </div>
      </header>

      {/* {mobile Navigation} */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-evenly py-2">
          {mobileSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-2 transition-colors ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 border-r bg-card h-screen hidden md:block`}
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
              <h2 className="text-xl font-semibold sm:text-lg md:text-xl">
                Dashboard
              </h2>

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
                {/* Active Users Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Users</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 flex flex-col sm:flex-row sm:flex-wrap gap-4">
                      {metricsQuery.isLoading ? (
                        <div className="w-full text-center text-gray-500">
                          Loading metrics...
                        </div>
                      ) : metricsQuery.error ? (
                        <div className="w-full text-center text-red-500">
                          Error: {(metricsQuery.error as Error).message}
                        </div>
                      ) : (
                        <>
                          <Card className="min-w-[200px] flex-1">
                            <CardContent className="flex items-center p-6">
                              <Users className="h-8 w-8 text-blue-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Last 24 Hours
                                </p>
                                <p className="text-2xl font-bold">
                                  {metrics?.active24h || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="min-w-[200px] flex-1">
                            <CardContent className="flex items-center p-6">
                              <Users className="h-8 w-8 text-green-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Last 7 Days
                                </p>
                                <p className="text-2xl font-bold">
                                  {metrics?.active7d || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="min-w-[200px] flex-1">
                            <CardContent className="flex items-center p-6">
                              <Users className="h-8 w-8 text-purple-600" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Last 30 Days
                                </p>
                                <p className="text-2xl font-bold">
                                  {metrics?.active30d || 0}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-400 text-sm italic flex justify-center">
                        Chart coming soon...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold sm:text-lg md:text-xl">
                      Recent Activities
                    </CardTitle>
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

                <Card>
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
                </Card>
              </div> */}
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
                <h2 className="text-xl font-semibold sm:text-lg md:text-xl">
                  Missions
                </h2>
                <Button onClick={() => setShowMissionDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Mission
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {missions.map((mission: Mission) => (
                  <div key={mission.id} className="w-full">
                    <Card className="max-w-[500px] mx-auto">
                      <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                          <div className="flex-1 flex flex-col">
                            {/* Title + Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base sm:text-lg">
                                {mission.title}
                              </h3>
                              <Badge
                                variant={
                                  mission.isActive ? "default" : "secondary"
                                }
                                className="text-xs sm:text-sm"
                              >
                                {mission.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm mb-3 break-all line-clamp-3 sm:line-clamp-2">
                              {mission.description}
                            </p>

                            {/* Footer row pinned to bottom */}
                            <div className="mt-auto flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                                {mission.pointsReward} points
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                {mission.startDate
                                  ? format(
                                      new Date(mission.startDate),
                                      "MMM dd yyyy"
                                    )
                                  : "No start date"}
                                {" - "}
                                {mission.endDate
                                  ? format(
                                      new Date(mission.endDate),
                                      "MMM dd yyyy"
                                    )
                                  : "No end date"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                                {mission.category}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-2 sm:p-3"
                              onClick={() => handleSelectMission(mission)}
                            >
                              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="p-2 sm:p-3"
                              onClick={() => {
                                setShowDeleteMissionDialog(true);
                                setSelectedMission(mission);
                              }}
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-700" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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

                          {submission.financialValue && (
                            <div>
                              <Label className="text-sm font-medium">
                                Financial Impact:
                              </Label>
                              <p className="text-sm mt-1">
                                {submission.financialValue}
                              </p>
                            </div>
                          )}

                          {submission.evidenceUrl && (
                            <div>
                              <Label className="text-sm font-medium">
                                Evidence:
                              </Label>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <img
                                    src={`https://${submission.evidenceUrl}`}
                                    alt="Evidence"
                                    className="mt-1 w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                                  />
                                </DialogTrigger>
                                <DialogContent className="max-w-full sm:max-w-4xl p-4">
                                  <DialogHeader>
                                    <DialogTitle>Evidence Preview</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-center">
                                    <img
                                      src={`https://${submission.evidenceUrl}`}
                                      alt="Evidence Full"
                                      className="max-h-[80vh] w-auto object-contain rounded-lg border"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
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
          {/* Suggested Feedbacks */}
          {activeTab === "feedback" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Feedback Management</h2>
                {/* No Create Feedback button as it's read-only */}
              </div>

              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={statusFilter || "ALL"}
                  onValueChange={(value) => {
                    setStatusFilter(value || "ALL");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search by message..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64"
                />
                <Button
                  variant="outline"
                  onClick={handleSortToggle}
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Sort by Date ({sort === "asc" ? "Oldest" : "Newest"})
                  </span>
                  <span className="sm:hidden">Sort</span>
                </Button>
              </div>

              <div className="grid gap-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                  </div>
                ) : data?.feedbacks.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No feedback found.
                  </p>
                ) : (
                  data?.feedbacks.map((feedback) => (
                    <Card key={feedback.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base sm:text-lg">
                                {feedback.fromBrands} → {feedback.toBrands}
                              </h3>
                              <Badge
                                variant={
                                  feedback.status === "APPROVED"
                                    ? "default"
                                    : feedback.status === "REJECTED"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {feedback.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {feedback.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(feedback.createdAt),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                              {feedback.url && (
                                <span className="flex items-center gap-1">
                                  <Link2 className="h-3 w-3" />
                                  <a
                                    href={feedback.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline break-all"
                                  >
                                    Link
                                  </a>
                                </span>
                              )}
                            </div>
                          </div>
                          {/* No action buttons for read-only */}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1 || isLoading}
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(prev + 1, Number(data.pagination.totalPages))
                      )
                    }
                    disabled={
                      page === Number(data.pagination.totalPages) || isLoading
                    }
                    className="w-full sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              )}
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

          <NewsDialog
            setShowNewsDialog={setShowNewsDialog}
            showNewsDialog={showNewsDialog}
          />
          {activeTab === "news" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold sm:text-lg md:text-xl">
                  News
                </h3>
                <Button onClick={() => setShowNewsDialog(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create News
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 items-start">
                {newsArticles.map((article: any) => (
                  <div key={article.id} className="w-full">
                    <Card className="max-w-[500px] mx-auto">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground mb-3 text-xs sm:text-sm line-clamp-3 sm:line-clamp-2">
                              {article.description}
                            </p>

                            {(article.suggestedFromBrandIds?.length > 0 ||
                              article.suggestedToBrandIds?.length > 0) && (
                              <div className="space-y-2 mb-3">
                                {article.suggestedFromBrandIds?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-red-600 mb-1">
                                      Suggested switches from:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {article.suggestedFromBrandIds.map(
                                        (brandId: string) => {
                                          const brand = brands.find(
                                            (b) => b.id === brandId
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
                                            (b) => b.id === brandId
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

                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                {new Date(
                                  article.publishedAt
                                ).toLocaleDateString()}
                              </span>
                              {/* <Badge
                    variant={article.commentsEnabled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    Comments {article.commentsEnabled ? "On" : "Off"}
                  </Badge>
                  <Badge
                    variant={article.isPublished ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {article.isPublished ? "Published" : "Draft"}
                  </Badge> */}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 sm:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNewsUpdateChange(article)}
                              className="w-9 h-9 sm:w-10 sm:h-10"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowDeleteNewsDialog(true);
                                setSelectedNews(article);
                              }}
                              className="w-9 h-9 sm:w-10 sm:h-10"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-700" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNews && (
            <NewsDialog
              news={selectedNews}
              setShowNewsDialog={handleAfterNewsUpdate}
              showNewsDialog={showUpdateNewsArticleDialog}
            />
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

      {/* Delete News Confirmation Dialog */}
      <Dialog
        open={showDeleteNewsDialog}
        onOpenChange={setShowDeleteNewsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this news article? This action
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteNewsDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteNews()}>
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
