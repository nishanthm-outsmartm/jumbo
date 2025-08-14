import {
  users,
  switchLogs,
  posts,
  brands,
  likes,
  comments,
  reactions,
  targetSuggestions,
  newsItems,
  newsArticles,
  leaderboardSnapshots,
  moderationReports,
  feedbackQuestions,
  feedbackResponses,
  missions,
  userMissions,
  messages,
  moderatorPosts,
  // New enhanced tables
  categories,
  tags,
  communities,
  communityMembers,
  contentTags,
  feedbackSubmissions,
  type User,
  type InsertUser,
  type SwitchLog,
  type InsertSwitchLog,
  type Post,
  type InsertPost,
  type Brand,
  type InsertBrand,
  type Comment,
  type InsertComment,
  type TargetSuggestion,
  type InsertTargetSuggestion,
  type Reaction,
  type InsertReaction,
  type LeaderboardSnapshot,
  type ModerationReport,
  type InsertModerationReport,
  type FeedbackQuestion,
  type InsertFeedbackQuestion,
  type FeedbackResponse,
  type InsertFeedbackResponse,
  type Mission,
  type InsertMission,
  type UserMission,
  type InsertUserMission,
  type NewsArticle,
  type InsertNewsArticle,
  type Message,
  type InsertMessage,
  type ModeratorPost,
  type InsertModeratorPost,
  // New enhanced types
  type Category,
  type InsertCategory,
  type Tag,
  type InsertTag,
  type Community,
  type InsertCommunity,
  type CommunityMember,
  type InsertCommunityMember,
  type ContentTag,
  type InsertContentTag,
  type FeedbackSubmission,
  type InsertFeedbackSubmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByHandle(handle: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Switch log methods
  createSwitchLog(switchLog: InsertSwitchLog): Promise<SwitchLog>;
  getUserSwitchLogs(userId: string): Promise<SwitchLog[]>;
  getPublicSwitchLogs(limit?: number): Promise<SwitchLog[]>;

  // Post methods
  createPost(post: InsertPost): Promise<Post>;
  getFeedPosts(limit?: number): Promise<any[]>;
  getPostById(id: string): Promise<Post | undefined>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post>;

  // Brand methods
  getBrand(id: string): Promise<Brand | undefined>;
  getBrandByName(name: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  searchBrands(query: string): Promise<Brand[]>;

  // Social interaction methods
  toggleLike(userId: string, postId: string): Promise<boolean>;
  addComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: string): Promise<any[]>;
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  getPostReactions(postId: string): Promise<any[]>;
  getUserReaction(
    userId: string,
    postId: string,
    type: string
  ): Promise<boolean>;

  // Leaderboard methods
  getLeaderboard(limit?: number, period?: string): Promise<User[]>;
  getWeeklyLeaderboard(limit?: number): Promise<LeaderboardSnapshot[]>;
  getMonthlyLeaderboard(limit?: number): Promise<LeaderboardSnapshot[]>;
  getTrendingBrands(): Promise<any[]>;
  getTrendingCategories(): Promise<any[]>;

  // Admin methods
  getTargetSuggestions(status?: string): Promise<TargetSuggestion[]>;
  updateTargetSuggestion(
    id: string,
    updates: Partial<TargetSuggestion>
  ): Promise<TargetSuggestion>;
  createTargetSuggestion(
    suggestion: InsertTargetSuggestion
  ): Promise<TargetSuggestion>;

  // Moderation methods
  getModerationReports(status?: string): Promise<any[]>;
  createModerationReport(
    report: InsertModerationReport
  ): Promise<ModerationReport>;
  updateModerationReport(
    id: string,
    updates: Partial<ModerationReport>
  ): Promise<ModerationReport>;

  // Switch log approval methods
  getPendingSwitchLogs(): Promise<any[]>;
  approveSwitchLog(
    id: string,
    moderatorId: string,
    notes?: string
  ): Promise<SwitchLog>;
  rejectSwitchLog(
    id: string,
    moderatorId: string,
    notes: string
  ): Promise<SwitchLog>;

  // Feedback question methods
  createFeedbackQuestion(
    question: InsertFeedbackQuestion
  ): Promise<FeedbackQuestion>;
  getFeedbackQuestions(activeOnly?: boolean): Promise<FeedbackQuestion[]>;
  updateFeedbackQuestion(
    id: string,
    updates: Partial<FeedbackQuestion>
  ): Promise<FeedbackQuestion>;
  deleteFeedbackQuestion(id: string): Promise<void>;
  getFeedbackResponses(questionId: string): Promise<any[]>;

  // Mission methods
  createMission(mission: InsertMission): Promise<Mission>;
  getMissions(activeOnly?: boolean): Promise<Mission[]>;
  updateMission(id: string, updates: Partial<Mission>): Promise<Mission>;
  deleteMission(id: string): Promise<void>;
  getUserMissions(userId: string): Promise<any[]>;

  // Member management methods
  getAllUsers(filters?: { role?: string; active?: boolean }): Promise<any[]>;
  getUserDetails(id: string): Promise<any>;
  updateUserRole(id: string, role: string): Promise<User>;

  // News article methods
  createNewsArticle(newsArticle: InsertNewsArticle): Promise<NewsArticle>;
  getNewsArticles(): Promise<NewsArticle[]>;
  updateNewsArticle(
    id: string,
    updates: Partial<NewsArticle>
  ): Promise<NewsArticle>;
  deleteNewsArticle(id: string): Promise<void>;

  // Messages
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessagesForUser(userId: string): Promise<Message[]>;
  getUnreadMessages(userId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;

  // Moderator posts
  createModeratorPost(post: InsertModeratorPost): Promise<ModeratorPost>;
  getAllModeratorPosts(): Promise<ModeratorPost[]>;

  // Categories
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;

  // Tags
  createTag(tag: InsertTag): Promise<Tag>;
  getAllTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag | undefined>;
  updateTag(id: string, updates: Partial<Tag>): Promise<Tag>;
  incrementTagUsage(tagId: string): Promise<void>;
  getPopularTags(limit?: number): Promise<Tag[]>;

  // Communities
  createCommunity(community: InsertCommunity): Promise<Community>;
  getAllCommunities(): Promise<Community[]>;
  getCommunityById(id: string): Promise<Community | undefined>;
  updateCommunity(id: string, updates: Partial<Community>): Promise<Community>;
  addCommunityMember(member: InsertCommunityMember): Promise<CommunityMember>;
  removeCommunityMember(communityId: string, userId: string): Promise<void>;
  getCommunityMembers(communityId: string): Promise<CommunityMember[]>;
  getUserCommunities(userId: string): Promise<Community[]>;

  // Feedback submissions
  createFeedbackSubmission(
    submission: InsertFeedbackSubmission
  ): Promise<FeedbackSubmission>;
  getAllFeedbackSubmissions(): Promise<FeedbackSubmission[]>;
  getPendingFeedbackSubmissions(): Promise<FeedbackSubmission[]>;
  approveFeedbackSubmission(
    id: string,
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<FeedbackSubmission>;
  rejectFeedbackSubmission(
    id: string,
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<FeedbackSubmission>;

  // Enhanced mission methods
  getMissionsByCategory(categoryId: string): Promise<Mission[]>;
  getMissionsByCommunity(communityId: string): Promise<Mission[]>;
  updateMissionStatus(id: string, status: string): Promise<Mission>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByHandle(handle: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.handle, handle));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createSwitchLog(insertSwitchLog: InsertSwitchLog): Promise<SwitchLog> {
    const [switchLog] = await db
      .insert(switchLogs)
      .values(insertSwitchLog)
      .returning();

    // Update user stats
    if (switchLog.userId) {
      await db
        .update(users)
        .set({
          switchCount: sql`${users.switchCount} + 1`,
          points: sql`${users.points} + ${switchLog.points || 25}`,
        })
        .where(eq(users.id, switchLog.userId));
    }

    return switchLog;
  }

  async getUserSwitchLogs(userId: string): Promise<SwitchLog[]> {
    return db
      .select()
      .from(switchLogs)
      .where(eq(switchLogs.userId, userId))
      .orderBy(desc(switchLogs.createdAt));
  }

  async getPublicSwitchLogs(limit: number = 10): Promise<SwitchLog[]> {
    return db
      .select()
      .from(switchLogs)
      .where(eq(switchLogs.isPublic, true))
      .orderBy(desc(switchLogs.createdAt))
      .limit(limit);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async getFeedPosts(limit: number = 20): Promise<any[]> {
    const feedPosts = await db
      .select({
        post: posts,
        user: {
          id: users.id,
          handle: users.handle,
          level: users.level,
          points: users.points,
        },
        switchLog: switchLogs,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(switchLogs, eq(posts.switchLogId, switchLogs.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return feedPosts;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || undefined;
  }

  async getBrandByName(name: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.name, name));
    return brand || undefined;
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(insertBrand).returning();
    return brand;
  }

  async searchBrands(query: string): Promise<Brand[]> {
    return db
      .select()
      .from(brands)
      .where(sql`${brands.name} ILIKE ${"%" + query + "%"}`)
      .limit(10);
  }
  async getAllBrands(): Promise<Brand[]> {
    return db.select().from(brands);
  }

  async toggleLike(userId: string, postId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));

      return false;
    } else {
      // Add like
      await db.insert(likes).values({ userId, postId });

      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));

      return true;
    }
  }

  async addComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();

    // Update comment count on post
    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, insertComment.postId!));

    return comment;
  }

  async getPostComments(postId: string): Promise<any[]> {
    const results = await db
      .select({
        comment: comments,
        user: {
          id: users.id,
          handle: users.handle,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return results;
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.points)).limit(limit);
  }

  async getTrendingBrands(): Promise<any[]> {
    return db
      .select({
        brand: brands,
        switchCount: count(switchLogs.id),
      })
      .from(brands)
      .leftJoin(switchLogs, eq(brands.id, switchLogs.toBrandId))
      .where(sql`${switchLogs.createdAt} > NOW() - INTERVAL '7 days'`)
      .groupBy(brands.id)
      .orderBy(desc(count(switchLogs.id)))
      .limit(5);
  }

  async getTargetSuggestions(status?: string): Promise<TargetSuggestion[]> {
    const query = db.select().from(targetSuggestions);

    if (status) {
      return query.where(eq(targetSuggestions.status, status));
    }

    return query.orderBy(desc(targetSuggestions.createdAt));
  }

  async updateTargetSuggestion(
    id: string,
    updates: Partial<TargetSuggestion>
  ): Promise<TargetSuggestion> {
    const [suggestion] = await db
      .update(targetSuggestions)
      .set(updates)
      .where(eq(targetSuggestions.id, id))
      .returning();
    return suggestion;
  }

  async createTargetSuggestion(
    insertSuggestion: InsertTargetSuggestion
  ): Promise<TargetSuggestion> {
    const [suggestion] = await db
      .insert(targetSuggestions)
      .values(insertSuggestion)
      .returning();
    return suggestion;
  }

  // Enhanced social interactions
  async addReaction(insertReaction: InsertReaction): Promise<Reaction> {
    // Remove existing reaction of this type by this user for this post
    await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.userId, insertReaction.userId!),
          eq(reactions.postId, insertReaction.postId!),
          eq(reactions.type, insertReaction.type)
        )
      );

    const [reaction] = await db
      .insert(reactions)
      .values(insertReaction)
      .returning();
    return reaction;
  }

  async getPostReactions(postId: string): Promise<any[]> {
    const reactionCounts = await db
      .select({
        type: reactions.type,
        count: sql`count(*)::int`.as("count"),
      })
      .from(reactions)
      .where(eq(reactions.postId, postId))
      .groupBy(reactions.type);

    return reactionCounts;
  }

  async getUserReaction(
    userId: string,
    postId: string,
    type: string
  ): Promise<boolean> {
    const [reaction] = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.postId, postId),
          eq(reactions.type, type)
        )
      )
      .limit(1);

    return !!reaction;
  }

  // Enhanced leaderboards
  async getWeeklyLeaderboard(
    limit: number = 10
  ): Promise<LeaderboardSnapshot[]> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentWeek = Math.ceil(
      (currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    return db
      .select()
      .from(leaderboardSnapshots)
      .where(
        and(
          eq(leaderboardSnapshots.period, "weekly"),
          eq(leaderboardSnapshots.year, currentYear),
          eq(leaderboardSnapshots.week, currentWeek)
        )
      )
      .orderBy(leaderboardSnapshots.rank)
      .limit(limit);
  }

  async getMonthlyLeaderboard(
    limit: number = 10
  ): Promise<LeaderboardSnapshot[]> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    return db
      .select()
      .from(leaderboardSnapshots)
      .where(
        and(
          eq(leaderboardSnapshots.period, "monthly"),
          eq(leaderboardSnapshots.year, currentYear),
          eq(leaderboardSnapshots.month, currentMonth)
        )
      )
      .orderBy(leaderboardSnapshots.rank)
      .limit(limit);
  }

  async getTrendingCategories(): Promise<any[]> {
    return db
      .select({
        category: switchLogs.category,
        switchCount: sql`count(*)::int`.as("switchCount"),
        recentSwitches:
          sql`count(case when ${switchLogs.createdAt} > NOW() - interval '24 hours' then 1 end)::int`.as(
            "recentSwitches"
          ),
      })
      .from(switchLogs)
      .where(sql`${switchLogs.createdAt} > NOW() - INTERVAL '7 days'`)
      .groupBy(switchLogs.category)
      .orderBy(sql`count(*) DESC`)
      .limit(8);
  }

  // Moderation methods
  async getModerationReports(status?: string): Promise<any[]> {
    const query = db
      .select({
        report: moderationReports,
        reporter: {
          id: users.id,
          handle: users.handle,
        },
        moderator: {
          id: users.id,
          handle: users.handle,
        },
      })
      .from(moderationReports)
      .leftJoin(users, eq(moderationReports.reporterId, users.id));

    if (status) {
      return query
        .where(eq(moderationReports.status, status))
        .orderBy(desc(moderationReports.createdAt));
    }

    return query.orderBy(desc(moderationReports.createdAt));
  }

  async createModerationReport(
    insertReport: InsertModerationReport
  ): Promise<ModerationReport> {
    const [report] = await db
      .insert(moderationReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateModerationReport(
    id: string,
    updates: Partial<ModerationReport>
  ): Promise<ModerationReport> {
    const [report] = await db
      .update(moderationReports)
      .set(updates)
      .where(eq(moderationReports.id, id))
      .returning();
    return report;
  }

  // Switch log approval methods
  async getPendingSwitchLogs(): Promise<any[]> {
    return db
      .select({
        switchLog: switchLogs,
        user: {
          id: users.id,
          handle: users.handle,
          points: users.points,
          level: users.level,
        },
        fromBrand: {
          id: brands.id,
          name: brands.name,
          country: brands.country,
          isIndian: brands.isIndian,
        },
        toBrand: {
          id: brands.id,
          name: brands.name,
          country: brands.country,
          isIndian: brands.isIndian,
        },
      })
      .from(switchLogs)
      .leftJoin(users, eq(switchLogs.userId, users.id))
      .leftJoin(brands, eq(switchLogs.fromBrandId, brands.id))
      .leftJoin(brands as any, eq(switchLogs.toBrandId, brands.id))
      .where(eq(switchLogs.status, "PENDING"))
      .orderBy(desc(switchLogs.createdAt));
  }

  async approveSwitchLog(
    id: string,
    moderatorId: string,
    notes?: string
  ): Promise<SwitchLog> {
    const [switchLog] = await db
      .update(switchLogs)
      .set({
        status: "APPROVED",
        moderatorId,
        moderatorNotes: notes,
        approvedAt: new Date(),
      })
      .where(eq(switchLogs.id, id))
      .returning();
    return switchLog;
  }

  async rejectSwitchLog(
    id: string,
    moderatorId: string,
    notes: string
  ): Promise<SwitchLog> {
    const [switchLog] = await db
      .update(switchLogs)
      .set({
        status: "REJECTED",
        moderatorId,
        moderatorNotes: notes,
      })
      .where(eq(switchLogs.id, id))
      .returning();
    return switchLog;
  }

  // Feedback question methods
  async createFeedbackQuestion(
    insertQuestion: InsertFeedbackQuestion
  ): Promise<FeedbackQuestion> {
    const [question] = await db
      .insert(feedbackQuestions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async getFeedbackQuestions(
    activeOnly: boolean = false
  ): Promise<FeedbackQuestion[]> {
    const query = db.select().from(feedbackQuestions);

    if (activeOnly) {
      return query
        .where(eq(feedbackQuestions.isActive, true))
        .orderBy(desc(feedbackQuestions.createdAt));
    }

    return query.orderBy(desc(feedbackQuestions.createdAt));
  }

  async updateFeedbackQuestion(
    id: string,
    updates: Partial<FeedbackQuestion>
  ): Promise<FeedbackQuestion> {
    const [question] = await db
      .update(feedbackQuestions)
      .set(updates)
      .where(eq(feedbackQuestions.id, id))
      .returning();
    return question;
  }

  async deleteFeedbackQuestion(id: string): Promise<void> {
    await db.delete(feedbackQuestions).where(eq(feedbackQuestions.id, id));
  }

  async getFeedbackResponses(questionId: string): Promise<any[]> {
    return db
      .select({
        response: feedbackResponses,
        user: {
          id: users.id,
          handle: users.handle,
        },
      })
      .from(feedbackResponses)
      .leftJoin(users, eq(feedbackResponses.userId, users.id))
      .where(eq(feedbackResponses.questionId, questionId))
      .orderBy(desc(feedbackResponses.createdAt));
  }

  // Mission methods
  async createMission(insertMission: InsertMission): Promise<Mission> {
    const [mission] = await db
      .insert(missions)
      .values(insertMission)
      .returning();
    return mission;
  }

  async getMissions(activeOnly: boolean = false): Promise<Mission[]> {
    const query = db.select().from(missions);

    if (activeOnly) {
      return query
        .where(eq(missions.isActive, true))
        .orderBy(desc(missions.createdAt));
    }

    return query.orderBy(desc(missions.createdAt));
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const [mission] = await db
      .update(missions)
      .set(updates)
      .where(eq(missions.id, id))
      .returning();
    return mission;
  }

  async deleteMission(id: string): Promise<void> {
    await db.delete(missions).where(eq(missions.id, id));
  }

  async getUserMissions(userId: string): Promise<any[]> {
    return db
      .select({
        userMission: userMissions,
        mission: missions,
      })
      .from(userMissions)
      .leftJoin(missions, eq(userMissions.missionId, missions.id))
      .where(eq(userMissions.userId, userId))
      .orderBy(desc(userMissions.createdAt));
  }

  // Member management methods
  async getAllUsers(filters?: {
    role?: string;
    active?: boolean;
  }): Promise<any[]> {
    const baseQuery = db
      .select({
        user: users,
        switchCount: sql`count(${switchLogs.id})::int`.as("totalSwitches"),
        recentActivity:
          sql`count(case when ${switchLogs.createdAt} > NOW() - interval '30 days' then 1 end)::int`.as(
            "recentSwitches"
          ),
      })
      .from(users)
      .leftJoin(switchLogs, eq(users.id, switchLogs.userId))
      .groupBy(users.id);

    if (filters?.role) {
      return baseQuery
        .where(eq(users.role, filters.role as any))
        .orderBy(desc(users.createdAt));
    }

    return baseQuery.orderBy(desc(users.createdAt));
  }

  async getUserDetails(id: string): Promise<any> {
    const [userDetails] = await db
      .select({
        user: users,
        totalSwitches: sql`count(${switchLogs.id})::int`.as("totalSwitches"),
        totalPosts: sql`count(${posts.id})::int`.as("totalPosts"),
      })
      .from(users)
      .leftJoin(switchLogs, eq(users.id, switchLogs.userId))
      .leftJoin(posts, eq(users.id, posts.userId))
      .where(eq(users.id, id))
      .groupBy(users.id);

    return userDetails;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // News article methods
  async createNewsArticle(
    insertNewsArticle: InsertNewsArticle
  ): Promise<NewsArticle> {
    const [article] = await db
      .insert(newsArticles)
      .values(insertNewsArticle)
      .returning();
    return article;
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    return db
      .select()
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishedAt));
  }

  async updateNewsArticle(
    id: string,
    updates: Partial<NewsArticle>
  ): Promise<NewsArticle> {
    const [article] = await db
      .update(newsArticles)
      .set(updates)
      .where(eq(newsArticles.id, id))
      .returning();
    return article;
  }

  async deleteNewsArticle(id: string): Promise<void> {
    await db.delete(newsArticles).where(eq(newsArticles.id, id));
  }

  // Messages
  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        sql`${messages.fromUserId} = ${userId} OR ${messages.toUserId} = ${userId}`
      )
      .orderBy(desc(messages.createdAt));
  }

  async getUnreadMessages(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(and(eq(messages.toUserId, userId), eq(messages.isRead, false)))
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Moderator posts
  async createModeratorPost(
    insertPost: InsertModeratorPost
  ): Promise<ModeratorPost> {
    const [post] = await db
      .insert(moderatorPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getAllModeratorPosts(): Promise<ModeratorPost[]> {
    return db
      .select()
      .from(moderatorPosts)
      .orderBy(desc(moderatorPosts.isPinned), desc(moderatorPosts.createdAt));
  }

  // Categories
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async updateCategory(
    id: string,
    updates: Partial<Category>
  ): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  // Tags
  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async getAllTags(): Promise<Tag[]> {
    return db
      .select()
      .from(tags)
      .where(eq(tags.isActive, true))
      .orderBy(desc(tags.usageCount), tags.name);
  }

  async getTagById(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    const [tag] = await db
      .update(tags)
      .set(updates)
      .where(eq(tags.id, id))
      .returning();
    return tag;
  }

  async incrementTagUsage(tagId: string): Promise<void> {
    await db
      .update(tags)
      .set({ usageCount: sql`${tags.usageCount} + 1` })
      .where(eq(tags.id, tagId));
  }

  async getPopularTags(limit: number = 20): Promise<Tag[]> {
    return db
      .select()
      .from(tags)
      .where(eq(tags.isActive, true))
      .orderBy(desc(tags.usageCount))
      .limit(limit);
  }

  // Communities
  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const [community] = await db
      .insert(communities)
      .values(insertCommunity)
      .returning();
    return community;
  }

  async getAllCommunities(): Promise<Community[]> {
    return db
      .select()
      .from(communities)
      .where(eq(communities.isActive, true))
      .orderBy(desc(communities.memberCount), communities.name);
  }

  async getCommunityById(id: string): Promise<Community | undefined> {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, id));
    return community;
  }

  async updateCommunity(
    id: string,
    updates: Partial<Community>
  ): Promise<Community> {
    const [community] = await db
      .update(communities)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(communities.id, id))
      .returning();
    return community;
  }

  // Community members
  async addCommunityMember(
    insertMember: InsertCommunityMember
  ): Promise<CommunityMember> {
    const [member] = await db
      .insert(communityMembers)
      .values(insertMember)
      .returning();

    // Update community member count
    await db
      .update(communities)
      .set({ memberCount: sql`${communities.memberCount} + 1` })
      .where(eq(communities.id, insertMember.communityId!));

    return member;
  }

  async removeCommunityMember(
    communityId: string,
    userId: string
  ): Promise<void> {
    await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      );

    // Update community member count
    await db
      .update(communities)
      .set({ memberCount: sql`${communities.memberCount} - 1` })
      .where(eq(communities.id, communityId));
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    return db
      .select()
      .from(communityMembers)
      .where(eq(communityMembers.communityId, communityId))
      .orderBy(communityMembers.joinedAt);
  }

  async getUserCommunities(userId: string): Promise<Community[]> {
    return db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        coverImageUrl: communities.coverImageUrl,
        visibility: communities.visibility,
        memberCount: communities.memberCount,
        isActive: communities.isActive,
        createdBy: communities.createdBy,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
      })
      .from(communities)
      .innerJoin(
        communityMembers,
        eq(communities.id, communityMembers.communityId)
      )
      .where(eq(communityMembers.userId, userId));
  }

  // Feedback submissions (renamed from target suggestions)
  async createFeedbackSubmission(
    insertSubmission: InsertFeedbackSubmission
  ): Promise<FeedbackSubmission> {
    const [submission] = await db
      .insert(feedbackSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getAllFeedbackSubmissions(): Promise<FeedbackSubmission[]> {
    return db
      .select()
      .from(feedbackSubmissions)
      .orderBy(desc(feedbackSubmissions.createdAt));
  }

  async getPendingFeedbackSubmissions(): Promise<FeedbackSubmission[]> {
    return db
      .select()
      .from(feedbackSubmissions)
      .where(eq(feedbackSubmissions.status, "PENDING"))
      .orderBy(desc(feedbackSubmissions.createdAt));
  }

  async approveFeedbackSubmission(
    id: string,
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<FeedbackSubmission> {
    const [submission] = await db
      .update(feedbackSubmissions)
      .set({
        status: "APPROVED",
        moderatorId,
        moderatorNotes,
        reviewedAt: sql`NOW()`,
      })
      .where(eq(feedbackSubmissions.id, id))
      .returning();
    return submission;
  }

  async rejectFeedbackSubmission(
    id: string,
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<FeedbackSubmission> {
    const [submission] = await db
      .update(feedbackSubmissions)
      .set({
        status: "REJECTED",
        moderatorId,
        moderatorNotes,
        reviewedAt: sql`NOW()`,
      })
      .where(eq(feedbackSubmissions.id, id))
      .returning();
    return submission;
  }

  // Enhanced switch log methods with approval workflow
  async getPendingSwitchLogs(): Promise<SwitchLog[]> {
    return db
      .select()
      .from(switchLogs)
      .where(eq(switchLogs.status, "PENDING"))
      .orderBy(desc(switchLogs.createdAt));
  }

  async approveSwitchLog(
    id: string,
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<SwitchLog> {
    const [switchLog] = await db
      .update(switchLogs)
      .set({
        status: "APPROVED",
        moderatorId,
        moderatorNotes,
        approvedAt: sql`NOW()`,
      })
      .where(eq(switchLogs.id, id))
      .returning();
    return switchLog;
  }

  async rejectSwitchLog(
    id: string,
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<SwitchLog> {
    const [switchLog] = await db
      .update(switchLogs)
      .set({
        status: "REJECTED",
        moderatorId,
        moderatorNotes,
      })
      .where(eq(switchLogs.id, id))
      .returning();
    return switchLog;
  }

  // Enhanced mission methods
  async getMissionsByCategory(categoryId: string): Promise<Mission[]> {
    return db
      .select()
      .from(missions)
      .where(
        and(eq(missions.categoryId, categoryId), eq(missions.isActive, true))
      )
      .orderBy(desc(missions.createdAt));
  }

  async getMissionsByCommunity(communityId: string): Promise<Mission[]> {
    return db
      .select()
      .from(missions)
      .where(
        and(eq(missions.communityId, communityId), eq(missions.isActive, true))
      )
      .orderBy(desc(missions.createdAt));
  }

  async updateMissionStatus(id: string, status: string): Promise<Mission> {
    const [mission] = await db
      .update(missions)
      .set({ status: status as any })
      .where(eq(missions.id, id))
      .returning();
    return mission;
  }
}

export const storage = new DatabaseStorage();
