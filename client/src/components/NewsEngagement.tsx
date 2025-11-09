import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ShareDialog } from "./ShareDialog";
import { getOrCreateGuestSessionId } from "@/lib/guestSession";

interface NewsComment {
  id: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  guestName?: string | null;
  user?: {
    id: string;
    handle: string;
    userType: "ANONYMOUS" | "REGISTERED";
  } | null;
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
  const [guestSessionId, setGuestSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return getOrCreateGuestSessionId();
  });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) {
      setGuestSessionId((current) => {
        if (current) return current;
        if (typeof window === "undefined") return null;
        return getOrCreateGuestSessionId();
      });
    } else {
      setGuestSessionId(null);
    }
  }, [user]);

  // Fetch current engagement data
  const fetchEngagementData = async () => {
    try {
      const headers: Record<string, string> = {};
      if (user?.id) {
        headers["x-user-id"] = user.id;
      } else if (guestSessionId) {
        headers["x-guest-session"] = guestSessionId;
      }

      const response = await fetch(`/api/news/${newsSlug}/engagement`, {
        headers,
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
  }, [newsId, user, guestSessionId]);

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

  const getIdentityPayload = () => {
    if (user?.id) {
      return { userId: user.id };
    }
    if (guestSessionId) {
      return { guestSessionId };
    }
    return null;
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    const identity = getIdentityPayload();
    if (!identity) {
      toast({
        title: "Hold on",
        description: "We couldn't determine your session. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsSlug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...identity, voteType }),
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

  const handleComment = async () => {
    const identity = getIdentityPayload();
    if (!identity) {
      toast({
        title: "Hold on",
        description: "We couldn't determine your session. Please refresh and try again.",
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
        body: JSON.stringify({ ...identity, content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewComment("");
        setComments((prev) => (typeof data.commentsCount === "number" ? data.commentsCount : prev + 1));
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

  const identityReady = !!user?.id || !!guestSessionId;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("upvote")}
          disabled={loading || !identityReady}
          className={`flex items-center gap-2 ${userVote === "upvote" ? "text-green-500" : ""}`}
        >
          <ThumbsUp className={`h-4 w-4 ${userVote === "upvote" ? "fill-current" : ""}`} />
          {upvotes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("downvote")}
          disabled={loading || !identityReady}
          className={`flex items-center gap-2 ${userVote === "downvote" ? "text-red-500" : ""}`}
        >
          <ThumbsDown className={`h-4 w-4 ${userVote === "downvote" ? "fill-current" : ""}`} />
          {downvotes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {showComments ? "Hide" : "Comments"} ({comments})
        </Button>

        <ShareDialog
          newsId={newsId}
          newsSlug={newsSlug}
          title={title}
          userId={user?.id}
          guestSessionId={!user ? guestSessionId ?? undefined : undefined}
          onShare={() => {
            setUserShared(true);
            setShares((prev) => prev + 1);
            toast({
              title: "Thanks for sharing!",
              description: "Every share helps more people stay informed.",
            });
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={userShared || !identityReady}
            className={`flex items-center gap-2 ${userShared ? "text-emerald-500" : ""}`}
          >
            <Share2 className="h-4 w-4" />
            {userShared ? "Shared" : "Share"} ({shares})
          </Button>
        </ShareDialog>
      </div>

      {showComments && (
        <Card className="border border-slate-200">
          <CardContent className="space-y-4">
            {commentsEnabled ? (
              <>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your perspective..."
                  className="min-h-[80px]"
                  disabled={loading || !identityReady}
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Comments are reviewed before going live.</span>
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={
                      loading ||
                      !identityReady ||
                      !newComment.trim()
                    }
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    {loading ? "Sending" : "Post comment"}
                  </Button>
                </div>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  Comments are turned off for this article right now.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {commentsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading comments…
                </div>
              ) : commentsList.length === 0 ? (
                <p className="text-sm text-slate-500">Be the first to comment.</p>
              ) : (
                commentsList.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-slate-900">
                        {comment.user?.handle || comment.guestName || "Guest"}
                      </span>
                      <Badge variant={comment.user?.userType === "REGISTERED" ? "secondary" : "outline"}>
                        {comment.user?.userType === "REGISTERED" ? "Member" : "Guest"}
                      </Badge>
                      {comment.status !== "APPROVED" && (
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          Pending review
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-slate-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
