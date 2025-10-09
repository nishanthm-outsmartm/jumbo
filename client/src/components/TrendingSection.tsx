import { TrendingUp, Package, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const categoryColors = {
  'Food & Beverages': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Electronics': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Fashion & Apparel': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Home & Garden': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Health & Beauty': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Automotive': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'Sports & Fitness': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
};

interface TrendingSectionProps {
  className?: string;
}

export function TrendingSection({ className }: TrendingSectionProps) {
  const { data: trendingBrands = [] } = useQuery({
    queryKey: ['/api/brands/trending']
  });

  const { data: trendingCategories = [] } = useQuery({
    queryKey: ['/api/categories/trending']
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trending Categories */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Trending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {trendingCategories.slice(0, 6).map((category: any, index: number) => (
              <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900">
                    <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                  </div>
                  <div>
                    <Badge 
                      variant="secondary" 
                      className={categoryColors[category.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}
                    >
                      {category.category}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {category.recentSwitches} switches in 24h
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{category.switchCount}</div>
                  <div className="text-xs text-muted-foreground">this week</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Brands */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Popular Indian Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {trendingBrands.slice(0, 5).map((brand: any, index: number) => (
              <div key={brand.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                  <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{brand.name}</div>
                  {brand.logoUrl && (
                    <div className="w-6 h-6 bg-gray-200 rounded mt-1"></div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {brand.switchesToCount}
                  </div>
                  <div className="text-xs text-muted-foreground">switches</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Highlights */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Weekly Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-950 dark:to-green-950 border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                Most Active Category
              </div>
              <div className="font-semibold">Food & Beverages</div>
              <div className="text-sm text-muted-foreground">847 switches this week</div>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Package className="w-4 h-4" />
                Rising Brand
              </div>
              <div className="font-semibold">Patanjali</div>
              <div className="text-sm text-muted-foreground">+156% growth in switches</div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                Community Growth
              </div>
              <div className="font-semibold">1,247 new members</div>
              <div className="text-sm text-muted-foreground">joined this week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}