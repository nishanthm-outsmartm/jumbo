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
  leaderboardSnapshots,
  moderationReports,
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
  type InsertModerationReport
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
  getUserReaction(userId: string, postId: string, type: string): Promise<boolean>;

  // Leaderboard methods
  getLeaderboard(limit?: number, period?: string): Promise<User[]>;
  getWeeklyLeaderboard(limit?: number): Promise<LeaderboardSnapshot[]>;
  getMonthlyLeaderboard(limit?: number): Promise<LeaderboardSnapshot[]>;
  getTrendingBrands(): Promise<any[]>;
  getTrendingCategories(): Promise<any[]>;

  // Admin methods
  getTargetSuggestions(status?: string): Promise<TargetSuggestion[]>;
  updateTargetSuggestion(id: string, updates: Partial<TargetSuggestion>): Promise<TargetSuggestion>;
  createTargetSuggestion(suggestion: InsertTargetSuggestion): Promise<TargetSuggestion>;
  
  // Moderation methods
  getModerationReports(status?: string): Promise<any[]>;
  createModerationReport(report: InsertModerationReport): Promise<ModerationReport>;
  updateModerationReport(id: string, updates: Partial<ModerationReport>): Promise<ModerationReport>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByHandle(handle: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.handle, handle));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async createSwitchLog(insertSwitchLog: InsertSwitchLog): Promise<SwitchLog> {
    const [switchLog] = await db.insert(switchLogs).values(insertSwitchLog).returning();
    
    // Update user stats
    if (switchLog.userId) {
      await db.update(users)
        .set({
          switchCount: sql`${users.switchCount} + 1`,
          points: sql`${users.points} + ${switchLog.points || 25}`
        })
        .where(eq(users.id, switchLog.userId));
    }
    
    return switchLog;
  }

  async getUserSwitchLogs(userId: string): Promise<SwitchLog[]> {
    return db.select()
      .from(switchLogs)
      .where(eq(switchLogs.userId, userId))
      .orderBy(desc(switchLogs.createdAt));
  }

  async getPublicSwitchLogs(limit: number = 10): Promise<SwitchLog[]> {
    return db.select()
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
          points: users.points
        },
        switchLog: switchLogs,
        fromBrand: {
          id: brands.id,
          name: brands.name,
          country: brands.country,
          isIndian: brands.isIndian
        },
        toBrand: {
          id: brands.id,
          name: brands.name,
          country: brands.country,
          isIndian: brands.isIndian
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(switchLogs, eq(posts.switchLogId, switchLogs.id))
      .leftJoin(brands, eq(switchLogs.fromBrandId, brands.id))
      .leftJoin(brands as any, eq(switchLogs.toBrandId, brands.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return feedPosts;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const [post] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
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
    return db.select()
      .from(brands)
      .where(sql`${brands.name} ILIKE ${'%' + query + '%'}`)
      .limit(10);
  }

  async toggleLike(userId: string, postId: string): Promise<boolean> {
    const existingLike = await db.select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Remove like
      await db.delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
      
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
      
      return false;
    } else {
      // Add like
      await db.insert(likes).values({ userId, postId });
      
      await db.update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));
      
      return true;
    }
  }

  async addComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    
    // Update comment count on post
    await db.update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, insertComment.postId));
    
    return comment;
  }

  async getPostComments(postId: string): Promise<any[]> {
    const results = await db
      .select({
        comment: comments,
        user: {
          id: users.id,
          handle: users.handle
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
    
    return results;
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return db.select()
      .from(users)
      .orderBy(desc(users.points))
      .limit(limit);
  }

  async getTrendingBrands(): Promise<any[]> {
    return db.select({
      brand: brands,
      switchCount: count(switchLogs.id)
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

  async updateTargetSuggestion(id: string, updates: Partial<TargetSuggestion>): Promise<TargetSuggestion> {
    const [suggestion] = await db.update(targetSuggestions)
      .set(updates)
      .where(eq(targetSuggestions.id, id))
      .returning();
    return suggestion;
  }

  async createTargetSuggestion(insertSuggestion: InsertTargetSuggestion): Promise<TargetSuggestion> {
    const [suggestion] = await db.insert(targetSuggestions).values(insertSuggestion).returning();
    return suggestion;
  }

  // Enhanced social interactions
  async addReaction(insertReaction: InsertReaction): Promise<Reaction> {
    // Remove existing reaction of this type by this user for this post
    await db.delete(reactions)
      .where(and(
        eq(reactions.userId, insertReaction.userId),
        eq(reactions.postId, insertReaction.postId),
        eq(reactions.type, insertReaction.type)
      ));

    const [reaction] = await db.insert(reactions).values(insertReaction).returning();
    return reaction;
  }

  async getPostReactions(postId: string): Promise<any[]> {
    const reactionCounts = await db
      .select({
        type: reactions.type,
        count: sql`count(*)::int`.as('count')
      })
      .from(reactions)
      .where(eq(reactions.postId, postId))
      .groupBy(reactions.type);
    
    return reactionCounts;
  }

  async getUserReaction(userId: string, postId: string, type: string): Promise<boolean> {
    const [reaction] = await db.select()
      .from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.postId, postId),
        eq(reactions.type, type)
      ))
      .limit(1);
    
    return !!reaction;
  }

  // Enhanced leaderboards
  async getWeeklyLeaderboard(limit: number = 10): Promise<LeaderboardSnapshot[]> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentWeek = Math.ceil((currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    return db.select()
      .from(leaderboardSnapshots)
      .where(and(
        eq(leaderboardSnapshots.period, 'weekly'),
        eq(leaderboardSnapshots.year, currentYear),
        eq(leaderboardSnapshots.week, currentWeek)
      ))
      .orderBy(leaderboardSnapshots.rank)
      .limit(limit);
  }

  async getMonthlyLeaderboard(limit: number = 10): Promise<LeaderboardSnapshot[]> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    return db.select()
      .from(leaderboardSnapshots)
      .where(and(
        eq(leaderboardSnapshots.period, 'monthly'),
        eq(leaderboardSnapshots.year, currentYear),
        eq(leaderboardSnapshots.month, currentMonth)
      ))
      .orderBy(leaderboardSnapshots.rank)
      .limit(limit);
  }

  async getTrendingCategories(): Promise<any[]> {
    return db.select({
      category: switchLogs.category,
      switchCount: sql`count(*)::int`.as('switchCount'),
      recentSwitches: sql`count(case when ${switchLogs.createdAt} > NOW() - interval '24 hours' then 1 end)::int`.as('recentSwitches')
    })
      .from(switchLogs)
      .where(sql`${switchLogs.createdAt} > NOW() - INTERVAL '7 days'`)
      .groupBy(switchLogs.category)
      .orderBy(sql`count(*) DESC`)
      .limit(8);
  }

  // Moderation methods
  async getModerationReports(status?: string): Promise<any[]> {
    const query = db.select({
      report: moderationReports,
      reporter: {
        id: users.id,
        handle: users.handle
      },
      moderator: {
        id: users.id,
        handle: users.handle
      }
    })
      .from(moderationReports)
      .leftJoin(users, eq(moderationReports.reporterId, users.id));

    if (status) {
      return query.where(eq(moderationReports.status, status))
        .orderBy(desc(moderationReports.createdAt));
    }
    
    return query.orderBy(desc(moderationReports.createdAt));
  }

  async createModerationReport(insertReport: InsertModerationReport): Promise<ModerationReport> {
    const [report] = await db.insert(moderationReports).values(insertReport).returning();
    return report;
  }

  async updateModerationReport(id: string, updates: Partial<ModerationReport>): Promise<ModerationReport> {
    const [report] = await db.update(moderationReports)
      .set(updates)
      .where(eq(moderationReports.id, id))
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();
