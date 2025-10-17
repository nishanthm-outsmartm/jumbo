import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusCircle, Send, Image, Target, Zap, Pin, Clock, 
  Globe, Users, Tag, MessageSquare, CheckCircle 
} from "lucide-react";

interface ModeratorPostCreatorProps {
  onPostCreated?: () => void;
}

export function ModeratorPostCreator({ onPostCreated }: ModeratorPostCreatorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [postData, setPostData] = useState({
    postType: "SWITCH_LOG_PROMPT",
    title: "",
    content: "",
    categoryId: "",
    communityId: "",
    missionId: "",
    targetBrandFrom: "",
    targetBrandTo: "",
    actionButtonText: "",
    imageUrl: "",
    isPinned: false,
    tags: [] as string[],
    expiresAt: ""
  });

  // Data fetching queries
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['/api/categories']
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: communitiesData = [] } = useQuery({
    queryKey: ['/api/communities']
  });
  const communities = Array.isArray(communitiesData) ? communitiesData : [];

  const { data: missionsData = [] } = useQuery({
    queryKey: ['/api/missions']
  });
  const missions = Array.isArray(missionsData) ? missionsData : [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/moderation/posts', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your moderator post has been published successfully.",
      });
      // Reset form
      setPostData({
        postType: "SWITCH_LOG_PROMPT",
        title: "",
        content: "",
        categoryId: "",
        communityId: "",
        missionId: "",
        targetBrandFrom: "",
        targetBrandTo: "",
        actionButtonText: "",
        imageUrl: "",
        isPinned: false,
        tags: [],
        expiresAt: ""
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      onPostCreated?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating post:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postData.title || !postData.content) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for the post.",
        variant: "destructive",
      });
      return;
    }

    // Set default action button text based on post type
    const actionButtonText = postData.actionButtonText || 
      (postData.postType === "SWITCH_LOG_PROMPT" ? "Log Your Switch" : 
       postData.postType === "MISSION_PROMPT" ? "Start Mission" : "Learn More");

    await createPostMutation.mutateAsync({
      ...postData,
      actionButtonText,
      userId: "current-user-id", // This should come from auth context
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "SWITCH_LOG_PROMPT": return <Target className="h-4 w-4" />;
      case "MISSION_PROMPT": return <Zap className="h-4 w-4" />;
      case "ANNOUNCEMENT": return <MessageSquare className="h-4 w-4" />;
      case "POLL": return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeDescription = (type: string) => {
    switch (type) {
      case "SWITCH_LOG_PROMPT": 
        return "Encourage members to share their brand switching experiences";
      case "MISSION_PROMPT": 
        return "Promote specific missions and challenges";
      case "ANNOUNCEMENT": 
        return "Make important announcements to the community";
      case "POLL": 
        return "Create polls for community engagement";
      default: 
        return "General community post";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Create Moderator Post
        </CardTitle>
        <CardDescription>
          Create engaging posts to encourage community participation and brand switching
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="postType">Post Type</Label>
            <Select 
              value={postData.postType} 
              onValueChange={(value) => setPostData({ ...postData, postType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SWITCH_LOG_PROMPT">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Switch Log Prompt
                  </div>
                </SelectItem>
                <SelectItem value="MISSION_PROMPT">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Mission Prompt
                  </div>
                </SelectItem>
                <SelectItem value="ANNOUNCEMENT">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Announcement
                  </div>
                </SelectItem>
                <SelectItem value="POLL">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Poll
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getPostTypeDescription(postData.postType)}
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={postData.title}
              onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              placeholder="Enter an engaging title for your post"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={postData.content}
              onChange={(e) => setPostData({ ...postData, content: e.target.value })}
              placeholder="Write compelling content that encourages community engagement..."
              rows={4}
              required
            />
          </div>

          {/* Category and Community Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={postData.categoryId} 
                onValueChange={(value) => setPostData({ ...postData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Select 
                value={postData.communityId} 
                onValueChange={(value) => setPostData({ ...postData, communityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Communities</SelectItem>
                  {communities.map((community: any) => (
                    <SelectItem key={community.id} value={community.id}>
                      <div className="flex items-center gap-2">
                        {community.visibility === 'PUBLIC' ? (
                          <Globe className="h-3 w-3 text-green-600" />
                        ) : (
                          <Users className="h-3 w-3 text-blue-600" />
                        )}
                        {community.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Switch Log Prompt Specific Fields */}
          {postData.postType === "SWITCH_LOG_PROMPT" && (
            <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-900 dark:text-orange-100">
                Switch Log Prompt Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetBrandFrom">From Brand (Optional)</Label>
                  <Input
                    id="targetBrandFrom"
                    value={postData.targetBrandFrom}
                    onChange={(e) => setPostData({ ...postData, targetBrandFrom: e.target.value })}
                    placeholder="e.g., Samsung, Nike, Coca-Cola"
                  />
                  <p className="text-xs text-muted-foreground">
                    Suggest a specific brand to switch from
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetBrandTo">To Brand (Optional)</Label>
                  <Input
                    id="targetBrandTo"
                    value={postData.targetBrandTo}
                    onChange={(e) => setPostData({ ...postData, targetBrandTo: e.target.value })}
                    placeholder="e.g., Micromax, Bata, Thums Up"
                  />
                  <p className="text-xs text-muted-foreground">
                    Suggest a specific Indian brand to switch to
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mission Prompt Specific Fields */}
          {postData.postType === "MISSION_PROMPT" && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Mission Prompt Settings
              </h4>
              <div className="space-y-2">
                <Label htmlFor="mission">Related Mission</Label>
                <Select 
                  value={postData.missionId} 
                  onValueChange={(value) => setPostData({ ...postData, missionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mission to promote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific mission</SelectItem>
                    {missions.map((mission: any) => (
                      <SelectItem key={mission.id} value={mission.id}>
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          <span>{mission.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            +{mission.pointsReward} pts
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Action Button Text */}
          <div className="space-y-2">
            <Label htmlFor="actionButtonText">Action Button Text</Label>
            <Input
              id="actionButtonText"
              value={postData.actionButtonText}
              onChange={(e) => setPostData({ ...postData, actionButtonText: e.target.value })}
              placeholder={
                postData.postType === "SWITCH_LOG_PROMPT" ? "Log Your Switch" : 
                postData.postType === "MISSION_PROMPT" ? "Start Mission" : "Learn More"
              }
            />
            <p className="text-xs text-muted-foreground">
              Text displayed on the action button (optional, will use default if empty)
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={postData.imageUrl}
                onChange={(e) => setPostData({ ...postData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <Button type="button" variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Post Options */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium">Post Options</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPinned"
                checked={postData.isPinned}
                onCheckedChange={(checked) => setPostData({ ...postData, isPinned: checked })}
              />
              <Label htmlFor="isPinned" className="flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pin this post
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={postData.expiresAt}
                onChange={(e) => setPostData({ ...postData, expiresAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Post will be automatically hidden after this date
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              {createPostMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}

export default ModeratorPostCreator;