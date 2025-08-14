import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Send,
  User,
  Clock,
  Paperclip,
  Reply,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface Message {
  id: string;
  fromUserId: string | null;
  toUserId: string | null;
  subject: string;
  content: string;
  isRead: boolean | null;
  attachmentUrls: string[] | null;
  replyToId: string | null;
  createdAt: Date | null;
}

interface MessagingSystemProps {
  userId?: string;
}

export function MessagingSystem({ userId }: MessagingSystemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessageData, setNewMessageData] = useState({
    toUserId: userId || "",
    subject: "",
    content: "",
    replyToId: null as string | null,
  });

  // Fetch messages for the current user
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", user?.id],
    queryFn: () => apiRequest(`/api/messages/${user?.id}`),
    enabled: !!user?.id,
  });

  // Fetch unread messages count
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["/api/messages", user?.id, "unread"],
    queryFn: () => apiRequest({ url: `/api/messages/${user?.id}/unread` }),
    enabled: !!user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) =>
      apiRequest("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessageData({
        toUserId: userId || "",
        subject: "",
        content: "",
        replyToId: null,
      });
      setShowNewMessage(false);
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) =>
      apiRequest(`/api/messages/${messageId}/read`, {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessageData.subject || !newMessageData.content) return;

    const messagePayload = {
      ...newMessageData,
      fromUserId: user?.id,
      toUserId: newMessageData.toUserId || userId,
    };

    sendMessageMutation.mutate(messagePayload);
  };

  const handleReply = (message: Message) => {
    setNewMessageData({
      toUserId: message.fromUserId || "",
      subject: `Re: ${message.subject}`,
      content: "",
      replyToId: message.id,
    });
    setShowNewMessage(true);
  };

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead && message.toUserId === user?.id) {
      markAsReadMutation.mutate(message.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with unread count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Messages</h3>
          {unreadMessages.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadMessages.length} unread
            </Badge>
          )}
        </div>

        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="messageSubject">Subject</Label>
                <Input
                  id="messageSubject"
                  value={newMessageData.subject}
                  onChange={(e) =>
                    setNewMessageData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label htmlFor="messageContent">Message</Label>
                <Textarea
                  id="messageContent"
                  value={newMessageData.content}
                  onChange={(e) =>
                    setNewMessageData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Type your message here..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewMessage(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={
                  !newMessageData.subject ||
                  !newMessageData.content ||
                  sendMessageMutation.isPending
                }
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {messages.map((message: Message) => (
            <Card
              key={message.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                !message.isRead && message.toUserId === user?.id
                  ? "ring-2 ring-blue-200"
                  : ""
              }`}
              onClick={() => handleOpenMessage(message)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {message.fromUserId === user?.id ? "You" : "Member"}
                      </span>
                      {!message.isRead && message.toUserId === user?.id && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">
                      {message.subject}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {message.createdAt &&
                        format(new Date(message.createdAt), "MMM dd, HH:mm")}
                    </div>
                    {message.attachmentUrls &&
                      message.attachmentUrls.length > 0 && (
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {selectedMessage?.subject}
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  From:{" "}
                  {selectedMessage.fromUserId === user?.id ? "You" : "Member"}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedMessage.createdAt &&
                    format(
                      new Date(selectedMessage.createdAt),
                      "MMM dd, yyyy HH:mm"
                    )}
                </div>
              </div>

              <Separator />

              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              {selectedMessage.attachmentUrls &&
                selectedMessage.attachmentUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attachments
                    </h4>
                    <div className="space-y-2">
                      {selectedMessage.attachmentUrls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block"
                        >
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
            {selectedMessage && selectedMessage.fromUserId !== user?.id && (
              <Button onClick={() => handleReply(selectedMessage)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
