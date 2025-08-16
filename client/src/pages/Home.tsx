import React from "react";
import { SocialFeed } from "@/components/SocialFeed";
import { Leaderboard } from "@/components/Leaderboard";
import { UserStats } from "@/components/UserStats";
import { TrendingContent } from "@/components/TrendingContent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Flame, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const trendingCategories = [
    {
      name: "Food & Beverages",
      switches: 142,
      image:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Electronics",
      switches: 89,
      image:
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Fashion",
      switches: 67,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Beauty",
      switches: 45,
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3">
            <UserStats />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-xl p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.handle}!
              </h2>
              <p className="opacity-90">
                You're making a difference. See what others are switching to
                today.
              </p>
            </div>

            {/* Trending Categories */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Trending Categories
                  </h3>
                  <button className="text-orange-500 text-sm hover:text-blue-900 transition-colors">
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trendingCategories.map((category, index) => (
                    <div
                      key={index}
                      className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover"
                      />
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      {/* <p className="text-xs text-orange-500">
                        +{category.switches} switches
                      </p> */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Flame className="text-orange-500 mr-2 h-6 w-6" />
                    Trending Switches
                  </h2>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Today
                    </Button>
                    <Button size="sm" variant="outline">
                      Week
                    </Button>
                    <Button size="sm" variant="outline">
                      Month
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-orange-500 text-white rounded-full text-sm font-medium">
                    #PhoneSwitch
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #FoodChoice
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #ClothingBrand
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    #TechGadgets
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Social Feed */}
            <SocialFeed />

            {/* Load More */}
            {/* <div className="text-center mt-8">
              <Button variant="outline" className="hover:bg-gray-50">
                <i className="fas fa-refresh mr-2" />
                Load More Posts
              </Button>
            </div> */}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <Leaderboard />
            {/* <div className="mt-6">
              <TrendingContent />
            </div> */}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Link href="/log-switch">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all p-4"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
