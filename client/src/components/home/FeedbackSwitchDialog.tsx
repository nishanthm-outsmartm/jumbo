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
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FeedbackSwitchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FeedbackData {
  fromBrands: string;
  toBrands: string;
  category: string;
  url: string;
  message: string;
  userId: string;
}

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

const categories = [
  { value: "FOOD_BEVERAGES", label: "Food & Beverages" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "FASHION", label: "Fashion" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "HOME_GARDEN", label: "Home & Garden" },
  { value: "AUTOMOTIVE", label: "Automotive" },
  { value: "SPORTS", label: "Sports" },
  { value: "BOOKS_MEDIA", label: "Books & Media" },
  { value: "OTHER", label: "Other" },
];

export default function FeedbackSwitchDialog({
  open,
  onClose,
}: FeedbackSwitchDialogProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      toast({
        title: "Success",
        description: "Feedback submitted successfully!",
      });
      setFrom("");
      setTo("");
      setUrl("");
      setCategory("");
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
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    const userId = user.id;

    if (!from.trim()) {
      toast({
        title: "Error",
        description: "Please enter the brand you want to switch from.",
        variant: "destructive",
      });
      return;
    }

    if (!to.trim()) {
      toast({
        title: "Error",
        description: "Please enter the brand you want to switch to.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description:
          "Please provide your feedback message explaining why this switch is beneficial.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Please select a product category.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      fromBrands: from.trim(),
      toBrands: to.trim(),
      category,
      url: url.trim(),
      message: message.trim(),
      userId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="p-4">
          <DialogTitle>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-base font-semibold text-[#0b2238]">
                <MessageSquare className="text-[#0b2238]" /> Help the community decide
              </h4>
              <span className="rounded-full bg-[#0b2238]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0b2238]">
                1 min
              </span>
            </div>
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Suggest products we should <strong>switch from</strong> and{" "}
            <strong>switch to</strong>. Your tips become missions.
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

          <div>
            <Label>Product Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
              required
            >
              <SelectTrigger className="mt-1 border-[#0b2238]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Your feedback message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#0b2238] text-[#0b2238] hover:bg-[#091b2c]/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="bg-[#0b2238] hover:bg-[#091b2c] text-white"
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
