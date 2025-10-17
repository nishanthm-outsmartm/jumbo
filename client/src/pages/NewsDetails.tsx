import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link, useRoute } from "wouter";
import { NewsEngagement } from "@/components/NewsEngagement";
import { ShareDialog } from "@/components/ShareDialog";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrls: string[] | null;
  source: string | null;
  suggestedFromBrandIds: string[] | null;
  suggestedToBrandIds: string[] | null;
  commentsEnabled: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  fromBrands?: Brand[];
  toBrands?: Brand[];
  upvotesCount?: number;
  downvotesCount?: number;
  sharesCount?: number;
  commentsCount?: number;
}

interface Brand {
  id: string;
  name: string;
  country: string;
  isIndian: boolean;
}

export default function NewsDetails() {
  const { user } = useAuth();
  const [, params] = useRoute("/news/:slug");
  const newsSlug = params?.slug;

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/news", newsSlug],
    queryFn: async () => {
      if (!newsSlug) throw new Error("News slug is required");
      const response = await fetch(`/api/news/${newsSlug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch news article");
      }
      return response.json();
    },
    enabled: !!newsSlug,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/news">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/news">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Article Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The news article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/news">
              <Button>Back to News</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/news">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </Link>
      </div>

      {/* Article Content */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Jumbo</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(article.publishedAt))} ago
                  </span>
                </div>
                {article.commentsEnabled && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Comments enabled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Article Images */}
          {article.imageUrls && article.imageUrls.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.imageUrls.map((imageUrl: string, index: number) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Article image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {article.description}
            </p>
          </div>

          {/* Brand Switching Information */}
          {((article.fromBrands && article.fromBrands.length > 0) ||
            (article.toBrands && article.toBrands.length > 0)) && (
            <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                {article.fromBrands && article.fromBrands.length > 0 && (
                  <div className="flex flex-col items-center min-w-[100px]">
                    <span className="text-red-600 font-medium mb-2">
                      Switch From:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {article.fromBrands.map((brand: Brand) => (
                        <Badge
                          key={brand.id}
                          variant="destructive"
                          className="text-xs"
                        >
                          {brand.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {article.fromBrands &&
                  article.fromBrands.length > 0 &&
                  article.toBrands &&
                  article.toBrands.length > 0 && (
                    <div className="text-gray-400 mx-4">→</div>
                  )}

                {article.toBrands && article.toBrands.length > 0 && (
                  <div className="flex flex-col items-center">
                    <span className="text-green-600 font-medium mb-2 min-w-[100px]">
                      Switch To:
                    </span>
                    <div className="flex flex-1 flex-wrap gap-2">
                      {article.toBrands.map((brand: Brand) => (
                        <Badge
                          key={brand.id}
                          variant="default"
                          className="text-xs bg-green-600"
                        >
                          {brand.name} {brand.isIndian ? "🇮🇳" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {article.source && (
            <div className="flex items-end justify-end gap-1 mb-6">
              <a
                href={article.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Source
                </Button>
              </a>
            </div>
          )}

          {/* News Engagement */}
          <div className="mt-6">
            {user ? (
              <NewsEngagement
                newsId={article.id}
                newsSlug={article.slug}
                title={article.title}
                initialUpvotes={article.upvotesCount || 0}
                initialDownvotes={article.downvotesCount || 0}
                initialShares={article.sharesCount || 0}
                initialComments={article.commentsCount || 0}
              />
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Login to engage with this news
                </p>
                <Link href="/login">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
