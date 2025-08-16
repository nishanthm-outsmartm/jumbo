import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Clock,
  User,
  Eye,
  MessageCircle,
  Share2,
  TrendingUp,
  Calendar,
  Target,
  Award,
  ArrowRight,
  Coins,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrls: string[] | null;
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
}

interface Brand {
  id: string;
  name: string;
  country: string;
  isIndian: boolean;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  targetCategory: string;
  pointsReward: number;
  startDate: string;
  endDate: string;
  status: string;
  impact: string;
  fromBrands?: Brand[];
  toBrands?: Brand[];
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="mb-6 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
              {article.title}
            </h2>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              {/* <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Admin</span>
              </div> */}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(article.publishedAt))} ago
                </span>
              </div>
              {/* {article.commentsEnabled && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments enabled</span>
                </div>
              )} */}
            </div>

            {/* <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                News Article
              </Badge>
              {article.isPublished && (
                <Badge variant="outline" className="text-xs text-green-600">
                  Published
                </Badge>
              )}
            </div> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 line-clamp-3">{article.description}</p>

        {/* Brand Switching Information */}
        {((article.fromBrands && article.fromBrands.length > 0) ||
          (article.toBrands && article.toBrands.length > 0)) && (
          <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              {article.fromBrands && article.fromBrands.length > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-red-600 font-medium mb-1">
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
                  <ArrowRight className="text-gray-400 mx-2" size={16} />
                )}

              {article.toBrands && article.toBrands.length > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-green-600 font-medium mb-1">
                    Switch To:
                  </span>
                  <div className="flex flex-wrap gap-1">
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

        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {article.commentsEnabled && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Comments
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}

function TrendingTopics() {
  const trendingTags = [
    "Indian Brands",
    "Consumer Electronics",
    "Fashion",
    "Food & Beverages",
    "Automotive",
    "Personal Care",
    "Home & Garden",
    "Technology",
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Trending Topics
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="hover:bg-blue-100 cursor-pointer transition-colors"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OngoingMissions() {
  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["/api/missions/ongoing"],
    queryFn: () => fetch("/api/missions/ongoing").then((res) => res.json()),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Ongoing Missions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Ongoing Missions
        </h3>
      </CardHeader>
      <CardContent>
        {missions.length === 0 ? (
          <p className="text-gray-500 text-sm">No active missions available</p>
        ) : (
          <div className="space-y-4">
            {missions.slice(0, 3).map((mission: Mission) => (
              <div
                key={mission.id}
                className="border-l-4 border-blue-500 pl-4 pb-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{mission.title}</h4>
                  <Badge
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Coins className="w-3 h-3" />
                    {mission.pointsReward}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {mission.description}
                </p>

                {/* Mission Brand Information */}

                {((mission.fromBrands && mission.fromBrands.length > 0) ||
                  (mission.toBrands && mission.toBrands.length > 0)) && (
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    {mission.fromBrands && mission.fromBrands.length > 0 && (
                      <div className="mb-1">
                        <span className="font-medium text-red-600">From: </span>
                        <span>
                          {mission.fromBrands.map((b) => b.name).join(", ")}
                        </span>
                      </div>
                    )}
                    {mission.toBrands && mission.toBrands.length > 0 && (
                      <div>
                        <span className="font-medium text-green-600">To: </span>
                        <span>
                          {mission.toBrands
                            .map((b) => `${b.name} 🇮🇳`)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {mission.impact} Impact
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Ends {formatDistanceToNow(new Date(mission.endDate))} from
                    now
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500" />
          Recent Activity
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>12 new articles published today</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Updated guidelines for Indian brands</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Featured: Top 10 Indian alternatives</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function News() {
  const {
    data: articles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      const data = await res.json();
      // Ensure data is always an array
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">News & Articles</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">News & Articles</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              Failed to load news articles. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News & Articles</h1>
        <p className="text-gray-600">
          Stay updated with the latest news about Indian brands, consumer
          switches, and market trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  No articles available
                </h3>
                <p className="text-gray-500">
                  Check back later for the latest news and articles about Indian
                  brands and consumer switching.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {articles.map((article: NewsArticle) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <OngoingMissions />
          <TrendingTopics />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
