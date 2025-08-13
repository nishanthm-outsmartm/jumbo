import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  boolean, 
  timestamp, 
  jsonb,
  pgEnum 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['MEMBER', 'MODERATOR', 'STRATEGIST', 'ADMIN']);
export const switchCategoryEnum = pgEnum('switch_category', [
  'FOOD_BEVERAGES', 
  'ELECTRONICS', 
  'FASHION', 
  'BEAUTY', 
  'HOME_GARDEN',
  'AUTOMOTIVE',
  'SPORTS',
  'BOOKS_MEDIA',
  'OTHER'
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: varchar("firebase_uid").notNull().unique(),
  phone: varchar("phone"),
  email: varchar("email"),
  handle: varchar("handle").notNull().unique(),
  region: varchar("region"),
  role: userRoleEnum("role").default('MEMBER'),
  points: integer("points").default(0),
  level: integer("level").default(1),
  switchCount: integer("switch_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at")
});

// Public aliases for social sharing
export const publicAliases = pgTable("public_aliases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar("platform").notNull(), // 'twitter', 'whatsapp', etc.
  aliasName: varchar("alias_name").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Brands table
export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  company: varchar("company"),
  country: varchar("country"),
  isIndian: boolean("is_indian").default(false),
  category: switchCategoryEnum("category"),
  logoUrl: varchar("logo_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Switch logs
export const switchLogs = pgTable("switch_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  fromBrandId: varchar("from_brand_id").references(() => brands.id),
  toBrandId: varchar("to_brand_id").references(() => brands.id),
  category: switchCategoryEnum("category"),
  reason: text("reason"),
  evidenceUrl: varchar("evidence_url"),
  isPublic: boolean("is_public").default(false),
  points: integer("points").default(25),
  createdAt: timestamp("created_at").defaultNow()
});

// Reactions table for enhanced social interactions
export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'like', 'love', 'fire', 'celebrate', 'support'
  createdAt: timestamp("created_at").defaultNow()
});

// Weekly/Monthly leaderboard snapshots
export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  period: varchar("period").notNull(), // 'weekly', 'monthly'
  year: integer("year").notNull(),
  week: integer("week"), // for weekly snapshots
  month: integer("month"), // for monthly snapshots
  points: integer("points").default(0),
  switches: integer("switches").default(0),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow()
});

// Content moderation reports
export const moderationReports = pgTable("moderation_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").references(() => users.id, { onDelete: 'cascade' }),
  contentType: varchar("content_type").notNull(), // 'post', 'comment'
  contentId: varchar("content_id").notNull(),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").default('PENDING'), // PENDING, REVIEWED, RESOLVED
  moderatorId: varchar("moderator_id").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at")
});

// Posts (for social feed)
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  switchLogId: varchar("switch_log_id").references(() => switchLogs.id, { onDelete: 'cascade' }),
  content: text("content"),
  imageUrl: varchar("image_url"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Likes
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow()
});

// Comments
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// News items
export const newsItems = pgTable("news_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  summary: text("summary"),
  sourceUrl: varchar("source_url"),
  imageUrl: varchar("image_url"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Target suggestions
export const targetSuggestions = pgTable("target_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  fromBrandName: varchar("from_brand_name").notNull(),
  toBrandName: varchar("to_brand_name"),
  category: switchCategoryEnum("category"),
  rationale: text("rationale"),
  status: varchar("status").default('PENDING'), // PENDING, APPROVED, REJECTED
  enrichmentData: jsonb("enrichment_data"),
  createdAt: timestamp("created_at").defaultNow()
});

// Switch targets (approved suggestions)
export const switchTargets = pgTable("switch_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromBrandId: varchar("from_brand_id").references(() => brands.id),
  toBrandId: varchar("to_brand_id").references(() => brands.id),
  category: switchCategoryEnum("category"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  pointsRequired: integer("points_required"),
  switchesRequired: integer("switches_required"),
  createdAt: timestamp("created_at").defaultNow()
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  achievementId: varchar("achievement_id").references(() => achievements.id, { onDelete: 'cascade' }),
  earnedAt: timestamp("earned_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  switchLogs: many(switchLogs),
  posts: many(posts),
  likes: many(likes),
  comments: many(comments),
  reactions: many(reactions),
  publicAliases: many(publicAliases),
  targetSuggestions: many(targetSuggestions),
  userAchievements: many(userAchievements),
  leaderboardSnapshots: many(leaderboardSnapshots)
}));

export const switchLogsRelations = relations(switchLogs, ({ one, many }) => ({
  user: one(users, { fields: [switchLogs.userId], references: [users.id] }),
  fromBrand: one(brands, { fields: [switchLogs.fromBrandId], references: [brands.id] }),
  toBrand: one(brands, { fields: [switchLogs.toBrandId], references: [brands.id] }),
  posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  switchLog: one(switchLogs, { fields: [posts.switchLogId], references: [switchLogs.id] }),
  likes: many(likes),
  comments: many(comments),
  reactions: many(reactions)
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  post: one(posts, { fields: [likes.postId], references: [posts.id] })
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] })
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
  post: one(posts, { fields: [reactions.postId], references: [posts.id] })
}));

export const leaderboardSnapshotsRelations = relations(leaderboardSnapshots, ({ one }) => ({
  user: one(users, { fields: [leaderboardSnapshots.userId], references: [users.id] })
}));

export const moderationReportsRelations = relations(moderationReports, ({ one }) => ({
  reporter: one(users, { fields: [moderationReports.reporterId], references: [users.id] }),
  moderator: one(users, { fields: [moderationReports.moderatorId], references: [users.id] })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true
});

export const insertSwitchLogSchema = createInsertSchema(switchLogs).omit({
  id: true,
  createdAt: true
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});

export const insertTargetSuggestionSchema = createInsertSchema(targetSuggestions).omit({
  id: true,
  createdAt: true
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true
});

export const insertModerationReportSchema = createInsertSchema(moderationReports).omit({
  id: true,
  createdAt: true,
  resolvedAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SwitchLog = typeof switchLogs.$inferSelect;
export type InsertSwitchLog = z.infer<typeof insertSwitchLogSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type TargetSuggestion = typeof targetSuggestions.$inferSelect;
export type InsertTargetSuggestion = z.infer<typeof insertTargetSuggestionSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type ModerationReport = typeof moderationReports.$inferSelect;
export type InsertModerationReport = z.infer<typeof insertModerationReportSchema>;
