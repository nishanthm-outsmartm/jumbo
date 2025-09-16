"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Added for message field
import { MessageSquare } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast"; // Assuming shadcn/ui toast for feedback; adjust if using different notification system
import { useAuth } from "@/context/AuthContext";

interface FeedbackSwitchDialogProps {
  open: boolean;
  onClose: () => void;
  // Added to pass userId for feedback submission
}

interface FeedbackData {
  fromBrands: string;
  toBrands: string;
  url: string;
  message: string;
  userId: string;
}

// API function to submit feedback
const submitFeedback = async (data: FeedbackData) => {
  const response = await fetch("/api/feedbacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit feedback");
  }
  return response.json();
};

export default function FeedbackSwitchDialog({
  open,
  onClose,
}: FeedbackSwitchDialogProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] }); // Refresh feedback list if used elsewhere
      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
      });
      setFrom("");
      setTo("");
      setUrl("");
      setMessage("");
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!user) return;
    const userId = user.id;
    if (!from || !to || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (From, To, Message).",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({
      fromBrands: from,
      toBrands: to,
      url,
      message,
      userId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="p-4">
          <DialogTitle>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-base font-semibold">
                <MessageSquare className="text-emerald-600" /> Help the
                community decide
              </h4>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                1 min
              </span>
            </div>
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Suggest products we should **switch from** and **switch to**. Your
            tips become missions.
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Switch From (Brand Name)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          />
          <Input
            placeholder="Switch To (Brand Name)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
          <Input
            placeholder="Evidence URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Textarea
            placeholder="Your feedback message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
