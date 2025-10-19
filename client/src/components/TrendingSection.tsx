import { TrendingUp, Package, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const categoryColors = {
  'Food & Beverages': 'bg-[#dbe9f4] text-[#0b2238] dark:bg-[#0d2b4f] dark:text-[#00a8cc]',
  'Electronics': 'bg-[#cce3f0] text-[#0b2238] dark:bg-[#0d2b4f] dark:text-[#00a8cc]',
  'Fashion & Apparel': 'bg-[#f4dbe9] text-[#0b2238] dark:bg-[#2b0d4f] dark:text-[#00a8cc]',
  'Home & Garden': 'bg-[#dbf4e9] text-[#0b2238] dark:bg-[#0d4f2b] dark:text-[#00a8cc]',
  'Health & Beauty': 'bg-[#ecdbe9] text-[#0b2238] dark:bg-[#4f0d4f] dark:text-[#00a8cc]',
  'Automotive': 'bg-[#e0e0e0] text-[#0b2238] dark:bg-[#1a1a1a] dark:text-[#00a8cc]',
  'Sports & Fitness': 'bg-[#f4dbdb] text-[#0b2238] dark:bg-[#4f0d0d] dark:text-[#00a8cc]',
  'Education': 'bg-[#dbdff4] text-[#0b2238] dark:bg-[#0d0d4f] dark:text-[#00a8cc]'
};

interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  switchesToCount?: number;
  switchCount?: number;
}

interface Category {
  category: string;
  recentSwitches?: number;
  switchCount?: number;
}

interface TrendingSectionProps {
  className?: string;
}
  
export function TrendingSection({ className }: TrendingSectionProps) {
  const { data: trendingBrands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands/trending']
  });
  const { data: trendingCategories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories/trending']
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trending Categories */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0b2238]" />
            Trending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {trendingCategories.slice(0, 6).map((category: any, index: number) => (
              <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#dbe9f4] dark:bg-[#0d2b4f]">
                    <span className="text-sm font-bold text-[#0b2238] dark:text-[#00a8cc]">#{index + 1}</span>
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
            <Package className="w-5 h-5 text-[#0b2238]" />
            Popular Indian Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {trendingBrands.slice(0, 5).map((brand: any, index: number) => (
              <div key={brand.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#cce3f0] dark:bg-[#0d2b4f]">
                  <span className="text-sm font-bold text-[#0b2238] dark:text-[#00a8cc]">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{brand.name}</div>
                  {brand.logoUrl && (
                    <div className="w-6 h-6 bg-gray-200 rounded mt-1"></div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#0b2238]" />
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
            <Star className="w-5 h-5 text-[#00a8cc]" />
            Weekly Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#dbe9f4] to-[#cce3f0] dark:from-[#0b2238] dark:to-[#0d2b4f] border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4 text-[#0b2238]" />
                Most Active Category
              </div>
              <div className="font-semibold text-[#0b2238] dark:text-[#00a8cc]">Food & Beverages</div>
              <div className="text-sm text-muted-foreground">847 switches this week</div>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#cce3f0] to-[#dbf4e9] dark:from-[#0b2238] dark:to-[#0d2b4f] border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Package className="w-4 h-4 text-[#0b2238]" />
                Rising Brand
              </div>
              <div className="font-semibold text-[#0b2238] dark:text-[#00a8cc]">Patanjali</div>
              <div className="text-sm text-muted-foreground">+156% growth in switches</div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-[#dbf4e9] to-[#cce3f0] dark:from-[#0b2238] dark:to-[#0d2b4f] border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="w-4 h-4 text-[#0b2238]" />
                Community Growth
              </div>
              <div className="font-semibold text-[#0b2238] dark:text-[#00a8cc]">1,247 new members</div>
              <div className="text-sm text-muted-foreground">joined this week</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
