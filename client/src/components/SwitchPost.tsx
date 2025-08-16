import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, ArrowRight, Coins } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface SwitchPostProps {
  post: {
    post: {
      id: string;
      content: string;
      likesCount: number;
      commentsCount: number;
      sharesCount: number;
      createdAt: string;
    };
    user: {
      id: string;
      handle: string;
      level: number;
      points: number;
    };
    switchLog: {
      reason: string;
      points: number;
    };
    fromBrand: {
      name: string;
      country: string;
      isIndian: boolean;
    };
    toBrand: {
      name: string;
      country: string;
      isIndian: boolean;
    };
  };
}

export function SwitchPost({ post }: SwitchPostProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/posts/${post.post.id}/like`, {
        userId: user?.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    }
  });

  const handleLike = () => {
    if (user) {
      likeMutation.mutate();
    }
  };

  const userHandle = post.user.handle || 'Anonymous';
  const userInitials = userHandle.substring(0, 2).toUpperCase();
  const gradientClass = `bg-gradient-to-r from-${['blue', 'green', 'purple', 'pink', 'indigo'][userHandle.charCodeAt(0) % 5]}-500 to-${['purple', 'blue', 'pink', 'indigo', 'green'][userHandle.charCodeAt(1) % 5]}-500`;

  return (
    <Card className="bg-white shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${gradientClass} p-2 rounded-full`}>
              <span className="text-white font-bold text-sm">{userInitials}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{userHandle}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.post.createdAt))} ago • Level {post.user.level}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.user.level >= 5 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <i className="fas fa-star mr-1" />
                Top Switcher
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-800 mb-3">{post.post.content}</p>
          
          {/* Switch Details */}
          {post.fromBrand && post.toBrand && (
            <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-red-500 mb-2">
                    <i className="fas fa-arrow-left text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">From</p>
                  <p className="font-bold text-gray-900">{post.fromBrand.name}</p>
                  <p className="text-xs text-gray-500">
                    {post.fromBrand.country} {!post.fromBrand.isIndian && '🌍'}
                  </p>
                </div>
                <div className="flex-1 flex justify-center">
                  <ArrowRight className="text-2xl text-orange-500" />
                </div>
                <div className="text-center">
                  <div className="text-green-600 mb-2">
                    <i className="fas fa-arrow-right text-xl" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">To</p>
                  <p className="font-bold text-gray-900">{post.toBrand.name}</p>
                  <p className="text-xs text-gray-500">
                    {post.toBrand.country} {post.toBrand.isIndian && '🇮🇳'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sample product images */}
        <img 
          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
          alt="Product comparison" 
          className="w-full h-64 object-cover rounded-lg mb-4" 
        />

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                liked ? 'text-orange-500' : 'text-gray-500'
              } hover:text-orange-500 transition-colors`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.post.likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.post.commentsCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium">{post.post.sharesCount}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">+{post.switchLog?.points || 25} XP</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <Coins className="h-3 w-3 mr-1" />
              Rewarded
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
