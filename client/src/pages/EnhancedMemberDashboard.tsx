import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import InteractivePostCard from "@/components/InteractivePostCard";
import { 
  Search, Filter, TrendingUp, Award, Users, MessageSquare, 
  CheckCircle, XCircle, Clock, Plus, Star, Calendar,
  Zap, Target, Trophy, Heart, Eye, EyeOff, ChevronRight,
  Tag, FolderOpen, Globe, Lock, MapPin, Sparkles
} from "lucide-react";

interface SwitchLog {
  id: string;
  userId: string;
  fromBrandId: string;
  toBrandId: string;
  category: string;
  reason: string;
  evidenceUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderatorNotes?: string;
  createdAt: string;
  approvedAt?: string;
  categoryId?: string;
  points?: number;
  isPublic?: boolean;
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  memberCount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  targetCategory: string;
  pointsReward: number;
  status: 'ACTIVE' | 'DRAFT' | 'COMPLETED' | 'EXPIRED';
  endDate?: string;
  isActive: boolean;
  categoryId?: string;
  communityId?: string;
  impact?: string;
  financialValue?: number;
  imageUrls?: string[];
}

export default function EnhancedMemberDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Data fetching queries
  const { data: switchLogs = [], isLoading: switchLogsLoading } = useQuery<SwitchLog[]>({
    queryKey: ['/api/switch-logs', user?.id],
    enabled: !!user?.id
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery<Tag[]>({
    queryKey: ['/api/tags']
  });

  const { data: communities = [], isLoading: communitiesLoading } = useQuery<Community[]>({
    queryKey: ['/api/communities']
  });

  const { data: missions = [], isLoading: missionsLoading } = useQuery<Mission[]>({
    queryKey: ['/api/missions'],
    select: (data: Mission[]) => data?.filter((mission: Mission) => mission.isActive) || []
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/users', user?.id, 'stats'],
    enabled: !!user?.id
  });

  const { data: feedPosts } = useQuery<any>({
    queryKey: ['/api/posts']
  });

  // Filter switch logs based on search and filters
  const filteredSwitchLogs = switchLogs.filter((log: SwitchLog) => {
    const matchesSearch = !searchTerm || 
      (log.fromBrandId && log.fromBrandId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.toBrandId && log.toBrandId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || log.categoryId === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate statistics
  const approvedSwitches = switchLogs.filter((log: SwitchLog) => log.status === 'APPROVED');
  const pendingSwitches = switchLogs.filter((log: SwitchLog) => log.status === 'PENDING');
  const totalPoints = approvedSwitches.reduce((sum: number, log: SwitchLog) => sum + (log.points || 0), 0);
  const totalImpact = approvedSwitches.length * 1000; // Simple calculation for demonstration

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.color || '#3B82F6';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2238] via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.handle}! 🇮🇳
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Your journey towards supporting Indian brands
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-[#0b2238] border-[#0b2238]/30">
  <Sparkles className="h-4 w-4 mr-1 text-[#0b2238]" />
  {user?.points || 0} Points
</Badge>

              <Badge variant="outline" className="text-green-600 border-green-300">
                <Trophy className="h-4 w-4 mr-1" />
                Level {Math.floor((user?.points || 0) / 100) + 1}
              </Badge>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Switches</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{switchLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                {approvedSwitches.length} approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From {approvedSwitches.length} switches
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSwitches.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalImpact.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Economic contribution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="switch-logs">Switch Logs</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Switch Logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Switch Logs
                  </CardTitle>
                  <CardDescription>Your latest brand switching activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {switchLogs.slice(0, 5).map((log: SwitchLog) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(log.status)}
                              >
                                {getStatusIcon(log.status)}
                                <span className="ml-1">{log.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">
                              {log.fromBrandId} → {log.toBrandId}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {log.reason}
                            </p>
                            {log.points && (
                              <p className="text-xs text-green-600 font-medium">
                                Points: {log.points}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Available Missions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Available Missions
                  </CardTitle>
                  <CardDescription>Complete missions to earn extra points</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {missions.slice(0, 4).map((mission: Mission) => (
                        <div key={mission.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{mission.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              +{mission.pointsReward} pts
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {mission.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: `${getCategoryColor(mission.categoryId || '')}15`,
                                borderColor: getCategoryColor(mission.categoryId || ''),
                                color: getCategoryColor(mission.categoryId || '')
                              }}
                            >
                              {mission.targetCategory}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {mission.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Community Feed</h2>
                  <p className="text-muted-foreground">
                    Latest updates from moderators and community challenges
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {feedPosts?.posts?.length > 0 ? (
                  feedPosts.posts.map((post: any) => (
                    <InteractivePostCard
                      key={post.id}
                      post={post}
                      onAction={(actionType, postId) => {
                        switch (actionType) {
                          case 'switch_log_created':
                            queryClient.invalidateQueries({ queryKey: ['/api/switch-logs'] });
                            toast({
                              title: "Switch Log Created!",
                              description: "Your brand switch has been recorded. Points will be awarded after review.",
                            });
                            break;
                          case 'mission_started':
                            // Navigate to mission or show mission details
                            toast({
                              title: "Mission Started!",
                              description: "You've started a new mission. Complete it to earn points.",
                            });
                            break;
                          case 'poll_voted':
                            // Handle poll voting
                            toast({
                              title: "Vote Recorded",
                              description: "Thank you for participating in the poll!",
                            });
                            break;
                        }
                      }}
                    />
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                      <p className="text-muted-foreground">
                        Check back later for updates from moderators and community challenges.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Switch Logs Tab */}
          <TabsContent value="switch-logs">
            <Card>
              <CardHeader>
                <CardTitle>Switch Log Management</CardTitle>
                <CardDescription>
                  Track and manage all your brand switching activities
                </CardDescription>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search switches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredSwitchLogs.map((log: SwitchLog) => (
                      <div key={log.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getStatusColor(log.status)}>
                                {getStatusIcon(log.status)}
                                <span className="ml-1">{log.status}</span>
                              </Badge>
                              {log.categoryId && (
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    backgroundColor: `${getCategoryColor(log.categoryId)}15`,
                                    borderColor: getCategoryColor(log.categoryId),
                                    color: getCategoryColor(log.categoryId)
                                  }}
                                >
                                  <FolderOpen className="h-3 w-3 mr-1" />
                                  {categories.find((cat: Category) => cat.id === log.categoryId)?.name || log.category}
                                </Badge>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-1">
                              {log.fromBrandId} → {log.toBrandId}
                            </h3>
                            
                            <p className="text-muted-foreground mb-3">{log.reason}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {log.points && (
                                <div>
                                  <span className="text-muted-foreground">Points:</span>
                                  <p className="font-medium text-green-600">{log.points}</p>
                                </div>
                              )}
                              {log.isPublic !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Visibility:</span>
                                  <p className="font-medium">{log.isPublic ? 'Public' : 'Private'}</p>
                                </div>
                              )}
                              {log.tags && log.tags.length > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Tags:</span>
                                  <p className="font-medium">{log.tags.join(', ')}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <p className="font-medium">{new Date(log.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {log.moderatorNotes && (
                              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-xs text-muted-foreground">Moderator Notes:</span>
                                <p className="text-sm">{log.moderatorNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredSwitchLogs.length === 0 && (
                      <div className="text-center py-12">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No switch logs found</h3>
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                            ? "Try adjusting your filters" 
                            : "Start your journey by logging your first brand switch"}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission: Mission) => (
                <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{mission.title}</CardTitle>
                      <Badge variant="secondary">+{mission.pointsReward} pts</Badge>
                    </div>
                    <CardDescription>{mission.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge 
                          variant="outline"
                          style={{ 
                            backgroundColor: `${getCategoryColor(mission.categoryId || '')}15`,
                            borderColor: getCategoryColor(mission.categoryId || ''),
                            color: getCategoryColor(mission.categoryId || '')
                          }}
                        >
                          {mission.targetCategory}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{mission.status}</span>
                      </div>

                      {mission.financialValue && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Value:</span>
                          <span className="font-medium">₹{mission.financialValue.toLocaleString()}</span>
                        </div>
                      )}

                      {mission.endDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">End Date:</span>
                          <span className="font-medium">{new Date(mission.endDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      <Button className="w-full mt-4" variant="outline">
                        Start Mission
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community: Community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {community.visibility === 'PUBLIC' ? (
                          <Globe className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-600" />
                        )}
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {community.memberCount}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{community.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Visibility:</span>
                        <Badge variant={community.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
                          {community.visibility}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{new Date(community.createdAt).toLocaleDateString()}</span>
                      </div>

                      <Button className="w-full mt-4">
                        Join Community
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Categories Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Category Insights
                  </CardTitle>
                  <CardDescription>Your switching patterns by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map((category: Category) => {
                      const categoryLogs = switchLogs.filter((log: SwitchLog) => log.categoryId === category.id);
                      const percentage = switchLogs.length > 0 ? (categoryLogs.length / switchLogs.length) * 100 : 0;
                      
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {categoryLogs.length} switches
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Popular Tags
                  </CardTitle>
                  <CardDescription>Trending tags in the community</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags
                      .sort((a: Tag, b: Tag) => b.usageCount - a.usageCount)
                      .slice(0, 12)
                      .map((tag: Tag) => (
                        <Badge 
                          key={tag.id} 
                          variant="outline"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            borderColor: tag.color,
                            color: tag.color
                          }}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                          #{tag.name}
                          <span className="ml-1 text-xs">({tag.usageCount})</span>
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}