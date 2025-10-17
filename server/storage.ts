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
  // New anonymous user features
  recoveryKeys,
  backupCodes,
  rewards,
  userRewards,
  newsVotes,
  newsShares,
  gdprRequests,
  recoveryMethods,
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
  // New anonymous user types
  type RecoveryKey,
  type InsertRecoveryKey,
  type BackupCode,
  type InsertBackupCode,
  type Reward,
  type InsertReward,
  type UserReward,
  type InsertUserReward,
  type NewsLike,
  type InsertNewsLike,
  type NewsShare,
  type InsertNewsShare,
  type GdprRequest,
  type InsertGdprRequest,
  passwordResetTokens,
  switchFeedbacks,
} from "@shared/schema";
import { db } from "./db";
import crypto from "crypto";
import { eq, desc, sql, and, count, ilike, asc, countDistinct } from "drizzle-orm";
import { sendEmail } from "./services/email.service";
import { serverConfig } from "@shared/config/server.config";
import { error } from "console";
import { auth } from "./services/firebase-admin";
import { uploadImage } from "./services/minio/upload";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByHandle(handle: string): Promise<User | undefined>;
  getUserByCookieId(cookieId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnonymousUser(handle: string, cookieId: string): Promise<User>;
  createModeratorUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  migrateAnonymousToRegistered(anonymousUserId: string, firebaseUid: string, email?: string, phone?: string): Promise<User>;

  // Recovery key methods
  createRecoveryKey(userId: string, keyHash: string, keyDisplay: string, qrCodeData?: string): Promise<any>;
  getRecoveryKeyByHash(keyHash: string): Promise<any>;
  useRecoveryKey(keyHash: string): Promise<User>;

  // Secret key authentication methods
  generateSecretKey(): string;
  hashSecretKey(secretKey: string): string;
  createUserWithSecretKey(handle: string, state: string, secretKeyHash: string): Promise<User>;
  authenticateWithSecretKey(handle: string, secretKey: string): Promise<User | null>;
  updateUserSecretKey(userId: string, secretKeyHash: string): Promise<User>;

  // Backup codes methods
  createBackupCodes(userId: string, codes: string[]): Promise<any[]>;
  getBackupCodes(userId: string): Promise<any[]>;
  verifyBackupCode(code: string, action?: string): Promise<{ success: boolean; error?: string; user?: User }>;
  useBackupCodeForLogin(code: string): Promise<{ success: boolean; error?: string; user?: User }>;

  // Rewards methods
  getRewards(): Promise<any[]>;
  claimReward(userId: string, rewardId: string): Promise<any>;
  getUserRewards(userId: string): Promise<any[]>;

  // News engagement methods
  voteNews(userId: string, newsId: string, voteType: 'upvote' | 'downvote'): Promise<{ voted: boolean; voteType: string | null; upvotesCount: number; downvotesCount: number }>;
  getUserVote(userId: string, newsId: string): Promise<{ voteType: string } | null>;
  getUserShare(userId: string, newsId: string): Promise<any>;
  shareNews(userId: string, newsId: string, platform?: string): Promise<{ share: NewsShare; isNewShare: boolean }>;
  getNewsComments(newsId: string): Promise<any[]>;
  addNewsComment(userId: string, newsId: string, content: string): Promise<any>;

  // GDPR methods
  exportUserData(userId: string): Promise<any>;
  deleteUserData(userId: string): Promise<boolean>;
  createGdprRequest(userId: string, requestType: string, requestData?: any): Promise<any>;

  // Recovery methods
  addRecoveryMethod(userId: string, methodType: string, providerId: string, providerData?: any): Promise<any>;
  getRecoveryMethods(userId: string): Promise<any[]>;
  removeRecoveryMethod(userId: string, methodId: string): Promise<boolean>;
  authenticateWithRecoveryMethod(methodType: string, providerId: string): Promise<User | null>;

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
  getLeaderboard(limit?: number, userType?: string): Promise<User[]>;
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
  getMissionSubmissions(): Promise<any[]>;

  // Member management methods
  getAllUsers(filters?: { role?: string; active?: boolean }): Promise<any[]>;
  getUserDetails(id: string): Promise<any>;
  updateUserRole(id: string, role: string): Promise<User>;

  // News article methods
  createNewsArticle(newsArticle: InsertNewsArticle): Promise<NewsArticle>;
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticleById(id: string): Promise<NewsArticle | undefined>;
  getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined>;
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
  createModeratorPost(postData: {
    userId: string;
    postType: string;
    title?: string;
    content: string;
    categoryId?: string;
    communityId?: string;
    missionId?: string;
    targetBrandFrom?: string;
    targetBrandTo?: string;
    actionButtonText?: string;
    actionButtonUrl?: string;
    isPromotional?: boolean;
    isPinned?: boolean;
    commentsEnabled?: boolean;
    upvotesEnabled?: boolean;
    downvotesEnabled?: boolean;
    expiresAt?: string;
  }): Promise<Post>;
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

  async getUserByCookieId(cookieId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.cookieId, cookieId));
    return user || undefined;
  }

  async createAnonymousUser(handle: string, cookieId: string): Promise<User> {
    const [user] = await db.insert(users).values({
      handle,
      cookieId,
      userType: "ANONYMOUS",
      firebaseUid: null,
    }).returning();

    // Generate 8 backup codes for the new anonymous user
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await this.createBackupCodes(user.id, backupCodes);

    return user;
  }

  // Secret key authentication methods
  generateSecretKey(): string {
    // Generate 256-bit (32 bytes) secret key and encode as base64url
    return crypto.randomBytes(32).toString('base64url');
  }

  hashSecretKey(secretKey: string): string {
    // Use argon2id for secure hashing (you might want to use a proper argon2 library)
    // For now, using PBKDF2 with high iteration count
    return crypto.pbkdf2Sync(secretKey, 'jumbo-jolt-secret-salt', 100000, 64, 'sha512').toString('base64');
  }

  async createUserWithSecretKey(handle: string, state: string, secretKeyHash: string): Promise<User> {
    const [user] = await db.insert(users).values({
      handle,
      state,
      secretKeyHash,
      userType: "ANONYMOUS",
      firebaseUid: null,
    }).returning();

    // No backup codes generated for secret key users
    // Secret key is the primary authentication method

    return user;
  }

  async authenticateWithSecretKey(handle: string, secretKey: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.handle, handle));

    if (!user || !user.secretKeyHash) {
      return null;
    }

    const hashedInput = this.hashSecretKey(secretKey);
    if (hashedInput === user.secretKeyHash) {
      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return user;
    }

    return null;
  }

  async updateUserSecretKey(userId: string, secretKeyHash: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ secretKeyHash })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async migrateAnonymousToRegistered(anonymousUserId: string, firebaseUid: string, email?: string, phone?: string): Promise<User> {
    // Check if Firebase UID already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User with this Firebase UID already exists");
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmailUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmailUser.length > 0) {
        throw new Error("User with this email already exists");
      }
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhoneUser = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (existingPhoneUser.length > 0) {
        throw new Error("User with this phone number already exists");
      }
    }

    const [user] = await db
      .update(users)
      .set({
        firebaseUid,
        email,
        phone,
        userType: "REGISTERED",
        cookieId: null, // Clear cookie ID after migration
      })
      .where(eq(users.id, anonymousUserId))
      .returning();

    if (!user) {
      throw new Error("Anonymous user not found");
    }

    return user;
  }

  async createModeratorUser(insertUser: InsertUser): Promise<User> {
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

  // Recovery key methods
  async createRecoveryKey(userId: string, keyHash: string, keyDisplay: string, qrCodeData?: string): Promise<RecoveryKey> {
    const [recoveryKey] = await db.insert(recoveryKeys).values({
      userId,
      keyHash,
      keyDisplay,
      qrCodeData,
    }).returning();
    return recoveryKey;
  }

  async getRecoveryKeyByHash(keyHash: string): Promise<RecoveryKey | undefined> {
    const [recoveryKey] = await db
      .select()
      .from(recoveryKeys)
      .where(eq(recoveryKeys.keyHash, keyHash));
    return recoveryKey || undefined;
  }

  async useRecoveryKey(keyHash: string): Promise<User> {
    // Mark recovery key as used
    await db
      .update(recoveryKeys)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(recoveryKeys.keyHash, keyHash));

    // Get the user associated with this recovery key
    const [recoveryKey] = await db
      .select()
      .from(recoveryKeys)
      .where(eq(recoveryKeys.keyHash, keyHash));

    if (!recoveryKey) {
      throw new Error("Recovery key not found");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, recoveryKey.userId));

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Backup codes methods
  async createBackupCodes(userId: string, codes: string[]): Promise<BackupCode[]> {
    const backupCodesData = codes.map(code => ({
      userId,
      codeHash: crypto.createHash('sha256').update(code).digest('hex'),
      codeDisplay: code,
    }));

    const createdCodes = await db.insert(backupCodes).values(backupCodesData).returning();
    return createdCodes;
  }

  async getBackupCodes(userId: string): Promise<BackupCode[]> {
    return await db
      .select()
      .from(backupCodes)
      .where(eq(backupCodes.userId, userId));
  }

  async deleteAllBackupCodes(userId: string): Promise<void> {
    await db
      .delete(backupCodes)
      .where(eq(backupCodes.userId, userId));
  }

  async getBackupCodeByHash(codeHash: string): Promise<BackupCode | undefined> {
    const [backupCode] = await db
      .select()
      .from(backupCodes)
      .where(eq(backupCodes.codeHash, codeHash));
    return backupCode || undefined;
  }

  async verifyBackupCode(code: string, action?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const backupCode = await this.getBackupCodeByHash(codeHash);

    if (!backupCode) {
      return { success: false, error: "Invalid backup code" };
    }

    if (backupCode.isUsed) {
      return { success: false, error: "Backup code has already been used" };
    }

    // Mark the code as used
    await db
      .update(backupCodes)
      .set({
        isUsed: true,
        usedAt: new Date(),
        usedFor: action || "verification"
      })
      .where(eq(backupCodes.id, backupCode.id));

    // Get the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, backupCode.userId));

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  }

  async useBackupCodeForLogin(code: string): Promise<{ success: boolean; error?: string; user?: User }> {
    return await this.verifyBackupCode(code, "login");
  }

  async exportUserData(userId: string): Promise<any> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    // Get user's switch logs
    const userSwitchLogs = await db
      .select()
      .from(switchLogs)
      .where(eq(switchLogs.userId, userId));

    // Get user's missions
    const userMissionsData = await db
      .select()
      .from(userMissions)
      .where(eq(userMissions.userId, userId));

    // Get user's posts
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId));

    return {
      user: {
        id: user.id,
        handle: user.handle,
        email: user.email,
        phone: user.phone,
        region: user.region,
        role: user.role,
        userType: user.userType,
        points: user.points,
        level: user.level,
        switchCount: user.switchCount,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      switchLogs: userSwitchLogs,
      missions: userMissionsData,
      posts: userPosts,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteUserAccount(userId: string): Promise<void> {
    // Delete user and all related data (cascade will handle most of it)
    await db.delete(users).where(eq(users.id, userId));
  }

  async createSwitchLog(insertSwitchLog: InsertSwitchLog): Promise<SwitchLog> {
    console.log(insertSwitchLog);
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
          points: sql`${users.points} + ${switchLog.points || 0}`,
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

  async createFeedback(insertFeedback: {
    userId: string;
    fromBrands: string;
    toBrands: string;
    category: "FOOD_BEVERAGES" |
    "ELECTRONICS" |
    "FASHION" |
    "BEAUTY" |
    "HOME_GARDEN" |
    "AUTOMOTIVE" |
    "SPORTS" |
    "BOOKS_MEDIA" |
    "OTHER";
    url?: string; // Optional, as in the schema
    message: string;
    isPublic?: boolean; // Optional, defaults to false in schema
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }) {
    const [feedback] = await db.insert(switchFeedbacks).values(insertFeedback).returning();
    return feedback;
  }





  async getFeedbacks({ status, page, limit, search, sort = 'desc' }: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    page: number;
    limit: number;
    search?: string;
    sort?: 'asc' | 'desc';
  }) {
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (status) {
      whereClause = eq(switchFeedbacks.status, status);
    }
    if (search) {
      whereClause = whereClause
        ? and(whereClause, ilike(switchFeedbacks.message, `%${search}%`))
        : ilike(switchFeedbacks.message, `%${search}%`);
    }

    const feedbacks = await db
      .select()
      .from(switchFeedbacks)
      .where(whereClause)
      .orderBy(sort === 'asc' ? asc(switchFeedbacks.createdAt) : desc(switchFeedbacks.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(switchFeedbacks)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      feedbacks, // Drizzle returns an array, no need for extra Array.isArray check
      pagination: { page, limit, total, totalPages },
    };
  }

  async getActiveUsersLast24h(): Promise<number> {
    const [result] = await db
      .select({ count: countDistinct(switchLogs.userId) })
      .from(switchLogs)
      .where(sql`${switchLogs.createdAt} > NOW() - INTERVAL '24 hours'`);
    return result.count || 0;
  }

  async getActiveUsersLast7d(): Promise<number> {
    const [result] = await db
      .select({ count: countDistinct(switchLogs.userId) })
      .from(switchLogs)
      .where(sql`${switchLogs.createdAt} > NOW() - INTERVAL '7 days'`);
    return result.count || 0;

  }

  async getActiveUsersLast30d(): Promise<number> {
    const [result] = await db
      .select({ count: countDistinct(switchLogs.userId) })
      .from(switchLogs)
      .where(sql`${switchLogs.createdAt} > NOW() - INTERVAL '30 days'`);
    return result.count || 0;

  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || undefined;
  }
  async getAllBrands(): Promise<Brand[]> {
    return db.select().from(brands);
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

  async getLeaderboard(limit: number = 10, userType?: string): Promise<User[]> {
    if (userType) {
      return await db
        .select()
        .from(users)
        .where(eq(users.userType, userType as "ANONYMOUS" | "REGISTERED"))
        .orderBy(desc(users.points))
        .limit(limit);
    }

    return await db
      .select()
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);
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

  async getUserMissions(userId: string) {
    // return db
    //   .select({
    //     userMission: userMissions,
    //     mission: missions,
    //   })
    //   .from(userMissions)
    //   .leftJoin(missions, eq(userMissions.missionId, missions.id))
    //   .where(eq(userMissions.userId, userId))
    //   .orderBy(desc(userMissions.createdAt));
    return db
      .select({
        id: userMissions.id,
        missionId: userMissions.missionId,
        status: userMissions.status,
        // switchApprovalStatus
        completedAt: userMissions.completedAt,
        createdAt: userMissions.createdAt
      })
      .from(userMissions)
      // .leftJoin(switchLogs, and(eq(userMissions.missionId, switchLogs.missionId),eq( switchLogs.)))
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

  async forgotPassword(email: string): Promise<any> {
    try {
      if (!email) {
        return { error: "Email is required" };
      }

      // Check if user exists in our database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          message:
            "If an account with this email exists, a password reset link has been sent.",
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token in database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt,
      });

      const resetUrl = `${serverConfig.env.frontendUrl}/reset-password?token=${resetToken}`;

      const emailSent = await sendEmail({
        to: email,
        subject: "Password Reset Request",
        html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #EA580C; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
      });
      if (!emailSent) {
        return { error: "Failed to send password reset email" };
      } else {
        return {
          message:
            "If an account with this email exists, a password reset link has been sent.",
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return { error: "Internal server error" };
    }
  }

  async verifyResetToken(token: string): Promise<{
    error: string | null;
    valid: boolean | null;
    email: string | null;
  }> {
    // Find valid token
    const [resetToken] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
        used: passwordResetTokens.used,
        userEmail: users.email,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(passwordResetTokens.userId, users.id))
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (!resetToken) {
      return { error: "Invalid reset token", valid: null, email: null };
    }

    if (resetToken.used) {
      return {
        error: "Reset token has already been used",
        valid: null,
        email: null,
      };
    }

    if (new Date() > resetToken.expiresAt) {
      return { error: "Reset token has expired", valid: null, email: null };
    }

    return {
      error: null,
      valid: true,
      email: resetToken.userEmail,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error: string | null }> {
    // Find and validate token
    const [resetToken] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
        used: passwordResetTokens.used,
        firebaseUid: users.firebaseUid,
        userEmail: users.email,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(passwordResetTokens.userId, users.id))
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (!resetToken) {
      return { success: false, error: "Invalid reset token" };
    }

    if (resetToken.used) {
      return { success: false, error: "Reset token has already been used" };
    }

    if (new Date() > resetToken.expiresAt) {
      return { success: false, error: "Reset token has expired" };
    }

    // Update password in Firebase
    if (resetToken.firebaseUid) {
      await auth.updateUser(resetToken.firebaseUid, {
        password: newPassword,
      });

      // Revoke all refresh tokens to force re-login
      await auth.revokeRefreshTokens(resetToken.firebaseUid);
    }

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));
    return { success: true, error: null };
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

  async getNewsArticleById(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.id, id));
    return article || undefined;
  }

  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    const [article] = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.slug, slug));
    return article || undefined;
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

  // Rewards methods
  async getRewards(): Promise<Reward[]> {
    return db
      .select()
      .from(rewards)
      .where(eq(rewards.isActive, true))
      .orderBy(desc(rewards.createdAt));
  }

  async claimReward(userId: string, rewardId: string): Promise<UserReward> {
    // Check if user already claimed this reward
    const existingClaim = await db
      .select()
      .from(userRewards)
      .where(and(eq(userRewards.userId, userId), eq(userRewards.rewardId, rewardId)));

    if (existingClaim.length > 0) {
      throw new Error("Reward already claimed");
    }

    // Create user reward claim
    const [userReward] = await db.insert(userRewards).values({
      userId,
      rewardId,
      status: "CLAIMED",
    }).returning();

    // Update reward claim count
    await db
      .update(rewards)
      .set({ currentClaims: sql`${rewards.currentClaims} + 1` })
      .where(eq(rewards.id, rewardId));

    return userReward;
  }

  async getUserRewards(userId: string): Promise<UserReward[]> {
    return db
      .select()
      .from(userRewards)
      .where(eq(userRewards.userId, userId))
      .orderBy(desc(userRewards.claimedAt));
  }

  // News engagement methods
  async voteNews(userId: string, newsId: string, voteType: 'upvote' | 'downvote'): Promise<{ voted: boolean; voteType: string | null; upvotesCount: number; downvotesCount: number }> {
    // Check if user already voted
    const existingVote = await db
      .select()
      .from(newsVotes)
      .where(and(eq(newsVotes.userId, userId), eq(newsVotes.newsId, newsId)));

    if (existingVote.length > 0) {
      const currentVote = existingVote[0];
      
      if (currentVote.voteType === voteType) {
        // Remove vote (unvote)
        await db
          .delete(newsVotes)
          .where(and(eq(newsVotes.userId, userId), eq(newsVotes.newsId, newsId)));

        // Update counts
        const countField = voteType === 'upvote' ? 'upvotesCount' : 'downvotesCount';
        await db
          .update(newsArticles)
          .set({ [countField]: sql`${newsArticles[countField]} - 1` })
          .where(eq(newsArticles.id, newsId));

        // Get updated counts
        const [article] = await db
          .select({ upvotesCount: newsArticles.upvotesCount, downvotesCount: newsArticles.downvotesCount })
          .from(newsArticles)
          .where(eq(newsArticles.id, newsId));

        return {
          voted: false,
          voteType: null,
          upvotesCount: article?.upvotesCount || 0,
          downvotesCount: article?.downvotesCount || 0,
        };
      } else {
        // Change vote type
        await db
          .update(newsVotes)
          .set({ voteType, updatedAt: new Date() })
          .where(and(eq(newsVotes.userId, userId), eq(newsVotes.newsId, newsId)));

        // Update counts - decrease old vote, increase new vote
        const oldCountField = currentVote.voteType === 'upvote' ? 'upvotesCount' : 'downvotesCount';
        const newCountField = voteType === 'upvote' ? 'upvotesCount' : 'downvotesCount';
        
        await db
          .update(newsArticles)
          .set({
            [oldCountField]: sql`${newsArticles[oldCountField]} - 1`,
            [newCountField]: sql`${newsArticles[newCountField]} + 1`,
          })
          .where(eq(newsArticles.id, newsId));

        // Get updated counts
        const [article] = await db
          .select({ upvotesCount: newsArticles.upvotesCount, downvotesCount: newsArticles.downvotesCount })
          .from(newsArticles)
          .where(eq(newsArticles.id, newsId));

        return {
          voted: true,
          voteType,
          upvotesCount: article?.upvotesCount || 0,
          downvotesCount: article?.downvotesCount || 0,
        };
      }
    } else {
      // New vote
      await db.insert(newsVotes).values({ userId, newsId, voteType });

      // Update count
      const countField = voteType === 'upvote' ? 'upvotesCount' : 'downvotesCount';
      await db
        .update(newsArticles)
        .set({ [countField]: sql`${newsArticles[countField]} + 1` })
        .where(eq(newsArticles.id, newsId));

      // Get updated counts
      const [article] = await db
        .select({ upvotesCount: newsArticles.upvotesCount, downvotesCount: newsArticles.downvotesCount })
        .from(newsArticles)
        .where(eq(newsArticles.id, newsId));

      return {
        voted: true,
        voteType,
        upvotesCount: article?.upvotesCount || 0,
        downvotesCount: article?.downvotesCount || 0,
      };
    }
  }

  async getUserVote(userId: string, newsId: string): Promise<{ voteType: string } | null> {
    const [vote] = await db
      .select({ voteType: newsVotes.voteType })
      .from(newsVotes)
      .where(and(eq(newsVotes.userId, userId), eq(newsVotes.newsId, newsId)));
    
    return vote || null;
  }

  async getUserShare(userId: string, newsId: string): Promise<any> {
    const [share] = await db
      .select()
      .from(newsShares)
      .where(and(eq(newsShares.userId, userId), eq(newsShares.newsId, newsId)));
    
    return share || null;
  }

  async shareNews(userId: string, newsId: string, platform?: string): Promise<{ share: NewsShare; isNewShare: boolean }> {
    // Check if user has already shared this news
    const existingShare = await db
      .select()
      .from(newsShares)
      .where(and(eq(newsShares.userId, userId), eq(newsShares.newsId, newsId)));

    if (existingShare.length > 0) {
      // User has already shared, return existing share
      return { share: existingShare[0], isNewShare: false };
    }

    const [newsShare] = await db.insert(newsShares).values({
      userId,
      newsId,
      platform,
    }).returning();

    // Increase share count
    await db
      .update(newsArticles)
      .set({ sharesCount: sql`${newsArticles.sharesCount} + 1` })
      .where(eq(newsArticles.id, newsId));

    return { share: newsShare, isNewShare: true };
  }

  async getNewsComments(newsId: string): Promise<any[]> {
    return db
      .select({
        id: comments.id,
        content: comments.content,
        status: comments.status,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          handle: users.handle,
          userType: users.userType,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
        eq(comments.newsId, newsId), 
        // eq(comments.status, "APPROVED")
      ))
      .orderBy(desc(comments.createdAt));
  }

  async addNewsComment(userId: string, newsId: string, content: string): Promise<Comment> {
    const [comment] = await db.insert(comments).values({
      userId,
      newsId,
      content,
      status: "PENDING",
    }).returning();

    // Increase comment count
    await db
      .update(newsArticles)
      .set({ commentsCount: sql`${newsArticles.commentsCount} + 1` })
      .where(eq(newsArticles.id, newsId));

    return comment;
  }

  // GDPR methods

  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // Delete all user-related data
      await db.delete(comments).where(eq(comments.userId, userId));
      await db.delete(likes).where(eq(likes.userId, userId));
      await db.delete(posts).where(eq(posts.userId, userId));
      await db.delete(switchLogs).where(eq(switchLogs.userId, userId));
      await db.delete(userRewards).where(eq(userRewards.userId, userId));
      await db.delete(newsVotes).where(eq(newsVotes.userId, userId));
      await db.delete(newsShares).where(eq(newsShares.userId, userId));
      await db.delete(recoveryKeys).where(eq(recoveryKeys.userId, userId));
      await db.delete(gdprRequests).where(eq(gdprRequests.userId, userId));

      // Finally delete the user
      await db.delete(users).where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error("Error deleting user data:", error);
      return false;
    }
  }

  async createGdprRequest(userId: string, requestType: string, requestData?: any): Promise<GdprRequest> {
    const [gdprRequest] = await db.insert(gdprRequests).values({
      userId,
      requestType,
      requestData,
      status: "PENDING",
    }).returning();
    return gdprRequest;
  }

  // Recovery methods
  async addRecoveryMethod(userId: string, methodType: string, providerId: string, providerData?: any): Promise<any> {
    const [recoveryMethod] = await db.insert(recoveryMethods).values({
      userId,
      methodType,
      providerId,
      providerData,
    }).returning();
    return recoveryMethod;
  }

  async getRecoveryMethods(userId: string): Promise<any[]> {
    return await db.select().from(recoveryMethods).where(eq(recoveryMethods.userId, userId));
  }

  async removeRecoveryMethod(userId: string, methodId: string): Promise<boolean> {
    const result = await db.delete(recoveryMethods)
      .where(and(
        eq(recoveryMethods.id, methodId),
        eq(recoveryMethods.userId, userId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async authenticateWithRecoveryMethod(methodType: string, providerId: string): Promise<User | null> {
    const [recoveryMethod] = await db.select()
      .from(recoveryMethods)
      .where(and(
        eq(recoveryMethods.methodType, methodType),
        eq(recoveryMethods.providerId, providerId)
      ));

    if (!recoveryMethod) {
      return null;
    }

    // Update last used timestamp
    await db.update(recoveryMethods)
      .set({ lastUsedAt: new Date() })
      .where(eq(recoveryMethods.id, recoveryMethod.id));

    // Get the user
    const user = await this.getUser(recoveryMethod.userId);
    return user || null;
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

  // Mission methods for interface compliance
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

  // Moderator post creation methods
  async createModeratorPost(postData: {
    userId: string;
    postType: string;
    title?: string;
    content: string;
    categoryId?: string;
    communityId?: string;
    missionId?: string;
    targetBrandFrom?: string;
    targetBrandTo?: string;
    actionButtonText?: string;
    actionButtonUrl?: string;
    tags?: string[];
    imageUrl?: string;
    isPinned?: boolean;
    expiresAt?: string;
  }): Promise<any> {
    const [post] = await db
      .insert(posts)
      .values({
        userId: postData.userId,
        postType: postData.postType as any,
        title: postData.title,
        content: postData.content,
        categoryId: postData.categoryId,
        communityId: postData.communityId,
        missionId: postData.missionId,
        targetBrandFrom: postData.targetBrandFrom,
        targetBrandTo: postData.targetBrandTo,
        actionButtonText: postData.actionButtonText,
        actionButtonUrl: postData.actionButtonUrl,
        tags: postData.tags,
        imageUrl: postData.imageUrl,
        isPinned: postData.isPinned || false,
        expiresAt: postData.expiresAt ? new Date(postData.expiresAt) : null,
      })
      .returning();
    return post;
  }

  async getAllModeratorPosts(): Promise<ModeratorPost[]> {
    return db
      .select()
      .from(moderatorPosts)
      .orderBy(desc(moderatorPosts.createdAt));
  }

  async getAllPostsWithDetails(): Promise<any[]> {
    const result = await db
      .select({
        post: posts,
        user: {
          id: users.id,
          handle: users.handle,
          role: users.role,
        },
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
        },
        community: {
          id: communities.id,
          name: communities.name,
        },
        mission: {
          id: missions.id,
          title: missions.title,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .leftJoin(missions, eq(posts.missionId, missions.id))
      .orderBy(desc(posts.createdAt));

    return result;
  }

  async getPostsByType(postType: string): Promise<any[]> {
    const result = await db
      .select({
        post: posts,
        user: {
          id: users.id,
          handle: users.handle,
          role: users.role,
        },
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
        },
        community: {
          id: communities.id,
          name: communities.name,
        },
        mission: {
          id: missions.id,
          title: missions.title,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .leftJoin(communities, eq(posts.communityId, communities.id))
      .leftJoin(missions, eq(posts.missionId, missions.id))
      .where(eq(posts.postType, postType as any))
      .orderBy(desc(posts.createdAt));

    return result;
  }

  async incrementSwitchLogCount(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({ switchLogsCount: sql`${posts.switchLogsCount} + 1` })
      .where(eq(posts.id, postId));
  }

  async createSwitchLogFromPost(data: {
    userId: string;
    postId?: string;
    fromBrandId?: string;
    toBrandId?: string;
    category: string;
    reason: string;
    categoryId?: string;
    communityId?: string;
    tags?: string[];
  }): Promise<any> {
    const [switchLog] = await db
      .insert(switchLogs)
      .values({
        userId: data.userId,
        fromBrandId: data.fromBrandId,
        toBrandId: data.toBrandId,
        category: data.category as any,
        reason: data.reason,
        categoryId: data.categoryId,
        communityId: data.communityId,
        tags: data.tags,
        status: "PENDING",
      })
      .returning();

    // If this switch log was created from a post, increment the count
    if (data.postId) {
      await this.incrementSwitchLogCount(data.postId);
    }

    return switchLog;
  }

  async getAllNewsArticles(): Promise<any[]> {
    try {
      // First, get actual articles from database
      const articles = await db
        .select()
        .from(newsArticles)
        .orderBy(desc(newsArticles.publishedAt));

      // Enhance articles with brand names
      const enhancedArticles = await Promise.all(
        articles.map(async (article) => {
          let fromBrands: any[] = [];
          let toBrands: any[] = [];

          // Handle from brands
          if (
            article.suggestedFromBrandIds &&
            Array.isArray(article.suggestedFromBrandIds) &&
            article.suggestedFromBrandIds.length > 0
          ) {
            try {
              fromBrands = await db
                .select()
                .from(brands)
                .where(
                  sql`${brands.id} IN (${sql.join(
                    article.suggestedFromBrandIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                );
            } catch (error) {
              console.error("Error fetching from brands:", error);
            }
          }

          // Handle to brands
          if (
            article.suggestedToBrandIds &&
            Array.isArray(article.suggestedToBrandIds) &&
            article.suggestedToBrandIds.length > 0
          ) {
            try {
              toBrands = await db
                .select()
                .from(brands)
                .where(
                  sql`${brands.id} IN (${sql.join(
                    article.suggestedToBrandIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                );
            } catch (error) {
              console.error("Error fetching to brands:", error);
            }
          }

          return {
            ...article,
            fromBrands,
            toBrands,
          };
        })
      );

      // If no articles exist, return sample data for demonstration
      if (enhancedArticles.length === 0) {
        return [
          {
            id: "sample-1",
            title: "Top 10 Indian Smartphone Brands Gaining Market Share",
            description:
              "Discover how Indian smartphone manufacturers like Lava, Micromax, and others are making significant strides in the domestic market, offering quality alternatives to foreign brands.",
            imageUrls: null,
            suggestedFromBrandIds: null,
            suggestedToBrandIds: null,
            commentsEnabled: true,
            isPublished: true,
            publishedAt: new Date(
              Date.now() - 2 * 60 * 60 * 1000
            ).toISOString(), // 2 hours ago
            createdBy: "admin",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            fromBrands: [
              {
                id: "1",
                name: "Samsung",
                country: "South Korea",
                isIndian: false,
              },
            ],
            toBrands: [
              { id: "2", name: "Lava", country: "India", isIndian: true },
              { id: "3", name: "Micromax", country: "India", isIndian: true },
            ],
          },
          {
            id: "sample-2",
            title: "Indian Fashion Industry: Local Brands vs Global Giants",
            description:
              "An in-depth analysis of how Indian fashion brands are competing with international companies, focusing on traditional wear, sustainable fashion, and price competitiveness.",
            imageUrls: null,
            suggestedFromBrandIds: null,
            suggestedToBrandIds: null,
            commentsEnabled: true,
            isPublished: true,
            publishedAt: new Date(
              Date.now() - 4 * 60 * 60 * 1000
            ).toISOString(), // 4 hours ago
            createdBy: "admin",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            fromBrands: [
              { id: "4", name: "Zara", country: "Spain", isIndian: false },
              { id: "5", name: "H&M", country: "Sweden", isIndian: false },
            ],
            toBrands: [
              { id: "6", name: "Fabindia", country: "India", isIndian: true },
              { id: "7", name: "Biba", country: "India", isIndian: true },
            ],
          },
          {
            id: "sample-3",
            title: "Consumer Electronics: Make in India Success Stories",
            description:
              "Highlighting successful Indian electronics manufacturers who are providing quality alternatives in categories like televisions, home appliances, and audio equipment.",
            imageUrls: null,
            suggestedFromBrandIds: null,
            suggestedToBrandIds: null,
            commentsEnabled: true,
            isPublished: true,
            publishedAt: new Date(
              Date.now() - 6 * 60 * 60 * 1000
            ).toISOString(), // 6 hours ago
            createdBy: "admin",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "sample-4",
            title:
              "Food & Beverages: Supporting Local Brands for Healthier Choices",
            description:
              "Explore how switching to local food and beverage brands not only supports the Indian economy but also often provides healthier, more authentic products.",
            imageUrls: null,
            suggestedFromBrandIds: null,
            suggestedToBrandIds: null,
            commentsEnabled: false,
            isPublished: true,
            publishedAt: new Date(
              Date.now() - 8 * 60 * 60 * 1000
            ).toISOString(), // 8 hours ago
            createdBy: "admin",
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "sample-5",
            title: "Automotive Sector: Indian Car Manufacturers Rising",
            description:
              "A comprehensive look at how Indian automotive companies are innovating and competing in both domestic and international markets with affordable, efficient vehicles.",
            imageUrls: null,
            suggestedFromBrandIds: null,
            suggestedToBrandIds: null,
            commentsEnabled: true,
            isPublished: true,
            publishedAt: new Date(
              Date.now() - 12 * 60 * 60 * 1000
            ).toISOString(), // 12 hours ago
            createdBy: "admin",
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
        ];
      }

      return enhancedArticles;
    } catch (error) {
      console.error("Error in getAllNewsArticles:", error);
      // Return sample data if database query fails
      return [
        {
          id: "sample-1",
          title: "Top 10 Indian Smartphone Brands Gaining Market Share",
          description:
            "Discover how Indian smartphone manufacturers like Lava, Micromax, and others are making significant strides in the domestic market, offering quality alternatives to foreign brands.",
          imageUrls: null,
          suggestedFromBrandIds: null,
          suggestedToBrandIds: null,
          commentsEnabled: true,
          isPublished: true,
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdBy: "admin",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          fromBrands: [
            {
              id: "1",
              name: "Samsung",
              country: "South Korea",
              isIndian: false,
            },
          ],
          toBrands: [
            { id: "2", name: "Lava", country: "India", isIndian: true },
            { id: "3", name: "Micromax", country: "India", isIndian: true },
          ],
        },
        {
          id: "sample-2",
          title: "Indian Fashion Industry: Local Brands vs Global Giants",
          description:
            "An in-depth analysis of how Indian fashion brands are competing with international companies, focusing on traditional wear, sustainable fashion, and price competitiveness.",
          imageUrls: null,
          suggestedFromBrandIds: null,
          suggestedToBrandIds: null,
          commentsEnabled: true,
          isPublished: true,
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          createdBy: "admin",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          fromBrands: [
            { id: "4", name: "Zara", country: "Spain", isIndian: false },
          ],
          toBrands: [
            { id: "6", name: "Fabindia", country: "India", isIndian: true },
          ],
        },
      ];
    }
  }

  async getAllMissions(): Promise<any[]> {
    try {
      const allMissions = await db
        .select({
          id: missions.id,
          title: missions.title,
          description: missions.description,
          targetCategory: missions.targetCategory,
          pointsReward: missions.pointsReward,
          startDate: missions.startDate,
          endDate: missions.endDate,
          status: missions.status,
          impact: missions.impact,
          fromBrandIds: missions.fromBrandIds,
          toBrandIds: missions.toBrandIds,
        })
        .from(missions)
        .where(sql`${missions.isActive} = true`)
        .orderBy(desc(missions.startDate));

      // Enhance missions with brand names
      const enhancedMissions = await Promise.all(
        allMissions.map(async (mission) => {
          let fromBrands: any[] = [];
          let toBrands: any[] = [];

          // Handle from brands
          if (
            mission.fromBrandIds &&
            Array.isArray(mission.fromBrandIds) &&
            mission.fromBrandIds.length > 0
          ) {
            try {
              fromBrands = await db
                .select()
                .from(brands)
                .where(
                  sql`${brands.id} IN (${sql.join(
                    mission.fromBrandIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                );
            } catch (error) {
              console.error("Error fetching mission from brands:", error);
            }
          }

          // Handle to brands
          if (
            mission.toBrandIds &&
            Array.isArray(mission.toBrandIds) &&
            mission.toBrandIds.length > 0
          ) {
            try {
              toBrands = await db
                .select()
                .from(brands)
                .where(
                  sql`${brands.id} IN (${sql.join(
                    mission.toBrandIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                );
            } catch (error) {
              console.error("Error fetching mission to brands:", error);
            }
          }

          return {
            ...mission,
            fromBrands,
            toBrands,
          };
        })
      );

      // If no missions exist, return sample data
      if (enhancedMissions.length === 0) {
        return [
          {
            id: "mission-1",
            title: "Switch to Indian Electronics",
            description:
              "Join the mission to support Indian electronics brands and reduce dependency on foreign imports.",
            targetCategory: "ELECTRONICS",
            pointsReward: 100,
            startDate: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            endDate: new Date(
              Date.now() + 23 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "ACTIVE",
            impact: "HIGH",
            fromBrands: [
              { id: "8", name: "Apple", country: "USA", isIndian: false },
              { id: "9", name: "Sony", country: "Japan", isIndian: false },
            ],
            toBrands: [
              { id: "10", name: "Boat", country: "India", isIndian: true },
              { id: "11", name: "Noise", country: "India", isIndian: true },
            ],
          },
          {
            id: "mission-2",
            title: "Support Indian Food Brands",
            description:
              "Discover and switch to authentic Indian food and beverage brands for healthier, local options.",
            targetCategory: "FOOD_BEVERAGES",
            pointsReward: 75,
            startDate: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            endDate: new Date(
              Date.now() + 27 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "ACTIVE",
            impact: "MEDIUM",
            fromBrands: [
              { id: "12", name: "Coca-Cola", country: "USA", isIndian: false },
              {
                id: "13",
                name: "Nestlé",
                country: "Switzerland",
                isIndian: false,
              },
            ],
            toBrands: [
              {
                id: "14",
                name: "Paper Boat",
                country: "India",
                isIndian: true,
              },
              {
                id: "15",
                name: "Haldiram's",
                country: "India",
                isIndian: true,
              },
            ],
          },
        ];
      }

      return enhancedMissions;
    } catch (error) {
      console.error("Error in getAllMissions:", error);
      // Return sample data if database query fails
      return [
        {
          id: "mission-1",
          title: "Switch to Indian Electronics",
          description:
            "Join the mission to support Indian electronics brands and reduce dependency on foreign imports.",
          targetCategory: "ELECTRONICS",
          pointsReward: 100,
          startDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date(
            Date.now() + 23 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "ACTIVE",
          impact: "HIGH",
          fromBrands: [
            { id: "8", name: "Apple", country: "USA", isIndian: false },
          ],
          toBrands: [
            { id: "10", name: "Boat", country: "India", isIndian: true },
          ],
        },
      ];
    }
  }

  async getOngoingMissions(): Promise<any[]> {
    try {
      const now = new Date();
      const activeMissions = await db
        .select({
          id: missions.id,
          title: missions.title,
          description: missions.description,
          targetCategory: missions.targetCategory,
          pointsReward: missions.pointsReward,
          startDate: missions.startDate,
          endDate: missions.endDate,
          status: missions.status,
          impact: missions.impact,
          fromBrandIds: missions.fromBrandIds,
          toBrandIds: missions.toBrandIds,
        })
        .from(missions)
        .where(
          sql`${missions.status} = 'ACTIVE' AND ${missions.isActive} = true AND (${missions.endDate} IS NULL OR ${missions.endDate} > ${now})`
        )
        .orderBy(desc(missions.startDate));

      // Enhance missions with brand names
      const enhancedMissions = await Promise.all(
        activeMissions.map(async (mission) => {
          let fromBrands: any[] = [];
          let toBrands: any[] = [];

          // Handle from brands
          if (
            mission.fromBrandIds &&
            Array.isArray(mission.fromBrandIds) &&
            mission.fromBrandIds.length > 0
          ) {
            try {
              fromBrands = await db
                .select()
                .from(brands)
                .where(
                  sql`${brands.id} IN (${sql.join(
                    mission.fromBrandIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                );
            } catch (error) {
              console.error("Error fetching mission from brands:", error);
            }
          }

          // Handle to brands
          if (
            mission.toBrandIds &&
            Array.isArray(mission.toBrandIds) &&
            mission.toBrandIds.length > 0
          ) {
            try {
              toBrands = await db
                .select()
                .from(brands)
                .where(
                  sql`${brands.id} IN (${sql.join(
                    mission.toBrandIds.map((id) => sql`${id}`),
                    sql`, `
                  )})`
                );
            } catch (error) {
              console.error("Error fetching mission to brands:", error);
            }
          }

          return {
            ...mission,
            fromBrands,
            toBrands,
          };
        })
      );

      // If no missions exist, return sample data
      if (enhancedMissions.length === 0) {
        return [
          {
            id: "mission-1",
            title: "Switch to Indian Electronics",
            description:
              "Join the mission to support Indian electronics brands and reduce dependency on foreign imports.",
            targetCategory: "ELECTRONICS",
            pointsReward: 100,
            startDate: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 7 days ago
            endDate: new Date(
              Date.now() + 23 * 24 * 60 * 60 * 1000
            ).toISOString(), // 23 days from now
            status: "ACTIVE",
            impact: "HIGH",
            fromBrands: [
              { id: "8", name: "Apple", country: "USA", isIndian: false },
              { id: "9", name: "Sony", country: "Japan", isIndian: false },
            ],
            toBrands: [
              { id: "10", name: "Boat", country: "India", isIndian: true },
              { id: "11", name: "Noise", country: "India", isIndian: true },
            ],
          },
          {
            id: "mission-2",
            title: "Support Indian Food Brands",
            description:
              "Discover and switch to authentic Indian food and beverage brands for healthier, local options.",
            targetCategory: "FOOD_BEVERAGES",
            pointsReward: 75,
            startDate: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(), // 3 days ago
            endDate: new Date(
              Date.now() + 27 * 24 * 60 * 60 * 1000
            ).toISOString(), // 27 days from now
            status: "ACTIVE",
            impact: "MEDIUM",
            fromBrands: [
              { id: "12", name: "Coca-Cola", country: "USA", isIndian: false },
              {
                id: "13",
                name: "Nestlé",
                country: "Switzerland",
                isIndian: false,
              },
            ],
            toBrands: [
              {
                id: "14",
                name: "Paper Boat",
                country: "India",
                isIndian: true,
              },
              {
                id: "15",
                name: "Haldiram's",
                country: "India",
                isIndian: true,
              },
            ],
          },
        ];
      }

      return enhancedMissions;
    } catch (error) {
      console.error("Error in getOngoingMissions:", error);
      // Return sample data if database query fails
      return [
        {
          id: "mission-1",
          title: "Switch to Indian Electronics",
          description:
            "Join the mission to support Indian electronics brands and reduce dependency on foreign imports.",
          targetCategory: "ELECTRONICS",
          pointsReward: 100,
          startDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          endDate: new Date(
            Date.now() + 23 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "ACTIVE",
          impact: "HIGH",
          fromBrands: [
            { id: "8", name: "Apple", country: "USA", isIndian: false },
          ],
          toBrands: [
            { id: "10", name: "Boat", country: "India", isIndian: true },
          ],
        },
      ];
    }
  }

  // async getUserMissions(userId: string): Promise<any[]> {
  //   try {
  //     const userMissionsList = await db.select().from(userMissions).where(eq(userMissions.userId, userId));
  //     return userMissionsList;
  //   } catch (error) {
  //     console.error('Error getting user missions:', error);
  //     return [];
  //   }
  // }

  // let imageUrl: string | File = values.image || "";

  // let imageLink: string;

  // // If the image is a File, upload it to MinIO first
  // if (values.image instanceof File) {
  //   const uploadResponse = await uploadImage(values.image);
  //   if (uploadResponse.success && uploadResponse.url) {
  //     imageUrl = uploadResponse.url; // Convert File to string URL
  //   } else {
  //     console.error("Image upload failed:", uploadResponse.error);
  //     return; // Stop submission if upload fails
  //   }
  // }
  async uploadImage(file: File): Promise<any> {
    const uploadResponse = await uploadImage(file);
    return uploadResponse;
  }

  async joinMission(userId: string, missionId: string): Promise<any> {
    try {
      // Check if user already joined this mission
      const existing = await db
        .select()
        .from(userMissions)
        .where(
          and(
            eq(userMissions.userId, userId),
            eq(userMissions.missionId, missionId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("You have already joined this mission");
      }

      const [userMission] = await db
        .insert(userMissions)
        .values({
          userId,
          missionId,
          status: "STARTED",
        })
        .returning();

      return userMission;
    } catch (error) {
      console.error("Error joining mission:", error);
      throw error;
    }
  }

  async submitMissionSwitchLog(
    userId: string,
    missionId: string,
    switchLogData: any
  ): Promise<any> {
    try {
      // Check if user has joined this mission
      console.log(
        "Checking user mission for userId:",
        userId,
        "missionId:",
        missionId
      );
      const userMission = await db
        .select({ id: userMissions.id, status: userMissions.status })
        .from(userMissions)
        .where(
          and(
            eq(userMissions.userId, userId),
            eq(userMissions.missionId, missionId)
          )
        )
        .limit(1);


      if (userMission.length === 0) {
        throw new Error("You must join the mission first");
      }

      if (userMission[0].status !== "STARTED") {
        throw new Error("Mission already completed or failed");
      }

      // Create switch log with mission reference
      const switchLog = await this.createSwitchLog({
        userId,
        toBrandId: switchLogData.targetBrandFrom,
        fromBrandId: switchLogData.targetBrandTo,
        reason: switchLogData.reason,
        category: switchLogData.category,
        experience: switchLogData.experience,
        financialImpact: switchLogData.financialImpact,
        evidenceUrl: switchLogData.evidenceUrl,
        missionId,
        status: "PENDING",
      });

      const updateUserMission = await db
        .update(userMissions)
        .set({ status: "SUBMITTED" })
        .where(eq(userMissions.id, userMission[0].id));


      return { switchLog, updateUserMission };
    } catch (error) {
      console.error("Error submitting mission switch log:", error);
      throw error;
    }
  }

  async verifyMissionSwitchLog(
    switchLogId: string,
    moderatorId: string,
    approved: boolean,
    feedback?: string
  ): Promise<any> {
    try {
      // Get the switch log
      const [switchLog] = await db
        .select()
        .from(switchLogs)
        .where(eq(switchLogs.id, switchLogId));

      if (!switchLog) {
        throw new Error("Switch log not found");
      }

      if (!switchLog.missionId) {
        throw new Error("This switch log is not associated with a mission");
      }

      // Update switch log status
      const newStatus = approved ? "APPROVED" : "REJECTED";
      const updateData: any = {
        status: newStatus,
        moderatorNotes: feedback,
        approvedAt: new Date(),
      };

      // Only set moderatorId if it's not null and the user exists
      if (moderatorId) {
        updateData.moderatorId = moderatorId;
      }

      await db
        .update(switchLogs)
        .set(updateData)
        .where(eq(switchLogs.id, switchLogId));

      // Get mission details for points calculation
      const [mission] = await db
        .select()
        .from(missions)
        .where(eq(missions.id, switchLog.missionId));

      // If approved, complete the user mission and award points
      if (approved && mission && switchLog.userId) {
        // Update user mission status
        await db
          .update(userMissions)
          .set({
            status: "COMPLETED",
            completedAt: new Date(),
          })
          .where(
            and(
              eq(userMissions.userId, switchLog.userId),
              eq(userMissions.missionId, switchLog.missionId)
            )
          );

        // Award points to user
        await db
          .update(users)
          .set({
            points: sql`${users.points} + ${mission.pointsReward}`,
          })
          .where(eq(users.id, switchLog.userId));
      } else if (!approved && switchLog.userId) {
        // Mark mission as failed
        await db
          .update(userMissions)
          .set({ status: "FAILED" })
          .where(
            and(
              eq(userMissions.userId, switchLog.userId),
              eq(userMissions.missionId, switchLog.missionId)
            )
          );
      }

      const pointsAwarded = approved && mission ? mission.pointsReward : 0;
      return { success: true, approved, pointsAwarded };
    } catch (error) {
      console.error("Error verifying mission switch log:", error);
      throw error;
    }
  }

  async getMissionSubmissions(): Promise<any[]> {
    try {
      console.log("Fetching mission submissions...");

      // Get all switch logs that are related to missions and pending verification
      const submissions = await db
        .select({
          id: switchLogs.id,
          userId: switchLogs.userId,
          missionId: switchLogs.missionId,
          reason: switchLogs.reason,
          experience: switchLogs.experience,
          financialImpact: switchLogs.financialImpact,
          evidenceUrl: switchLogs.evidenceUrl,
          status: switchLogs.status,
          createdAt: switchLogs.createdAt,
          userName: users.handle,
          missionTitle: missions.title,
        })
        .from(switchLogs)
        .leftJoin(users, eq(switchLogs.userId, users.id))
        .leftJoin(missions, eq(switchLogs.missionId, missions.id))
        .where(
          sql`${switchLogs.missionId} IS NOT NULL AND ${switchLogs.status} = 'PENDING'`
        )
        .orderBy(desc(switchLogs.createdAt));

      console.log("Found mission submissions:", submissions.length);
      return submissions;
    } catch (error) {
      console.error("Error fetching mission submissions:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
