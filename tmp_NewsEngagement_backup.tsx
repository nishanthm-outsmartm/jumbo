import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Send,
  Loader2,
  AlertTriangle,
  Users,
  UserCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ShareDialog } from "./ShareDialog";

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
  newsSlug: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialShares?: number;
  initialComments?: number;
  title?: string;
}

export function NewsEngagement({
  newsId,
  newsSlug,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialShares = 0,
  initialComments = 0,
  title = "",
}: NewsEngagementProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [shares, setShares] = useState(initialShares);
  const [comments, setComments] = useState(initialComments);
  const [commentsList, setCommentsList] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [userShared, setUserShared] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch current engagement data
  const fetchEngagementData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/news/${newsSlug}/engagement`, {
        headers: {
          'x-user-id': user.id,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUpvotes(data.upvotesCount || 0);
        setDownvotes(data.downvotesCount || 0);
        setShares(data.sharesCount || 0);
        setComments(data.commentsCount || 0);
        setUserVote(data.userVote);
        setUserShared(data.userShared);
        setCommentsEnabled(data.commentsEnabled);
      }
    } catch (error) {
      console.error("Failed to fetch engagement data:", error);
    }
  };

  // Fetch engagement data on component mount
  useEffect(() => {
    fetchEngagementData();
  }, [newsId, user]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host || "localhost:3006";
    const wsUrl = `${protocol}//${host}/ws`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected for news engagement");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "update" && data.data.newsId === newsId) {
              // Update counts in real-time
              if (data.data.type === "vote") {
                setUpvotes(data.data.upvotesCount);
                setDownvotes(data.data.downvotesCount);
              } else if (data.data.type === "share") {
                setShares(data.data.sharesCount);
              } else if (data.data.type === "comment") {
                setComments(data.data.commentsCount);
                if (showComments) {
                  fetchComments();
                }
              }
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected for news engagement");
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [newsId, showComments]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, newsId]);

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/news/${newsSlug}/comments`);
      const data = await response.json();
      setCommentsList(data.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Please connect your account",
        description: "You need to connect your account to vote on news articles.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsSlug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserVote(data.voteType);
        setUpvotes(data.upvotesCount);
        setDownvotes(data.downvotesCount);
      } else {
        throw new Error("Failed to vote");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to vote on article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!user) {
      toast({
        title: "Please connect your account",
        description: "You need to connect your account to share news articles.",
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
      const response = await fetch(`/api/news/${newsSlug}/share`, {
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
        title: "Please connect your account",
        description: "You need to connect your account to comment on news articles.",
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
      const response = await fetch(`/api/news/${newsSlug}/comments`, {
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('upvote')}
            disabled={loading}
            className={`flex items-center gap-2 ${
              userVote === 'upvote' ? "text-green-500" : ""
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${userVote === 'upvote' ? "fill-current" : ""}`} />
            {upvotes}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('downvote')}
            disabled={loading}
            className={`flex items-center gap-2 ${
              userVote === 'downvote' ? "text-red-500" : ""
            }`}
          >
            <ThumbsDown className={`h-4 w-4 ${userVote === 'downvote' ? "fill-current" : ""}`} />
            {downvotes}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {comments}
        </Button>

        <ShareDialog 
          newsId={newsId}
          newsSlug={newsSlug}
          title={title}
          userId={user?.id}
          onShare={() => {
            setShares(prev => prev + 1);
            setUserShared(true);
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            className={`flex items-center gap-2 ${
              userShared ? "text-green-500" : ""
            }`}
          >
            <Share2 className={`h-4 w-4 ${userShared ? "fill-current" : ""}`} />
            {shares}
          </Button>
        </ShareDialog>
      </div>

      {/* Comments Section */}
      {showComments && !commentsEnabled && (
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Comments are disabled for this article.</p>
          </CardContent>
        </Card>
      )}

      {showComments && commentsEnabled && (
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
                        {/* {getUserTypeIcon(comment.user.userType)}
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
                        <Badge
                          variant={
                            comment.status === "APPROVED"
                              ? "default"
                              : comment.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {comment.status}
                        </Badge> */}
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

