import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, Zap, MessageSquare, CheckCircle, Heart, Share2, 
  ArrowRight, TrendingUp, Users, Calendar, Pin, ExternalLink,
  Image as ImageIcon, Tag, Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InteractivePostCardProps {
  post: {
    id: string;
    postType: string;
    title?: string;
    content: string;
    categoryId?: string;
    communityId?: string;
    missionId?: string;
    targetBrandFrom?: string;
    targetBrandTo?: string;
    actionButtonText?: string;
    actionButtonUrl?: string;
    imageUrl?: string;
    isPinned?: boolean;
    expiresAt?: string;
    createdAt: string;
    author?: {
      id: string;
      handle: string;
      avatar?: string;
      role: string;
    };
    category?: {
      id: string;
      name: string;
      color: string;
    };
    community?: {
      id: string;
      name: string;
      visibility: string;
    };
    mission?: {
      id: string;
      title: string;
      pointsReward: number;
    };
    _count?: {
      reactions: number;
      comments: number;
    };
  };
  onAction?: (actionType: string, postId: string) => void;
}

export function InteractivePostCard({ post, onAction }: InteractivePostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSwitchLogDialog, setShowSwitchLogDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiRequest(`/api/posts/${postId}/reactions`, 'POST', { 
      type: 'LIKE',
      userId: 'current-user-id' // This should come from auth context
    }),
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    }
  });

  // Create switch log from post interaction
  const createSwitchLogMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/switch-logs/from-post', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Switch Log Created!",
        description: "Your brand switch has been logged successfully. Points will be awarded after review.",
      });
      setShowSwitchLogDialog(false);
      onAction?.('switch_log_created', post.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create switch log. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case "SWITCH_LOG_PROMPT":
        return {
          icon: <Target className="h-4 w-4" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-950",
          borderColor: "border-orange-200 dark:border-orange-800",
          label: "Switch Challenge"
        };
      case "MISSION_PROMPT":
        return {
          icon: <Zap className="h-4 w-4" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-950",
          borderColor: "border-blue-200 dark:border-blue-800",
          label: "Mission"
        };
      case "ANNOUNCEMENT":
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          color: "text-purple-600",
          bgColor: "bg-purple-50 dark:bg-purple-950",
          borderColor: "border-purple-200 dark:border-purple-800",
          label: "Announcement"
        };
      case "POLL":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
          label: "Poll"
        };
      default:
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-950",
          borderColor: "border-gray-200 dark:border-gray-800",
          label: "Post"
        };
    }
  };

  const handlePrimaryAction = () => {
    switch (post.postType) {
      case "SWITCH_LOG_PROMPT":
        setShowSwitchLogDialog(true);
        break;
      case "MISSION_PROMPT":
        if (post.missionId) {
          // Navigate to mission details or start mission
          onAction?.('mission_started', post.missionId);
        }
        break;
      case "POLL":
        // Handle poll interaction
        onAction?.('poll_voted', post.id);
        break;
      default:
        if (post.actionButtonUrl) {
          window.open(post.actionButtonUrl, '_blank');
        }
        break;
    }
  };

  const postTypeInfo = getPostTypeInfo(post.postType);
  const isExpired = post.expiresAt && new Date(post.expiresAt) < new Date();

  return (
    <>
      <Card className={`${postTypeInfo.borderColor} ${post.isPinned ? 'ring-2 ring-yellow-400' : ''} ${isExpired ? 'opacity-60' : ''}`}>
        {post.isPinned && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800">
            <Pin className="h-3 w-3 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Pinned Post</span>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatar} />
                <AvatarFallback>{post.author?.handle?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{post.author?.handle}</span>
                  <Badge variant="secondary" className="text-xs">
                    {post.author?.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  {post.expiresAt && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Expires {formatDistanceToNow(new Date(post.expiresAt))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${postTypeInfo.color} ${postTypeInfo.bgColor} ${postTypeInfo.borderColor}`}
              >
                {postTypeInfo.icon}
                <span className="ml-1">{postTypeInfo.label}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          {post.title && (
            <h3 className="text-lg font-semibold">{post.title}</h3>
          )}

          {/* Content */}
          <p className="text-sm leading-relaxed">{post.content}</p>

          {/* Image */}
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Target Brands (for Switch Log Prompts) */}
          {post.postType === "SWITCH_LOG_PROMPT" && (post.targetBrandFrom || post.targetBrandTo) && (
            <div className={`p-3 rounded-lg ${postTypeInfo.bgColor} ${postTypeInfo.borderColor} border`}>
              <div className="flex items-center justify-between">
                {post.targetBrandFrom && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Switch From</p>
                    <p className="font-medium text-sm">{post.targetBrandFrom}</p>
                  </div>
                )}
                {post.targetBrandFrom && post.targetBrandTo && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
                {post.targetBrandTo && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Switch To</p>
                    <p className="font-medium text-sm text-green-600">{post.targetBrandTo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mission Info (for Mission Prompts) */}
          {post.postType === "MISSION_PROMPT" && post.mission && (
            <div className={`p-3 rounded-lg ${postTypeInfo.bgColor} ${postTypeInfo.borderColor} border`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{post.mission.title}</p>
                  <p className="text-xs text-muted-foreground">Related Mission</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{post.mission.pointsReward} pts
                </Badge>
              </div>
            </div>
          )}

          {/* Category and Community Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {post.category && (
              <Badge variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {post.category.name}
              </Badge>
            )}
            {post.community && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {post.community.name}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => likeMutation.mutate(post.id)}
                className={isLiked ? "text-red-600" : ""}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                {post._count?.reactions || 0}
              </Button>
              
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post._count?.comments || 0}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>

            {!isExpired && (
              <Button 
                onClick={handlePrimaryAction}
                className={`${postTypeInfo.color} bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white`}
              >
                {postTypeInfo.icon}
                <span className="ml-2">
                  {post.actionButtonText || 
                   (post.postType === "SWITCH_LOG_PROMPT" ? "Log Your Switch" :
                    post.postType === "MISSION_PROMPT" ? "Start Mission" : "Learn More")}
                </span>
                {post.actionButtonUrl && <ExternalLink className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Switch Log Creation Dialog */}
      <Dialog open={showSwitchLogDialog} onOpenChange={setShowSwitchLogDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Your Brand Switch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share your experience switching from {post.targetBrandFrom || "a foreign brand"} to {post.targetBrandTo || "an Indian brand"}
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => createSwitchLogMutation.mutate({
                  postId: post.id,
                  fromBrand: post.targetBrandFrom,
                  toBrand: post.targetBrandTo,
                  categoryId: post.categoryId
                })}
                disabled={createSwitchLogMutation.isPending}
              >
                {createSwitchLogMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Create Switch Log
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowSwitchLogDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InteractivePostCard;