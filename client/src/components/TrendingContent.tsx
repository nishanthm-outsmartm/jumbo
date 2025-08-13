import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, IndianRupee, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingContent() {
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['/api/trending'],
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mockTrendingAlternatives = [
    {
      name: 'OnePlus Phones',
      alternative: 'Alternative to iPhone',
      switches: 15,
      progress: 80,
      color: 'bg-green-600'
    },
    {
      name: 'MTR Foods',
      alternative: 'Alternative to Maggi',
      switches: 12,
      progress: 65,
      color: 'bg-green-600'
    },
    {
      name: 'FabIndia',
      alternative: 'Alternative to Zara',
      switches: 8,
      progress: 45,
      color: 'bg-green-600'
    }
  ];

  const mockCommunityStats = [
    { label: 'Total Switches', value: '2,847', color: 'text-orange-500', bg: 'from-orange-50 to-yellow-50' },
    { label: 'Money Redirected', value: '₹45.2L', color: 'text-green-600', bg: 'from-green-50 to-orange-50' },
    { label: 'Active Members', value: '1,234', color: 'text-blue-900', bg: 'from-blue-50 to-green-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Trending Alternatives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <TrendingUp className="text-orange-500 mr-2 h-5 w-5" />
            Trending Alternatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTrendingAlternatives.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.alternative}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +{item.switches}
                  </Badge>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Impact Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Users className="text-green-600 mr-2 h-5 w-5" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {mockCommunityStats.map((stat, index) => (
              <div key={index} className={`text-center p-4 bg-gradient-to-r ${stat.bg} rounded-lg`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
