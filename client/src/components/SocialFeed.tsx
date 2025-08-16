import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SwitchPost } from "./SwitchPost";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export function SocialFeed() {
  const { user } = useAuth();
  const { data: feedData, isLoading } = useQuery({
    queryKey: ["/api/feed"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-32 w-full mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const posts = feedData?.posts || [];

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <i className="fas fa-comments text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon...
              </h3>
              <p>The social feed is not available at the moment.</p>
              {/* <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p>Be the first to share a product switch!</p> */}
            </div>
          </CardContent>
        </Card>
      ) : (
        posts.map((post: any) => <SwitchPost key={post.post.id} post={post} />)
      )}
    </div>
  );
}
