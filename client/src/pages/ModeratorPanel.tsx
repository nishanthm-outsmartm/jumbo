import { useState } from 'react';
import { Shield, Flag, MessageSquare, User, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

interface ModerationReport {
  id: string;
  contentType: 'post' | 'comment';
  contentId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  reporter: { handle: string };
  createdAt: string;
  resolution?: string;
}

export default function ModeratorPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

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

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, resolution }: { reportId: string; status: string; resolution?: string }) => {
      const response = await fetch(`/api/moderation/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution, moderatorId: user?.uid })
      });
      if (!response.ok) throw new Error('Failed to update report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/moderation/reports'] });
    }
  });

  const handleReportAction = (reportId: string, status: 'REVIEWED' | 'RESOLVED', resolution?: string) => {
    updateReportMutation.mutate({ reportId, status, resolution });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'RESOLVED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'REVIEWED': return <Eye className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const ReportCard = ({ report }: { report: ModerationReport }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            {report.contentType === 'post' ? 'Post Report' : 'Comment Report'}
          </CardTitle>
          <Badge className={getStatusColor(report.status)} variant="secondary">
            {getStatusIcon(report.status)}
            <span className="ml-1">{report.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Reporter:</span>
              <div>@{report.reporter.handle}</div>
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

          {report.resolution && (
            <div>
              <span className="font-medium text-muted-foreground">Resolution:</span>
              <div className="mt-1 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm border-l-4 border-green-500">
                {report.resolution}
              </div>
            </div>
          )}

          {report.status === 'PENDING' && (
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
          )}

          {report.status === 'REVIEWED' && (
            <div className="flex gap-2 pt-4 border-t">
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
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Please log in to access the moderator panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Moderator Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and manage community reports and content moderation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold">
                  {allReports.filter((r: any) => 
                    r.status === 'RESOLVED' && 
                    new Date(r.resolvedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Under Review ({reviewedReports.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            All Reports ({allReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
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
              pendingReports.map((report: ModerationReport) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviewed">
          <div className="space-y-4">
            {reviewedReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Reports Under Review</h3>
                  <p className="text-muted-foreground">Reports that are being reviewed will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              reviewedReports.map((report: ModerationReport) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {allReports.map((report: ModerationReport) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}