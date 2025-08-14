import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield, Flag, MessageSquare, User, CheckCircle, XCircle, Clock, Eye,
  Plus, Edit, Trash2, Users, Target, PlusCircle, FileText, Calendar,
  Award, Camera, Link as LinkIcon, Upload, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Form schemas
const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  userId: z.string().min(1, 'User ID is required')
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

const missionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  targetCategory: z.string().optional(),
  pointsReward: z.number().min(1, 'Points must be greater than 0'),
  startDate: z.string(),
  endDate: z.string(),
  createdBy: z.string()
});

export default function ModeratorPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('reports');

  // Reports queries
  const { data: pendingReports = [] } = useQuery({
    queryKey: ['/api/moderation/reports', 'PENDING'],
    enabled: !!user
  });

  const { data: reviewedReports = [] } = useQuery({
    queryKey: ['/api/moderation/reports', 'REVIEWED'],
    enabled: !!user
  });

  const { data: allReports = [] } = useQuery({
    queryKey: ['/api/moderation/reports'],
    enabled: !!user
  });

  // Switch logs queries
  const { data: pendingSwitchLogs = [] } = useQuery({
    queryKey: ['/api/moderation/switch-logs/pending'],
    enabled: !!user
  });

  // Feedback questions queries
  const { data: feedbackQuestions = [] } = useQuery({
    queryKey: ['/api/moderation/feedback-questions'],
    enabled: !!user
  });

  // Missions queries
  const { data: missions = [] } = useQuery({
    queryKey: ['/api/moderation/missions'],
    enabled: !!user
  });

  // Users queries
  const { data: users = [] } = useQuery({
    queryKey: ['/api/moderation/users'],
    enabled: !!user
  });

  // Forms
  const postForm = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      imageUrl: '',
      userId: user?.id || ''
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

  const missionForm = useForm({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      title: '',
      description: '',
      pointsReward: 50,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: user?.id || ''
    }
  });

  // Mutations
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, resolution }: { reportId: string; status: string; resolution?: string }) => {
      const response = await fetch(`/api/moderation/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution, moderatorId: user?.id })
      });
      if (!response.ok) throw new Error('Failed to update report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/reports'] });
      toast({ title: 'Report updated successfully' });
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

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/moderation/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Post created successfully' });
      postForm.reset();
    }
  });

  const createFeedbackQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/moderation/feedback-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create feedback question');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/feedback-questions'] });
      toast({ title: 'Feedback question created successfully' });
      feedbackForm.reset();
    }
  });

  const createMissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/moderation/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create mission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/missions'] });
      toast({ title: 'Mission created successfully' });
      missionForm.reset();
    }
  });

  const handleReportAction = (reportId: string, status: string, resolution?: string) => {
    updateReportMutation.mutate({ reportId, status, resolution });
  };

  const handleApproveSwitchLog = (id: string, notes?: string) => {
    approveSwitchLogMutation.mutate({ id, notes });
  };

  const handleRejectSwitchLog = (id: string) => {
    const notes = window.prompt('Enter rejection reason:');
    if (notes) {
      rejectSwitchLogMutation.mutate({ id, notes });
    }
  };

  const onCreatePost = (data: any) => {
    createPostMutation.mutate(data);
  };

  const onCreateFeedbackQuestion = (data: any) => {
    createFeedbackQuestionMutation.mutate(data);
  };

  const onCreateMission = (data: any) => {
    createMissionMutation.mutate(data);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Moderator Control Panel</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-fit">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Reports ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="switches" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Switch Logs ({pendingSwitchLogs.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Create Posts
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Missions
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                      <p className="text-2xl font-bold">{pendingReports.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                      <p className="text-2xl font-bold">{reviewedReports.length}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-bold">{allReports.length}</p>
                    </div>
                    <Flag className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {pendingReports.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">No pending reports to review.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReports.map((report: any) => (
                  <Card key={report.id} className="mb-4">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Flag className="w-5 h-5 text-red-500" />
                          {report.contentType === 'post' ? 'Post Report' : 'Comment Report'}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          PENDING
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Reporter:</span>
                            <div>@{report.reporter?.handle}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Content ID:</span>
                            <div className="font-mono text-xs">{report.contentId}</div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-muted-foreground">Reason:</span>
                          <div className="mt-1">
                            <Badge variant="outline">{report.reason}</Badge>
                          </div>
                        </div>

                        {report.description && (
                          <div>
                            <span className="font-medium text-muted-foreground">Description:</span>
                            <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                              {report.description}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'REVIEWED')}
                            disabled={updateReportMutation.isPending}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Mark as Reviewed
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const resolution = window.prompt('Enter resolution details:');
                              if (resolution) {
                                handleReportAction(report.id, 'RESOLVED', resolution);
                              }
                            }}
                            disabled={updateReportMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Switch Logs Tab */}
          <TabsContent value="switches">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Pending Switch Log Approvals</h2>
                <Badge variant="secondary">{pendingSwitchLogs.length} pending</Badge>
              </div>

              {pendingSwitchLogs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Switch Logs Reviewed!</h3>
                    <p className="text-muted-foreground">No pending switch logs require approval.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingSwitchLogs.map((log: any) => (
                  <Card key={log.switchLog.id} className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-500" />
                          Switch from {log.fromBrand?.name} to {log.toBrand?.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          PENDING APPROVAL
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                          <div>
                            <span className="font-medium text-muted-foreground">Reason:</span>
                            <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                              {log.switchLog.reason}
                            </div>
                          </div>
                        )}

                        {log.switchLog.evidenceUrl && (
                          <div>
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

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            onClick={() => handleApproveSwitchLog(log.switchLog.id)}
                            disabled={approveSwitchLogMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectSwitchLog(log.switchLog.id)}
                            disabled={rejectSwitchLogMutation.isPending}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Create Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Create New Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...postForm}>
                  <form onSubmit={postForm.handleSubmit(onCreatePost)} className="space-y-6">
                    <FormField
                      control={postForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your post content here..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={postForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://example.com/image.jpg"
                                {...field}
                              />
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={createPostMutation.isPending}
                      className="w-full"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Feedback Questions
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Create Feedback Question</DialogTitle>
                        </DialogHeader>
                        <Form {...feedbackForm}>
                          <form onSubmit={feedbackForm.handleSubmit(onCreateFeedbackQuestion)} className="space-y-4">
                            <FormField
                              control={feedbackForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Question Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter question title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={feedbackForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Additional context" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={feedbackForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Question Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                      <SelectItem value="text">Text Response</SelectItem>
                                      <SelectItem value="rating">Rating</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={feedbackForm.control}
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
                                control={feedbackForm.control}
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
                              disabled={createFeedbackQuestionMutation.isPending}
                              className="w-full"
                            >
                              Create Question
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackQuestions.map((question: any) => (
                      <Card key={question.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{question.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline">{question.type}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(question.startDate).toLocaleDateString()} - {new Date(question.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Community Missions
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Mission
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Create New Mission</DialogTitle>
                        </DialogHeader>
                        <Form {...missionForm}>
                          <form onSubmit={missionForm.handleSubmit(onCreateMission)} className="space-y-4">
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
                              disabled={createMissionMutation.isPending}
                              className="w-full"
                            >
                              Create Mission
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {missions.map((mission: any) => (
                      <Card key={mission.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{mission.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{mission.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {mission.pointsReward} points
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(mission.startDate).toLocaleDateString()} - {new Date(mission.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Member Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((userData: any) => (
                    <Card key={userData.user.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">@{userData.user.handle}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Level {userData.user.level}</span>
                                <span>{userData.user.points} points</span>
                                <span>{userData.totalSwitches || 0} switches</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={userData.user.role === 'ADMIN' ? 'default' : 'secondary'}>
                              {userData.user.role}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}