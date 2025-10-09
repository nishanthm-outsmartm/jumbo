import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Loader2,
  AlertTriangle,
  Users,
  UserCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewsComment {
  id: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    id: string;
    handle: string;
    userType: "ANONYMOUS" | "REGISTERED";
  };
}

interface NewsEngagementProps {
  newsId: string;
  initialLikes?: number;
  initialShares?: number;
  initialComments?: number;
}

export function NewsEngagement({
  newsId,
  initialLikes = 0,
  initialShares = 0,
  initialComments = 0,
}: NewsEngagementProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [shares, setShares] = useState(initialShares);
  const [comments, setComments] = useState(initialComments);
  const [commentsList, setCommentsList] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [userShared, setUserShared] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, newsId]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/news/${newsId}/comments`);
      const data = await response.json();
      setCommentsList(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like news articles.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserLiked(data.liked);
        setLikes((prev) => (data.liked ? prev + 1 : prev - 1));
      } else {
        throw new Error("Failed to toggle like");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to share news articles.",
        variant: "destructive",
      });
      return;
    }

    if (userShared) {
      toast({
        title: "Already shared",
        description: "You have already shared this article.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, platform }),
      });

      if (response.ok) {
        setShares((prev) => prev + 1);
        setUserShared(true);
        toast({
          title: "Shared!",
          description: "Thank you for sharing this article.",
        });
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setUserShared(true);
          toast({
            title: "Already shared",
            description: "You have already shared this article.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.error || "Failed to share");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to comment on news articles.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: newComment.trim() }),
      });

      if (response.ok) {
        setNewComment("");
        setComments((prev) => prev + 1);
        toast({
          title: "Comment submitted",
          description: "Your comment is pending moderation.",
        });
        if (showComments) {
          fetchComments();
        }
      } else {
        throw new Error("Failed to submit comment");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (userType: string) => {
    return userType === "REGISTERED" ? (
      <UserCheck className="h-3 w-3 text-green-500" />
    ) : (
      <Users className="h-3 w-3 text-blue-500" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Engagement Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 ${
            userLiked ? "text-red-500" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${userLiked ? "fill-current" : ""}`} />
          {likes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {comments}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare()}
          disabled={loading || userShared}
          className={`flex items-center gap-2 ${
            userShared ? "text-green-500" : ""
          }`}
        >
          <Share2 className={`h-4 w-4 ${userShared ? "fill-current" : ""}`} />
          {shares}
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Comment Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts on this article..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loading}
                rows={3}
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Do not share personal info.</strong> Comments may be
                  moderated.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleComment}
                disabled={loading || !newComment.trim()}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                commentsList.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-3 border rounded-lg"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {comment.user.handle.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user.handle}
                        </span>
                        {getUserTypeIcon(comment.user.userType)}
                        <Badge
                          variant={
                            comment.user.userType === "REGISTERED"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {comment.user.userType === "REGISTERED"
                            ? "Registered"
                            : "Anonymous"}
                        </Badge>
                      </div>

                      <p className="text-sm">{comment.content}</p>

                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {commentsList.length === 0 && !commentsLoading && (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
