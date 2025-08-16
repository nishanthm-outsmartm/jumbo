import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import {
  insertSwitchLogSchema,
  insertPostSchema,
  insertBrandSchema,
  insertCommentSchema,
  insertTargetSuggestionSchema,
  insertFeedbackQuestionSchema,
  insertMissionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firebaseUid, phone, email, handle, region } = req.body;

      // Check if handle is available
      const existingUser = await storage.getUserByHandle(handle);
      if (existingUser) {
        return res.status(400).json({ error: "Handle already taken" });
      }

      const user = await storage.createUser({
        firebaseUid,
        phone,
        email,

        handle,
        region,
      });

      res.json({
        user: {
          id: user.id,
          handle: user.handle,
          points: user.points,
          level: user.level,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/register/moderator", async (req, res) => {
    try {
      const { firebaseUid, phone, email, handle, region } = req.body;

      // Check if handle is available
      const existingUser = await storage.getUserByHandle(handle);
      if (existingUser) {
        return res.status(400).json({ error: "Handle already taken" });
      }

      const user = await storage.createUser({
        firebaseUid,
        phone,
        email,
        role: "MODERATOR",
        handle,
        region,
      });

      res.json({
        user: {
          id: user.id,
          handle: user.handle,
          points: user.points,
          level: user.level,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { firebaseUid } = req.body;

      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      res.json({
        user: {
          id: user.id,
          handle: user.handle,
          points: user.points,
          level: user.level,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Switch logging
  app.post("/api/switches", async (req, res) => {
    try {
      const validatedData = insertSwitchLogSchema.parse(req.body);

      // Handle brand creation if not exists
      if (validatedData.fromBrandId && validatedData.toBrandId) {
        const switchLog = await storage.createSwitchLog(validatedData);

        // Create post if public
        if (validatedData.isPublic) {
          await storage.createPost({
            userId: validatedData.userId,
            switchLogId: switchLog.id,
            content: validatedData.reason || "Made a great switch!",
          });
        }

        res.json({ switchLog });
      } else {
        res.status(400).json({ error: "Brand IDs required" });
      }
    } catch (error) {
      console.error("Switch logging error:", error);
      res.status(400).json({ error: "Invalid switch data" });
    }
  });

  // Feed
  app.get("/api/feed", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getFeedPosts(limit);
      res.json({ posts });
    } catch (error) {
      console.error("Feed error:", error);
      res.status(500).json({ error: "Failed to load feed" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await storage.getLeaderboard(limit);
      res.json({ leaderboard: users });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to load leaderboard" });
    }
  });

  // Trending
  app.get("/api/trending", async (req, res) => {
    try {
      const trendingBrands = await storage.getTrendingBrands();
      res.json({ trending: trendingBrands });
    } catch (error) {
      console.error("Trending error:", error);
      res.status(500).json({ error: "Failed to load trending" });
    }
  });

  // Brands
  app.get("/api/brands/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter required" });
      }

      const brands = await storage.searchBrands(query);
      res.json({ brands });
    } catch (error) {
      console.error("Brand search error:", error);
      res.status(500).json({ error: "Brand search failed" });
    }
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const validatedData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(validatedData);
      res.json({ brand });
    } catch (error) {
      console.error("Brand creation error:", error);
      res.status(400).json({ error: "Invalid brand data" });
    }
  });

  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching all brands:", error);
      res.status(500).json({ error: "Failed to fetch all brands" });
    }
  });

  // Social interactions
  app.post("/api/posts/:postId/like", async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;

      const liked = await storage.toggleLike(userId, postId);
      res.json({ liked });
    } catch (error) {
      console.error("Like error:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const validatedData = insertCommentSchema.parse({ ...req.body, postId });

      const comment = await storage.addComment(validatedData);
      res.json({ comment });
    } catch (error) {
      console.error("Comment error:", error);
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      res.json({ comments });
    } catch (error) {
      console.error("Comments fetch error:", error);
      res.status(500).json({ error: "Failed to load comments" });
    }
  });

  // Target suggestions
  app.post("/api/suggestions", async (req, res) => {
    try {
      const validatedData = insertTargetSuggestionSchema.parse(req.body);
      const suggestion = await storage.createTargetSuggestion(validatedData);
      res.json({ suggestion });
    } catch (error) {
      console.error("Suggestion error:", error);
      res.status(400).json({ error: "Invalid suggestion data" });
    }
  });

  // Admin routes
  app.get("/api/admin/suggestions", async (req, res) => {
    try {
      const status = req.query.status as string;
      const suggestions = await storage.getTargetSuggestions(status);
      res.json({ suggestions });
    } catch (error) {
      console.error("Admin suggestions error:", error);
      res.status(500).json({ error: "Failed to load suggestions" });
    }
  });

  app.patch("/api/admin/suggestions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const suggestion = await storage.updateTargetSuggestion(id, updates);
      res.json({ suggestion });
    } catch (error) {
      console.error("Suggestion update error:", error);
      res.status(500).json({ error: "Failed to update suggestion" });
    }
  });

  // User profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const switchLogs = await storage.getUserSwitchLogs(id);

      res.json({
        user: {
          id: user.id,
          handle: user.handle,
          points: user.points,
          level: user.level,
          switchCount: user.switchCount,
          createdAt: user.createdAt,
        },
        switches: switchLogs,
      });
    } catch (error) {
      console.error("User profile error:", error);
      res.status(500).json({ error: "Failed to load user profile" });
    }
  });

  // Enhanced API routes for new features

  // Get weekly leaderboard
  app.get("/api/leaderboard/weekly", async (req, res) => {
    try {
      const leaderboard = await storage.getWeeklyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching weekly leaderboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get monthly leaderboard
  app.get("/api/leaderboard/monthly", async (req, res) => {
    try {
      const leaderboard = await storage.getMonthlyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching monthly leaderboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced reactions API
  app.post("/api/posts/:id/reactions", async (req, res) => {
    try {
      const { type, userId } = req.body;
      if (!type || !userId) {
        return res.status(400).json({ error: "Type and userId are required" });
      }

      const reaction = await storage.addReaction({
        postId: req.params.id,
        type,
        userId,
      });
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get reactions for a post
  app.get("/api/posts/:id/reactions", async (req, res) => {
    try {
      const reactions = await storage.getPostReactions(req.params.id);
      res.json(reactions);
    } catch (error) {
      console.error("Error getting reactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Trending data endpoints
  app.get("/api/brands/trending", async (req, res) => {
    try {
      const brands = await storage.getTrendingBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching trending brands:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/categories/trending", async (req, res) => {
    try {
      const categories = await storage.getTrendingCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching trending categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Moderation endpoints
  app.get("/api/moderation/reports", async (req, res) => {
    try {
      const status = req.query.status as string;
      const reports = await storage.getModerationReports(status);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching moderation reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/moderation/reports", async (req, res) => {
    try {
      const report = await storage.createModerationReport(req.body);
      res.json(report);
    } catch (error) {
      console.error("Error creating moderation report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/moderation/reports/:id", async (req, res) => {
    try {
      const report = await storage.updateModerationReport(
        req.params.id,
        req.body
      );
      res.json(report);
    } catch (error) {
      console.error("Error updating moderation report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Switch log approval routes
  app.get("/api/moderation/switch-logs/pending", async (req, res) => {
    try {
      const pendingLogs = await storage.getPendingSwitchLogs();
      res.json(pendingLogs);
    } catch (error) {
      console.error("Error fetching pending switch logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Moderator post creation endpoints
  app.post("/api/moderation/posts", async (req, res) => {
    try {
      const post = await storage.createModeratorPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating moderator post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // Get all posts with details (including moderator posts)
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPostsWithDetails();
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get posts by type
  app.get("/api/posts/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const posts = await storage.getPostsByType(type);
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching posts by type:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Create switch log from post interaction
  app.post("/api/switch-logs/from-post", async (req, res) => {
    try {
      const switchLog = await storage.createSwitchLogFromPost(req.body);
      res.status(201).json(switchLog);
    } catch (error) {
      console.error("Error creating switch log from post:", error);
      res.status(500).json({ error: "Failed to create switch log" });
    }
  });

  app.put("/api/moderation/switch-logs/:id/approve", async (req, res) => {
    try {
      const { moderatorId, notes } = req.body;
      const switchLog = await storage.approveSwitchLog(
        req.params.id,
        moderatorId,
        notes
      );
      res.json(switchLog);
    } catch (error) {
      console.error("Error approving switch log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/moderation/switch-logs/:id/reject", async (req, res) => {
    try {
      const { moderatorId, notes } = req.body;
      const switchLog = await storage.rejectSwitchLog(
        req.params.id,
        moderatorId,
        notes
      );
      res.json(switchLog);
    } catch (error) {
      console.error("Error rejecting switch log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Feedback question routes
  app.post("/api/moderation/feedback-questions", async (req, res) => {
    try {
      const validatedData = insertFeedbackQuestionSchema.parse(req.body);
      const question = await storage.createFeedbackQuestion(validatedData);
      res.json(question);
    } catch (error) {
      console.error("Error creating feedback question:", error);
      res.status(400).json({ error: "Invalid question data" });
    }
  });

  app.get("/api/moderation/feedback-questions", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const questions = await storage.getFeedbackQuestions(activeOnly);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching feedback questions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/moderation/feedback-questions/:id", async (req, res) => {
    try {
      const question = await storage.updateFeedbackQuestion(
        req.params.id,
        req.body
      );
      res.json(question);
    } catch (error) {
      console.error("Error updating feedback question:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/moderation/feedback-questions/:id", async (req, res) => {
    try {
      await storage.deleteFeedbackQuestion(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting feedback question:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get(
    "/api/moderation/feedback-questions/:id/responses",
    async (req, res) => {
      try {
        const responses = await storage.getFeedbackResponses(req.params.id);
        res.json(responses);
      } catch (error) {
        console.error("Error fetching feedback responses:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  // Mission routes
  app.post("/api/moderation/missions", async (req, res) => {
    try {
      const validatedData = insertMissionSchema.parse(req.body);
      const mission = await storage.createMission(validatedData);
      res.json(mission);
    } catch (error) {
      console.error("Error creating mission:", error);
      res.status(400).json({ error: "Invalid mission data" });
    }
  });

  app.get("/api/moderation/missions", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const missions = await storage.getMissions(activeOnly);
      res.json(missions);
    } catch (error) {
      console.error("Error fetching missions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Moderation API for mission submissions - get all pending switch logs from missions
  app.get("/api/moderation/mission-submissions", async (req, res) => {
    try {
      const submissions = await storage.getMissionSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching mission submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/moderation/missions/:id", async (req, res) => {
    try {
      const mission = await storage.updateMission(req.params.id, req.body);
      res.json(mission);
    } catch (error) {
      console.error("Error updating mission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/moderation/missions/:id", async (req, res) => {
    try {
      await storage.deleteMission(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting mission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Member management routes
  app.get("/api/moderation/users", async (req, res) => {
    try {
      const filters = {
        role: req.query.role as string,
        active: req.query.active === "true",
      };
      const users = await storage.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/moderation/users/:id", async (req, res) => {
    try {
      const userDetails = await storage.getUserDetails(req.params.id);
      res.json(userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/moderation/users/:id/role", async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // News article routes
  app.post("/api/moderation/news", async (req, res) => {
    try {
      const newsArticle = await storage.createNewsArticle(req.body);
      res.json(newsArticle);
    } catch (error) {
      console.error("Error creating news article:", error);
      res.status(500).json({ error: "Failed to create news article" });
    }
  });

  app.get("/api/moderation/news", async (req, res) => {
    try {
      const newsArticles = await storage.getNewsArticles();
      res.json(newsArticles);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ error: "Failed to fetch news articles" });
    }
  });

  app.put("/api/moderation/news/:id", async (req, res) => {
    try {
      const newsArticle = await storage.updateNewsArticle(
        req.params.id,
        req.body
      );
      res.json(newsArticle);
    } catch (error) {
      console.error("Error updating news article:", error);
      res.status(500).json({ error: "Failed to update news article" });
    }
  });

  app.delete("/api/moderation/news/:id", async (req, res) => {
    try {
      await storage.deleteNewsArticle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news article:", error);
      res.status(500).json({ error: "Failed to delete news article" });
    }
  });

  // Post creation with image support
  app.post("/api/moderation/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  // Enhanced brand search with ability to add new brands
  app.get("/api/brands/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        return res.json([]);
      }
      const brands = await storage.searchBrands(query);
      res.json(brands);
    } catch (error) {
      console.error("Error searching brands:", error);
      res.status(500).json({ error: "Failed to search brands" });
    }
  });

  // Messages system
  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.sendMessage(req.body);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:userId/unread", async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getUnreadMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      res.status(500).json({ error: "Failed to fetch unread messages" });
    }
  });

  app.put("/api/messages/:messageId/read", async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Moderator posts
  app.post("/api/moderator-posts", async (req, res) => {
    try {
      const post = await storage.createModeratorPost(req.body);
      res.json(post);
    } catch (error) {
      console.error("Error creating moderator post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  // app.get("/api/moderator-posts", async (req, res) => {
  //   try {
  //     const posts = await storage.getModeratorPosts();
  //     res.json(posts);
  //   } catch (error) {
  //     console.error("Error fetching moderator posts:", error);
  //     res.status(500).json({ error: "Failed to fetch posts" });
  //   }
  // });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tags API
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tags/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tags = await storage.getPopularTags(limit);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching popular tags:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const tag = await storage.createTag(req.body);
      res.json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Communities API
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // News API
  app.get("/api/news", async (req, res) => {
    try {
      const articles = await storage.getAllNewsArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // All Missions API
  app.get("/api/missions", async (req, res) => {
    try {
      const missions = await storage.getAllMissions();
      res.json(missions);
    } catch (error) {
      console.error("Error fetching missions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Ongoing Missions API (for News page sidebar)
  app.get("/api/missions/ongoing", async (req, res) => {
    try {
      const missions = await storage.getOngoingMissions();
      res.json(missions);
    } catch (error) {
      console.error("Error fetching ongoing missions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User Missions API
  app.get("/api/user-missions", async (req, res) => {
    try {
      // Get user ID from session/auth - simplified for demo
      const userId =
        (req.headers["x-user-id"] as string) ||
        "feed33d3-d444-454d-a413-aefb61d4848b";
      console.log("Getting user missions for userId:", userId);

      const userMissions = await storage.getUserMissions(userId);
      console.log("Found user missions:", userMissions.length);
      res.json(userMissions);
    } catch (error) {
      console.error("Error fetching user missions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Join Mission API
  app.post("/api/missions/:missionId/join", async (req, res) => {
    try {
      // Get user ID from session/auth - simplified for demo
      const userId =
        (req.headers["x-user-id"] as string) ||
        "feed33d3-d444-454d-a413-aef25c16a5af";
      const { missionId } = req.params;

      const userMission = await storage.joinMission(userId, missionId);
      res.json(userMission);
    } catch (error: any) {
      console.error("Error joining mission:", error);
      res
        .status(400)
        .json({ error: error.message || "Failed to join mission" });
    }
  });

  // Submit Mission Switch Log API
  app.post("/api/missions/:missionId/submit", async (req, res) => {
    try {
      // Get user ID from session/auth - simplified for demo
      const userId =
        (req.headers["x-user-id"] as string) ||
        "feed33d3-d444-454d-a413-aef25c16a5af";
      const { missionId } = req.params;

      const switchLog = await storage.submitMissionSwitchLog(
        userId,
        missionId,
        req.body
      );
      res.json(switchLog);
    } catch (error: any) {
      console.error("Error submitting mission switch log:", error);
      res
        .status(400)
        .json({ error: error.message || "Failed to submit switch log" });
    }
  });

  // Verify Mission Switch Log API (Moderators only)
  app.post("/api/switch-logs/:switchLogId/verify", async (req, res) => {
    try {
      // Get moderator ID from headers (use actual logged in user)
      const moderatorId =
        (req.headers["x-user-id"] as string) ||
        "feed33d3-d444-454d-a413-aefb61d4848b";
      const { switchLogId } = req.params;
      const { approved, feedback } = req.body;

      const result = await storage.verifyMissionSwitchLog(
        switchLogId,
        moderatorId,
        approved,
        feedback
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error verifying mission switch log:", error);
      res
        .status(400)
        .json({ error: error.message || "Failed to verify switch log" });
    }
  });

  app.post("/api/communities", async (req, res) => {
    try {
      const community = await storage.createCommunity(req.body);
      res.json(community);
    } catch (error) {
      console.error("Error creating community:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Feedback submissions API
  app.get("/api/feedback-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllFeedbackSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching feedback submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/feedback-submissions", async (req, res) => {
    try {
      const submission = await storage.createFeedbackSubmission(req.body);
      res.json(submission);
    } catch (error) {
      console.error("Error creating feedback submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced moderation routes for switch log approvals
  app.put("/api/moderation/switch-logs/:id/approve", async (req, res) => {
    try {
      const { moderatorId, moderatorNotes } = req.body;
      const switchLog = await storage.approveSwitchLog(
        req.params.id,
        moderatorId,
        moderatorNotes
      );
      res.json(switchLog);
    } catch (error) {
      console.error("Error approving switch log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/moderation/switch-logs/:id/reject", async (req, res) => {
    try {
      const { moderatorId, moderatorNotes } = req.body;
      const switchLog = await storage.rejectSwitchLog(
        req.params.id,
        moderatorId,
        moderatorNotes
      );
      res.json(switchLog);
    } catch (error) {
      console.error("Error rejecting switch log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Enhanced feedback submission routes for moderation
  app.get("/api/moderation/feedback-submissions", async (req, res) => {
    try {
      const submissions = await storage.getPendingFeedbackSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching feedback submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put(
    "/api/moderation/feedback-submissions/:id/approve",
    async (req, res) => {
      try {
        const { moderatorId, moderatorNotes } = req.body;
        const submission = await storage.approveFeedbackSubmission(
          req.params.id,
          moderatorId,
          moderatorNotes
        );
        res.json(submission);
      } catch (error) {
        console.error("Error approving feedback submission:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  app.put(
    "/api/moderation/feedback-submissions/:id/reject",
    async (req, res) => {
      try {
        const { moderatorId, moderatorNotes } = req.body;
        const submission = await storage.rejectFeedbackSubmission(
          req.params.id,
          moderatorId,
          moderatorNotes
        );
        res.json(submission);
      } catch (error) {
        console.error("Error rejecting feedback submission:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  const httpServer = createServer(app);

  // Add WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received WebSocket message:", data);

        // Echo message back to all clients for real-time updates
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "update",
                data: data,
                timestamp: new Date().toISOString(),
              })
            );
          }
        });
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    // Send initial connection confirmation
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Real-time updates enabled",
        timestamp: new Date().toISOString(),
      })
    );
  });

  return httpServer;
}
