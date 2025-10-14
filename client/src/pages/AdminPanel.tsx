import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import {
  Settings,
  Users,
  Target,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Redirect if not admin
  if (!user || user.role !== "ADMIN") {
    navigate("/");
    return null;
  }

  // Suggestions query
  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/admin/suggestions"],
  });

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/moderation/users"],
  });

  // Role update mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const response = await apiRequest(
        "PUT",
        `/api/moderation/users/${id}/role`,
        { role }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moderation/users"] });
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/suggestions/${id}`,
        updates
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/suggestions"] });
    },
  });

  const handleApproveSuggestion = (id: string) => {
    updateSuggestionMutation.mutate({
      id,
      updates: { status: "APPROVED" },
    });
  };

  const handleRejectSuggestion = (id: string) => {
    updateSuggestionMutation.mutate({
      id,
      updates: { status: "REJECTED" },
    });
  };

  const suggestions = suggestionsData?.suggestions || [];
  const users = (usersData as any[]) || [];

  const [userSearch, setUserSearch] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <Settings className="mr-3 h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage JumboJolt platform and community
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">1,234</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">2,847</p>
              <p className="text-sm text-gray-600">Total Switches</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-500">
                {suggestions.filter((s: any) => s.status === "PENDING").length}
              </p>
              <p className="text-sm text-gray-600">Pending Reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">₹45.2L</p>
              <p className="text-sm text-gray-600">Money Redirected</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">Target Suggestions</TabsTrigger>
            <TabsTrigger value="news">News Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Target Suggestions */}
          <TabsContent value="suggestions">
            <Card>
              <CardHeader>
                <CardTitle>Product Switch Target Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading suggestions...</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No suggestions to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((suggestion: any) => (
                      <div
                        key={suggestion.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {suggestion.fromBrandName} →{" "}
                              {suggestion.toBrandName || "Alternative needed"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Category: {suggestion.category} • Submitted{" "}
                              {new Date(
                                suggestion.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              suggestion.status === "PENDING"
                                ? "outline"
                                : suggestion.status === "APPROVED"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {suggestion.status}
                          </Badge>
                        </div>

                        {suggestion.rationale && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-700">
                              <strong>Rationale:</strong> {suggestion.rationale}
                            </p>
                          </div>
                        )}

                        {suggestion.status === "PENDING" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApproveSuggestion(suggestion.id)
                              }
                              disabled={updateSuggestionMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleRejectSuggestion(suggestion.id)
                              }
                              disabled={updateSuggestionMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Management */}
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>News Feed Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Add News Article
                    </h4>
                    <div className="space-y-4">
                      <Input placeholder="Article title" />
                      <Input placeholder="Source URL" />
                      <Textarea placeholder="AI-generated summary" rows={4} />
                      <div className="flex space-x-2">
                        <Button>Add to Review Queue</Button>
                        <Button variant="outline">Publish Immediately</Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Pending News Items
                    </h4>
                    <p className="text-gray-500">
                      No pending news items to review
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Input
                      placeholder="Search users by handle or ID..."
                      className="max-w-md"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading users...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Handle
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Role
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {users
                            .filter((u: any) => {
                              if (!userSearch) return true;
                              const search = userSearch.toLowerCase();
                              return (
                                (u.user.handle &&
                                  u.user.handle
                                    .toLowerCase()
                                    .includes(search)) ||
                                (u.user.email &&
                                  u.user.email
                                    .toLowerCase()
                                    .includes(search)) ||
                                (u.user.name &&
                                  u.user.name.toLowerCase().includes(search))
                              );
                            })
                            .map((u: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 font-medium text-gray-900">
                                  <div className="flex flex-col">
                                    <span>
                                      {u.user.handle || (
                                        <span className="text-gray-400">
                                          {u.user.handle}
                                        </span>
                                      )}
                                    </span>
                                    {u.user.name && (
                                      <span className="text-xs text-gray-500">
                                        {u.user.name}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-gray-700">
                                  {u.user.email || (
                                    <span className="text-gray-400">
                                      {u.user.email}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                                    {u.user.role}
                                  </span>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex space-x-2">
                                    {["MEMBER", "MODERATOR", "ADMIN"].map(
                                      (roleOption) => (
                                        <Button
                                          key={roleOption}
                                          size="sm"
                                          variant={
                                            u.user.role === roleOption
                                              ? "default"
                                              : "outline"
                                          }
                                          disabled={
                                            u.user.role === roleOption ||
                                            updateUserRoleMutation.isPending
                                          }
                                          onClick={() =>
                                            updateUserRoleMutation.mutate({
                                              id: u.user.id,
                                              role: roleOption,
                                            })
                                          }
                                        >
                                          {roleOption}
                                        </Button>
                                      )
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {users.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No users found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Switch Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Chart: Switch trends over time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Chart: Switches by category</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Chart: User registration over time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Map: Switches by Indian states
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
