import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield, Flag, MessageSquare, User, CheckCircle, Clock, Eye,
  Plus, Edit, Trash2, Users, Target, FileText, Award, Camera, 
  Upload, ThumbsUp, ThumbsDown, Menu, X, Home, Settings,
  Newspaper, TrendingUp, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Enhanced form schemas
const missionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  targetCategory: z.string().optional(),
  fromBrandIds: z.array(z.string()).min(1, 'At least one source brand is required'),
  toBrandIds: z.array(z.string()).min(1, 'At least one target brand is required'),
  pointsReward: z.number().min(1, 'Points must be greater than 0'),
  startDate: z.string(),
  endDate: z.string(),
  createdBy: z.string()
});

const newsArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrls: z.array(z.string().url()).optional(),
  suggestedFromBrandIds: z.array(z.string()).optional(),
  suggestedToBrandIds: z.array(z.string()).optional(),
  commentsEnabled: z.boolean().default(true),
  isPublished: z.boolean().default(true),
  createdBy: z.string()
});

const feedbackQuestionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['multiple_choice', 'text', 'rating']),
  options: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string(),
  createdBy: z.string()
});

export default function ModeratorPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data queries
  const { data: pendingReports = [] } = useQuery({
    queryKey: ['/api/moderation/reports', 'PENDING'],
    enabled: !!user
  });

  const { data: pendingSwitchLogs = [] } = useQuery({
    queryKey: ['/api/moderation/switch-logs/pending'],
    enabled: !!user
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['/api/moderation/missions'],
    enabled: !!user
  });

  const { data: newsArticles = [] } = useQuery({
    queryKey: ['/api/moderation/news'],
    enabled: !!user
  });

  const { data: feedbackQuestions = [] } = useQuery({
    queryKey: ['/api/moderation/feedback-questions'],
    enabled: !!user
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/moderation/users'],
    enabled: !!user
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
    enabled: !!user
  });

  // Enhanced forms with multi-select support
  const missionForm = useForm({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: '',
      description: '',
      targetCategory: '',
      fromBrandIds: [],
      toBrandIds: [],
      pointsReward: 50,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: user?.id || ''
    }
  });

  const newsForm = useForm({
    resolver: zodResolver(newsArticleSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrls: [],
      suggestedFromBrandIds: [],
      suggestedToBrandIds: [],
      commentsEnabled: true,
      isPublished: true,
      createdBy: user?.id || ''
    }
  });

  const feedbackForm = useForm({
    resolver: zodResolver(feedbackQuestionSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'multiple_choice' as const,
      options: [''],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: user?.id || ''
    }
  });

  // Multi-select handlers
  const [selectedFromBrands, setSelectedFromBrands] = useState<string[]>([]);
  const [selectedToBrands, setSelectedToBrands] = useState<string[]>([]);
  const [selectedSuggestedFromBrands, setSelectedSuggestedFromBrands] = useState<string[]>([]);
  const [selectedSuggestedToBrands, setSelectedSuggestedToBrands] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  // Mutations
  const createMissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/moderation/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fromBrandIds: selectedFromBrands, toBrandIds: selectedToBrands })
      });
      if (!response.ok) throw new Error('Failed to create mission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/missions'] });
      toast({ title: 'Mission created successfully' });
      missionForm.reset();
      setSelectedFromBrands([]);
      setSelectedToBrands([]);
    }
  });

  const createNewsArticleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/moderation/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          imageUrls: imageUrls.filter(url => url.trim()),
          suggestedFromBrandIds: selectedSuggestedFromBrands,
          suggestedToBrandIds: selectedSuggestedToBrands
        })
      });
      if (!response.ok) throw new Error('Failed to create news article');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/news'] });
      toast({ title: 'News article created successfully' });
      newsForm.reset();
      setImageUrls(['']);
      setSelectedSuggestedFromBrands([]);
      setSelectedSuggestedToBrands([]);
    }
  });

  const approveSwitchLogMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/moderation/switch-logs/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderatorId: user?.id, notes })
      });
      if (!response.ok) throw new Error('Failed to approve switch log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/switch-logs/pending'] });
      toast({ title: 'Switch log approved successfully' });
    }
  });

  const rejectSwitchLogMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const response = await fetch(`/api/moderation/switch-logs/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderatorId: user?.id, notes })
      });
      if (!response.ok) throw new Error('Failed to reject switch log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/switch-logs/pending'] });
      toast({ title: 'Switch log rejected' });
    }
  });

  // Utility functions
  const addBrandToSelection = (brandId: string, type: 'from' | 'to' | 'suggestedFrom' | 'suggestedTo') => {
    switch (type) {
      case 'from':
        if (!selectedFromBrands.includes(brandId)) {
          setSelectedFromBrands([...selectedFromBrands, brandId]);
        }
        break;
      case 'to':
        if (!selectedToBrands.includes(brandId)) {
          setSelectedToBrands([...selectedToBrands, brandId]);
        }
        break;
      case 'suggestedFrom':
        if (!selectedSuggestedFromBrands.includes(brandId)) {
          setSelectedSuggestedFromBrands([...selectedSuggestedFromBrands, brandId]);
        }
        break;
      case 'suggestedTo':
        if (!selectedSuggestedToBrands.includes(brandId)) {
          setSelectedSuggestedToBrands([...selectedSuggestedToBrands, brandId]);
        }
        break;
    }
  };

  const removeBrandFromSelection = (brandId: string, type: 'from' | 'to' | 'suggestedFrom' | 'suggestedTo') => {
    switch (type) {
      case 'from':
        setSelectedFromBrands(selectedFromBrands.filter(id => id !== brandId));
        break;
      case 'to':
        setSelectedToBrands(selectedToBrands.filter(id => id !== brandId));
        break;
      case 'suggestedFrom':
        setSelectedSuggestedFromBrands(selectedSuggestedFromBrands.filter(id => id !== brandId));
        break;
      case 'suggestedTo':
        setSelectedSuggestedToBrands(selectedSuggestedToBrands.filter(id => id !== brandId));
        break;
    }
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, url: string) => {
    const updated = [...imageUrls];
    updated[index] = url;
    setImageUrls(updated);
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home, count: pendingReports.length + pendingSwitchLogs.length },
    { id: 'reports', label: 'Reports', icon: Flag, count: pendingReports.length },
    { id: 'switches', label: 'Switch Approvals', icon: Target, count: pendingSwitchLogs.length },
    { id: 'missions', label: 'Missions', icon: Award, count: missions.length },
    { id: 'news', label: 'News Articles', icon: Newspaper, count: newsArticles.length },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, count: feedbackQuestions.length },
    { id: 'members', label: 'Members', icon: Users, count: users.length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: 0 },
  ];

  // Close sidebar on mobile when section changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [activeSection]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access this panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">Moderator Panel</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${activeSection === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600' : 'text-gray-700 dark:text-gray-300'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && (
                <Badge variant={activeSection === item.id ? 'default' : 'secondary'} className="text-xs">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-semibold capitalize">
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Overview'}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                        <p className="text-2xl font-bold text-red-600">{pendingReports.length}</p>
                      </div>
                      <Flag className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Switch Approvals</p>
                        <p className="text-2xl font-bold text-yellow-600">{pendingSwitchLogs.length}</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Missions</p>
                        <p className="text-2xl font-bold text-blue-600">{missions.filter((m: any) => m.isActive).length}</p>
                      </div>
                      <Award className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                        <p className="text-2xl font-bold text-green-600">{users.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingSwitchLogs.slice(0, 3).map((log: any) => (
                        <div key={log.switchLog.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <Target className="w-4 h-4 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">New switch request</p>
                            <p className="text-xs text-muted-foreground">
                              From {log.fromBrand?.name} to {log.toBrand?.name}
                            </p>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => setActiveSection('missions')} 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col gap-2"
                      >
                        <Award className="w-6 h-6" />
                        <span className="text-xs">Create Mission</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveSection('news')} 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col gap-2"
                      >
                        <Newspaper className="w-6 h-6" />
                        <span className="text-xs">Post News</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveSection('switches')} 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col gap-2"
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-xs">Review Switches</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveSection('reports')} 
                        variant="outline" 
                        className="h-auto py-4 flex flex-col gap-2"
                      >
                        <Flag className="w-6 h-6" />
                        <span className="text-xs">Handle Reports</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'missions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Mission Management</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Mission
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Mission</DialogTitle>
                    </DialogHeader>
                    <Form {...missionForm}>
                      <form onSubmit={missionForm.handleSubmit((data) => createMissionMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={missionForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mission Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mission title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={missionForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the mission goals" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <Label>Switch From Brands (Select Multiple)</Label>
                          <div className="mt-2 space-y-2">
                            <Select onValueChange={(brandId) => addBrandToSelection(brandId, 'from')}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brands to switch from" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.filter((brand: any) => !selectedFromBrands.includes(brand.id)).map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {selectedFromBrands.map((brandId) => {
                                const brand = brands.find((b: any) => b.id === brandId);
                                return (
                                  <Badge key={brandId} variant="secondary" className="flex items-center gap-1">
                                    {brand?.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => removeBrandFromSelection(brandId, 'from')}
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
                          <Label>Switch To Brands (Select Multiple)</Label>
                          <div className="mt-2 space-y-2">
                            <Select onValueChange={(brandId) => addBrandToSelection(brandId, 'to')}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brands to switch to" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.filter((brand: any) => !selectedToBrands.includes(brand.id)).map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {selectedToBrands.map((brandId) => {
                                const brand = brands.find((b: any) => b.id === brandId);
                                return (
                                  <Badge key={brandId} variant="default" className="flex items-center gap-1">
                                    {brand?.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => removeBrandFromSelection(brandId, 'to')}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={missionForm.control}
                          name="pointsReward"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Points Reward</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="50"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={missionForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={missionForm.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button 
                          type="submit" 
                          disabled={createMissionMutation.isPending || selectedFromBrands.length === 0 || selectedToBrands.length === 0}
                          className="w-full"
                        >
                          Create Mission
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missions.map((mission: any) => (
                  <Card key={mission.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{mission.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                        </div>
                        
                        <div className="space-y-2">
                          {mission.fromBrandIds?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-red-600">Switch From:</p>
                              <div className="flex flex-wrap gap-1">
                                {mission.fromBrandIds.map((brandId: string) => {
                                  const brand = brands.find((b: any) => b.id === brandId);
                                  return (
                                    <Badge key={brandId} variant="outline" className="text-xs">
                                      {brand?.name || brandId}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {mission.toBrandIds?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-green-600">Switch To:</p>
                              <div className="flex flex-wrap gap-1">
                                {mission.toBrandIds.map((brandId: string) => {
                                  const brand = brands.find((b: any) => b.id === brandId);
                                  return (
                                    <Badge key={brandId} variant="default" className="text-xs">
                                      {brand?.name || brandId}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {mission.pointsReward} points
                          </Badge>
                          <Badge variant={mission.isActive ? 'default' : 'secondary'}>
                            {mission.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
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

          {activeSection === 'news' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">News Management</h3>
                <Dialog>
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
                      <form onSubmit={newsForm.handleSubmit((data) => createNewsArticleMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={newsForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Article Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter news title" {...field} />
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

                        <div>
                          <Label>Image URLs</Label>
                          <div className="space-y-2 mt-2">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder="https://example.com/image.jpg"
                                  value={url}
                                  onChange={(e) => updateImageUrl(index, e.target.value)}
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
                            <Button type="button" variant="outline" onClick={addImageUrl}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Suggested Switch From Brands</Label>
                          <div className="mt-2 space-y-2">
                            <Select onValueChange={(brandId) => addBrandToSelection(brandId, 'suggestedFrom')}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brands to suggest switching from" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.filter((brand: any) => !selectedSuggestedFromBrands.includes(brand.id)).map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {selectedSuggestedFromBrands.map((brandId) => {
                                const brand = brands.find((b: any) => b.id === brandId);
                                return (
                                  <Badge key={brandId} variant="secondary" className="flex items-center gap-1">
                                    {brand?.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => removeBrandFromSelection(brandId, 'suggestedFrom')}
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
                            <Select onValueChange={(brandId) => addBrandToSelection(brandId, 'suggestedTo')}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brands to suggest switching to" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.filter((brand: any) => !selectedSuggestedToBrands.includes(brand.id)).map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {selectedSuggestedToBrands.map((brandId) => {
                                const brand = brands.find((b: any) => b.id === brandId);
                                return (
                                  <Badge key={brandId} variant="default" className="flex items-center gap-1">
                                    {brand?.name}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => removeBrandFromSelection(brandId, 'suggestedTo')}
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
                              checked={newsForm.watch('commentsEnabled')}
                              onCheckedChange={(checked) => newsForm.setValue('commentsEnabled', checked)}
                            />
                            <Label htmlFor="comments-enabled">Enable Comments</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="is-published"
                              checked={newsForm.watch('isPublished')}
                              onCheckedChange={(checked) => newsForm.setValue('isPublished', checked)}
                            />
                            <Label htmlFor="is-published">Publish Immediately</Label>
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
                          <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                          <p className="text-muted-foreground mb-4">{article.description}</p>
                          
                          {(article.suggestedFromBrandIds?.length > 0 || article.suggestedToBrandIds?.length > 0) && (
                            <div className="space-y-2 mb-4">
                              {article.suggestedFromBrandIds?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-red-600 mb-1">Suggested switches from:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {article.suggestedFromBrandIds.map((brandId: string) => {
                                      const brand = brands.find((b: any) => b.id === brandId);
                                      return (
                                        <Badge key={brandId} variant="outline" className="text-xs">
                                          {brand?.name || brandId}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {article.suggestedToBrandIds?.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-green-600 mb-1">Suggested switches to:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {article.suggestedToBrandIds.map((brandId: string) => {
                                      const brand = brands.find((b: any) => b.id === brandId);
                                      return (
                                        <Badge key={brandId} variant="default" className="text-xs">
                                          {brand?.name || brandId}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            <Badge variant={article.commentsEnabled ? 'default' : 'secondary'}>
                              Comments {article.commentsEnabled ? 'On' : 'Off'}
                            </Badge>
                            <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                              {article.isPublished ? 'Published' : 'Draft'}
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

          {activeSection === 'switches' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Switch Log Approvals</h3>
              
              {pendingSwitchLogs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Switch Logs Reviewed!</h3>
                    <p className="text-muted-foreground">No pending switch logs require approval.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingSwitchLogs.map((log: any) => (
                    <Card key={log.switchLog.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-5 h-5 text-blue-500" />
                              <h3 className="font-semibold">
                                Switch from {log.fromBrand?.name} to {log.toBrand?.name}
                              </h3>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                PENDING APPROVAL
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-muted-foreground">User:</span>
                                <div>@{log.user?.handle} (Level {log.user?.level})</div>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Category:</span>
                                <div>{log.switchLog.category}</div>
                              </div>
                            </div>

                            {log.switchLog.reason && (
                              <div className="mb-4">
                                <span className="font-medium text-muted-foreground">Reason:</span>
                                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                                  {log.switchLog.reason}
                                </div>
                              </div>
                            )}

                            {log.switchLog.evidenceUrl && (
                              <div className="mb-4">
                                <span className="font-medium text-muted-foreground">Evidence:</span>
                                <div className="mt-1">
                                  <img 
                                    src={log.switchLog.evidenceUrl} 
                                    alt="Switch evidence" 
                                    className="w-32 h-32 object-cover rounded-lg border"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            onClick={() => approveSwitchLogMutation.mutate({ id: log.switchLog.id })}
                            disabled={approveSwitchLogMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const notes = window.prompt('Enter rejection reason:');
                              if (notes) {
                                rejectSwitchLogMutation.mutate({ id: log.switchLog.id, notes });
                              }
                            }}
                            disabled={rejectSwitchLogMutation.isPending}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Additional sections would go here */}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}