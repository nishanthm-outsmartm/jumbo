import React from 'react'
import { SocialFeed } from '@/components/SocialFeed'
import { EnhancedLeaderboard } from '@/components/EnhancedLeaderboard'
import { TrendingSection } from '@/components/TrendingSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Zap, 
  Target, 
  ArrowUpRight,
  Star
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'wouter'

export default function EnhancedHome() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="text-center py-8 px-6 bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to JumboJolt!
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Join India's largest community switching to quality Indian products
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Users className="w-4 h-4 mr-2" />
                25,847 Members
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <TrendingUp className="w-4 h-4 mr-2" />
                156,392 Switches
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Target className="w-4 h-4 mr-2" />
                ₹2.1Cr Saved
              </Badge>
            </div>
            {!user && (
              <div className="mt-6">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold">
                    Join the Movement
                    <ArrowUpRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Today's Switches</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">147</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Members</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">1,247</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Top Streak</p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">42 days</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Feed Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  Community Feed
                </CardTitle>
                <p className="text-muted-foreground">
                  See what fellow Indians are switching to today
                </p>
              </CardHeader>
              <CardContent>
                <SocialFeed />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Leaderboard */}
            <EnhancedLeaderboard />
            
            {/* Trending Section */}
            <TrendingSection />

            {/* Call to Action */}
            {user && (
              <Card className="bg-gradient-to-r from-orange-500 to-green-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-lg font-bold mb-2">Ready for Your Next Switch?</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Log a new product switch and earn points towards your next level!
                  </p>
                  <Link href="/log-switch">
                    <Button className="bg-white text-orange-600 hover:bg-gray-100 font-semibold w-full">
                      Log New Switch
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Community Goals */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Community Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Target: 10,000 switches</span>
                    <span className="font-medium">7,542 / 10,000</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full" style={{width: '75.42%'}}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Next milestone:</div>
                  <div className="text-sm font-medium">🎯 Reach 8,000 switches to unlock community rewards!</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}