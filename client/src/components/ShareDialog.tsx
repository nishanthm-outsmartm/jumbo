import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  newsId: string;
  newsSlug: string;
  title: string;
  url?: string;
  children: React.ReactNode;
  onShare?: () => void;
  userId?: string;
  guestSessionId?: string;
}

export function ShareDialog({
  newsId,
  newsSlug,
  title,
  url,
  children,
  onShare,
  userId,
  guestSessionId,
}: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canShare = Boolean(userId || guestSessionId);
  
  const shareUrl =
    url ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/news/${newsSlug}`
      : `/news/${newsSlug}`);
  const shareText = `Check out this news: ${title}`;

  const recordShare = async (platform: string) => {
    const response = await fetch(`/api/news/${newsSlug}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, guestSessionId, platform }),
    });
    if (response.ok) {
      const result = await response.json();
      if (result.share && result.isNewShare !== false) {
        onShare?.();
      }
    }
  };

  const ensureSession = () => {
    if (!canShare) {
      toast({
        title: "Action unavailable",
        description: "We couldn't link this share to a session. Please refresh and try again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleCopyUrl = async () => {
    if (!ensureSession()) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "URL copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);

      try {
        await recordShare("copy");
      } catch (error) {
        console.error("Failed to record share:", error);
      }
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = async (platform: string) => {
    if (!ensureSession()) return;

    let targetUrl = "";
    
    switch (platform) {
      case "facebook":
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        targetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "linkedin":
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "email":
        targetUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + " " + shareUrl)}`;
        break;
    }
    
    if (targetUrl) {
      try {
        await recordShare(platform);
      } catch (error) {
        console.error("Failed to record share:", error);
      }
      
      window.open(targetUrl, "_blank", "width=600,height=400");
    }
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => handleSocialShare("facebook"),
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      onClick: () => handleSocialShare("twitter"),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      onClick: () => handleSocialShare("linkedin"),
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      onClick: () => handleSocialShare("email"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Article
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy URL Section */}
          <div className="space-y-2">
            <Label htmlFor="share-url">Share URL</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.name}
                  onClick={platform.onClick}
                  className={`${platform.color} text-white flex items-center gap-2`}
                  variant="default"
                >
                  <platform.icon className="w-4 h-4" />
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Article Preview */}
          <Card>
            <CardContent className="p-3">
              <div className="text-sm">
                <p className="font-medium text-gray-900 line-clamp-2">
                  {title}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {shareUrl}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
