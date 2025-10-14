import { useState } from 'react';
import { Heart, Flame, Star, ThumbsUp, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const reactionTypes = [
  { type: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
  { type: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
  { type: 'fire', icon: Flame, label: 'Fire', color: 'text-orange-500' },
  { type: 'star', icon: Star, label: 'Star', color: 'text-yellow-500' },
  { type: 'celebrate', icon: Smile, label: 'Celebrate', color: 'text-green-500' }
];

interface ReactionBarProps {
  postId: string;
  className?: string;
}

export function ReactionBar({ postId, className }: ReactionBarProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReactions, setShowReactions] = useState(false);

  // Get reaction counts for this post
  const { data: reactions = [] } = useQuery({
    queryKey: ['/api/posts', postId, 'reactions'],
    enabled: !!postId
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      if (!user) throw new Error('Not authenticated');
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId: user.uid })
      });
      if (!response.ok) throw new Error('Failed to add reaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'reactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });

  const handleReaction = (type: string) => {
    if (!user) return;
    addReactionMutation.mutate({ type });
    setShowReactions(false);
  };

  const getTotalReactions = () => {
    return reactions.reduce((total: number, r: any) => total + r.count, 0);
  };

  const getTopReaction = () => {
    if (reactions.length === 0) return null;
    return reactions.reduce((top: any, current: any) => 
      current.count > (top?.count || 0) ? current : top
    );
  };

  const topReaction = getTopReaction();
  const TopIcon = topReaction ? reactionTypes.find(r => r.type === topReaction.type)?.icon : ThumbsUp;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReactions(!showReactions)}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          disabled={!user}
        >
          {TopIcon && <TopIcon className="w-4 h-4 mr-1" />}
          <span className="text-sm">{getTotalReactions()}</span>
        </Button>

        {showReactions && user && (
          <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-lg shadow-lg p-2 flex gap-1 z-10">
            {reactionTypes.map(({ type, icon: Icon, label, color }) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(type)}
                className={cn("h-10 w-10 p-0 hover:bg-muted", color)}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {reactions.length > 0 && (
        <div className="flex gap-1 text-xs text-muted-foreground">
          {reactions.slice(0, 3).map((reaction: any) => {
            const reactionType = reactionTypes.find(r => r.type === reaction.type);
            if (!reactionType) return null;
            const Icon = reactionType.icon;
            return (
              <div key={reaction.type} className="flex items-center gap-1">
                <Icon className={cn("w-3 h-3", reactionType.color)} />
                <span>{reaction.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}