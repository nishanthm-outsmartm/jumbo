import React, { useEffect, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Target,
  Zap,
  ArrowRight,
  ExternalLink,
  Clock,
  Flame,
  Shield,
  Award,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/landing/navbar";
import { AnonymousRegistration } from "@/components/auth/AnonymousRegistration";
import { QuickAnonymousJoin } from "@/components/auth/QuickAnonymousJoin";
import { useAuth } from "@/context/AuthContext";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrls: string[] | null;
  publishedAt: string;
  suggestedFromBrandIds: string[] | null;
  suggestedToBrandIds: string[] | null;
  fromBrands?: Brand[];
  toBrands?: Brand[];
}

interface Brand {
  id: string;
  name: string;
  country: string;
  isIndian: boolean;
}

function NewsCard({
  article,
  isPreview = true,
}: {
  article: NewsArticle;
  isPreview?: boolean;
}) {
  const hasSwitch =
    (article.fromBrands?.length || 0) > 0 ||
    (article.toBrands?.length || 0) > 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900">
              {article.title}
            </h3>

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(article.publishedAt))} ago
                </span>
              </div>
              {hasSwitch && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-orange-100 text-orange-700"
                >
                  <Target className="w-3 h-3 mr-1" />
                  Switch Mission
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 line-clamp-3 break-words overflow-hidden">
          {article.description}
        </p>

        {/* Brand Switching Information */}
        {hasSwitch && (
          <div className="bg-gradient-to-r from-red-50 to-green-50 border border-orange-200 rounded-lg p-3 mb-3">
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

              {article.fromBrands?.length && article.toBrands?.length && (
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
                        {brand.name} 🇮🇳
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-500">Act with Pride</span>
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Read More
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-green-600 text-white py-16 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6 items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Zap className="text-white h-12 w-12" />
          </div>
          <h1 className="text-3xl lg:text-6xl">JumboJolt</h1>
        </div>

        <h1 className="text-5xl font-bold mb-6">
          Every headline here is a reason to act.
        </h1>

        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join India's largest community switching to quality Indian products.
          Turn every piece of news into a choice that builds our nation.
        </p>

        <div className="flex justify-center gap-6 flex-wrap mb-8">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30 text-base px-4 py-2"
          >
            <Users className="w-5 h-5 mr-2" />
            <span className="animate-pulse">0 </span>&nbsp;Patriots
          </Badge>
          <Badge
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30 text-base px-4 py-2"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="animate-pulse">0 </span>&nbsp;Switches
          </Badge>
          <Badge
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30 text-base px-4 py-2"
          >
            <Target className="w-5 h-5 mr-2" />
            <span className="animate-pulse">₹0</span>&nbsp;Impact
          </Badge>
        </div>

        <p className="mb-4">
          Sign up or log in to access the full feed & weekly challenges — Switch
          with Pride
        </p>

        <div className="flex flex-col gap-6 justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button
                size="lg"
                className="relative overflow-hidden bg-white text-orange-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3"
              >
                <span className="relative z-10 flex items-center">
                  Login / Sign Up
                  <ArrowRight className="w-6 h-6 ml-2" />
                </span>

                {/* Shining effect */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine" />
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm opacity-80 mb-4">or try it out anonymously</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <QuickAnonymousJoin
                onSuccess={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              />
              <span className="text-sm opacity-60">or</span>
              <AnonymousRegistration
                onSuccess={() => window.location.reload()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionPrompt() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">
        <Shield className="w-8 h-8 text-orange-600" />
      </div>
      <h3 className="text-xl font-semibold text-orange-900 mb-2">
        This week's challenge inspired by the news:
      </h3>
      <p className="text-orange-800 mb-4">
        Switch to Indian-made headphones — see our top picks inside
      </p>
      <Link href="/login">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          See Recommendations
          <Award className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

export default function LandingPage() {
  useLayoutEffect(() => {
    document.title = "JumboJolt";
  }, []);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      const data = await res.json();
      return Array.isArray(data) ? data.slice(0, 6) : [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <HeroSection />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Headlines Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
            Latest Headlines That Matter
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Short, emotional, action-oriented news that connects to your choices
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article: NewsArticle) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <p>Loading the latest headlines...</p>
            </div>
          )}
        </div>

        {/* Conversion Prompt */}
        <ConversionPrompt />

        {/* Features Preview */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">
            What happens after you join?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Full News Feed</h3>
              <p className="text-gray-600 text-sm">
                Access all articles with switch suggestions and community
                insights
              </p>
            </div>

            <div className="p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Weekly Challenges</h3>
              <p className="text-gray-600 text-sm">
                Get personalized switch missions based on trending news
              </p>
            </div>

            <div className="p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Impact</h3>
              <p className="text-gray-600 text-sm">
                Share your switches and see the collective impact we're making
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
