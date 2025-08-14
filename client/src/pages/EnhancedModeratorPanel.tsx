import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { BrandSelector } from '@/components/BrandSelector';
import { EnhancedMissionDialog } from '@/components/EnhancedMissionDialog';
import { MessagingSystem } from '@/components/MessagingSystem';

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

export default function EnhancedModeratorPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connected for moderator panel');
      setWsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Real-time update received:', data);
      
      // Invalidate relevant queries to refresh data
      if (data.type === 'update') {
        queryClient.invalidateQueries();
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };
    
    return () => {
      ws.close();
    };
  }, [queryClient]);

  // Send real-time updates
  const sendRealtimeUpdate = useCallback((type: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        data,
        source: 'moderator_panel'
      }));
    }
  }, []);

  // Post form state
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    targetAlternatives: '',
    isActive: true
  });

  // Queries
  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ['/api/moderation/missions'],
  });

  const { data: moderatorPosts = [] } = useQuery<Post[]>({
    queryKey: ['/api/moderation/posts'],
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/moderation/analytics'],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: any) => apiRequest('POST', '/api/moderation/posts', postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/posts'] });
      setNewPostData({
        title: '',
        content: '',
        imageUrl: '',
        linkUrl: '',
        targetAlternatives: '',
        isActive: true
      });
      setShowPostDialog(false);
      sendRealtimeUpdate('post_created', { createdBy: user?.id });
    }
  });

  const handleCreatePost = () => {
    if (!newPostData.title || !newPostData.content) return;

    const postPayload = {
      ...newPostData,
      createdBy: user?.id
    };

    createPostMutation.mutate(postPayload);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
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
            <div className={`flex items-center gap-2 text-sm ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
              {wsConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {wsConnected ? 'Live Updates' : 'Offline'}
            </div>
            
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {user?.role}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r bg-card h-[calc(100vh-73px)]`}>
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
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
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active Missions</p>
                      <p className="text-2xl font-bold">{missions.filter((m: Mission) => m.isActive).length}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-6">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Posts Created</p>
                      <p className="text-2xl font-bold">{moderatorPosts.length}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-6">
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Messages</p>
                      <p className="text-2xl font-bold">-</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-6">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Platform Growth</p>
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
                        <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Member message received</span>
                        <span className="text-xs text-muted-foreground ml-auto">4 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Post published</span>
                        <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
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
                      <Button className="w-full justify-start" onClick={() => setShowMissionDialog(true)}>
                        <Target className="h-4 w-4 mr-2" />
                        Create New Mission
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setShowPostDialog(true)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Create New Post
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('messages')}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Check Messages
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Missions Tab */}
          {activeTab === 'missions' && (
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
                            <Badge variant={mission.isActive ? "default" : "secondary"}>
                              {mission.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {mission.pointsReward} points
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {mission.startDate ? format(new Date(mission.startDate), 'MMM dd') : 'No start date'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {mission.category}
                            </span>
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

          {/* Posts Tab */}
          {activeTab === 'posts' && (
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
                            <Badge variant={post.isActive ? "default" : "secondary"}>
                              {post.isActive ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.createdAt), 'MMM dd, yyyy')}
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

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Messages</h2>
              <MessagingSystem />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
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
                        <span className="font-medium">{missions.filter((m: Mission) => m.isActive).length}</span>
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

      {/* Enhanced Mission Dialog */}
      <EnhancedMissionDialog
        open={showMissionDialog}
        onOpenChange={setShowMissionDialog}
        onMissionCreated={() => sendRealtimeUpdate('mission_created', { createdBy: user?.id })}
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
                onChange={(e) => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title"
              />
            </div>

            <div>
              <Label htmlFor="postContent">Content *</Label>
              <Textarea
                id="postContent"
                value={newPostData.content}
                onChange={(e) => setNewPostData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="targetAlternatives">Target Alternatives</Label>
              <Input
                id="targetAlternatives"
                value={newPostData.targetAlternatives}
                onChange={(e) => setNewPostData(prev => ({ ...prev, targetAlternatives: e.target.value }))}
                placeholder="e.g., Indian brands to recommend"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={newPostData.imageUrl}
                  onChange={(e) => setNewPostData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                <Input
                  id="linkUrl"
                  value={newPostData.linkUrl}
                  onChange={(e) => setNewPostData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newPostData.isActive}
                onCheckedChange={(checked) => setNewPostData(prev => ({ ...prev, isActive: checked }))}
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
              disabled={!newPostData.title || !newPostData.content || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}