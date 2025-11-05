import { sql, relations, desc } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  decimal,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "MEMBER",
  "MODERATOR",
  "STRATEGIST",
  "ADMIN",
]);
export const userTypeEnum = pgEnum("user_type", [
  "ANONYMOUS",
  "REGISTERED",
]);
export const commentStatusEnum = pgEnum("comment_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const rewardTypeEnum = pgEnum("reward_type", [
  "FREEBEE",
  "COUPON",
  "PRIZE_ENTRY",
]);
export const rewardStatusEnum = pgEnum("reward_status", [
  "AVAILABLE",
  "CLAIMED",
  "EXPIRED",
]);
export const switchCategoryEnum = pgEnum("switch_category", [
  "FOOD_BEVERAGES",
  "ELECTRONICS",
  "FASHION",
  "BEAUTY",
  "HOME_GARDEN",
  "AUTOMOTIVE",
  "SPORTS",
  "BOOKS_MEDIA",
  "OTHER",
]);
export const switchLogStatus = pgEnum("switch_log_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const impactEnum = pgEnum("impact", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
]);
export const missionStatusEnum = pgEnum("mission_status", [
  "DRAFT",
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
]);
export const communityVisibilityEnum = pgEnum("community_visibility", [
  "PUBLIC",
  "PRIVATE",
  "INVITE_ONLY",
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  firebaseUid: varchar("firebase_uid").unique(), // Made nullable for anonymous users
  phone: varchar("phone"),
  email: varchar("email"),
  handle: varchar("handle").notNull().unique(),
  region: varchar("region"),
  state: varchar("state"), // Added for state selection
  role: userRoleEnum("role").default("MEMBER"),
  userType: userTypeEnum("user_type").default("REGISTERED"),
  points: integer("points").default(0),
  level: integer("level").default(1),
  switchCount: integer("switch_count").default(0),
  cookieId: varchar("cookie_id").unique(), // For anonymous users
  secretKeyHash: varchar("secret_key_hash"), // For secret key authentication
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  isStrategist: boolean("is_strategist").default(false).notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recovery keys for anonymous users
export const recoveryKeys = pgTable("recovery_keys", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  keyHash: varchar("key_hash").notNull().unique(), // argon2id hash
  keyDisplay: varchar("key_display").notNull(), // Human-readable key for display
  qrCodeData: text("qr_code_data"), // QR code data
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Backup codes for anonymous users
export const backupCodes = pgTable("backup_codes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  codeHash: varchar("code_hash").notNull(), // argon2id hash of the backup code
  codeDisplay: varchar("code_display").notNull(), // Human-readable code for display
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  usedFor: varchar("used_for"), // What action the code was used for (e.g., "login", "export_data", "delete_account")
  createdAt: timestamp("created_at").defaultNow(),
});

// Rewards system
export const rewards = pgTable("rewards", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: rewardTypeEnum("type").notNull(),
  pointsRequired: integer("points_required").default(0),
  value: decimal("value", { precision: 10, scale: 2 }), // For coupons/prizes
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  maxClaims: integer("max_claims"), // Limit on how many can be claimed
  currentClaims: integer("current_claims").default(0),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User reward claims
export const userRewards = pgTable("user_rewards", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  rewardId: varchar("reward_id")
    .references(() => rewards.id, { onDelete: "cascade" })
    .notNull(),
  status: rewardStatusEnum("status").default("CLAIMED"),
  claimedAt: timestamp("claimed_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  redemptionCode: varchar("redemption_code"), // For coupons/prizes
});

export const evidenceImages = pgTable("evidence_images", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  switchLogsId: varchar("switch_logs_id")
    .notNull()
    .references(() => switchLogs.id, { onDelete: "cascade" }),

  objectKey: text("object_key").notNull(),

  uploadedBy: varchar("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  imageUrl: text("image_url").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

// Public aliases for social sharing
export const publicAliases = pgTable("public_aliases", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  platform: varchar("platform").notNull(), // 'twitter', 'whatsapp', etc.
  aliasName: varchar("alias_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table for enhanced filtering
export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  color: varchar("color").default("#3B82F6"), // Hex color for UI
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tags table for content categorization
export const tags = pgTable("tags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  color: varchar("color").default("#10B981"), // Hex color for UI
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communities table for member groups
export const communities = pgTable("communities", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  visibility: communityVisibilityEnum("visibility").default("PUBLIC"),
  memberCount: integer("member_count").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community memberships
export const communityMembers = pgTable("community_members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").references(() => communities.id, {
    onDelete: "cascade",
  }),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  role: varchar("role").default("MEMBER"), // MEMBER, MODERATOR, ADMIN
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Brands table
export const brands = pgTable("brands", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  company: varchar("company"),
  country: varchar("country"),
  isIndian: boolean("is_indian").default(false),
  isFavorable: boolean("is_favorable").default(false),
  category: switchCategoryEnum("category"),
  logoUrl: varchar("logo_url"),
  tags: text("tags").array(), // Array of tag IDs
  createdAt: timestamp("created_at").defaultNow(),
});

// Switch logs
export const switchLogs = pgTable("switch_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  fromBrandId: varchar("from_brand_id").references(() => brands.id),
  toBrandId: varchar("to_brand_id").references(() => brands.id),
  missionId: varchar("mission_id").references(() => missions.id), // For mission-related switch logs
  newsId: varchar("news_id").references(() => newsArticles.id), // For news-related switch logs
  category: switchCategoryEnum("category"),
  categoryId: varchar("category_id").references(() => categories.id),
  tags: text("tags").array(), // Array of tag IDs
  reason: text("reason"),
  experience: text("experience"), // User's experience with the switch
  financialImpact: text("financial_impact"), // Financial benefits
  evidenceUrl: varchar("evidence_url"),
  isPublic: boolean("is_public").default(false),
  status: switchLogStatus("status").default("PENDING"),
  moderatorId: varchar("moderator_id").references(() => users.id),
  moderatorNotes: text("moderator_notes"),
  approvedAt: timestamp("approved_at"),
  points: integer("points").default(25),
  communityId: varchar("community_id").references(() => communities.id), // For community-specific posts
  createdAt: timestamp("created_at").defaultNow(),
});

export const switchFeedbacks = pgTable("switch_feedbacks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  fromBrands: varchar("from_brands"),
  toBrands: varchar("to_brands"),
  category: switchCategoryEnum("category"),
  url: varchar("url"), // e.g., evidence or link related to the feedback
  message: text("message"), // The feedback message
  isPublic: boolean("is_public").default(false),
  status: switchLogStatus("status").default("PENDING"), // Reusing the status enum from switch_logs for consistency
  moderatorId: varchar("moderator_id").references(() => users.id),
  moderatorNotes: text("moderator_notes"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
// Reactions table for enhanced social interactions
export const reactions = pgTable("reactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  postId: varchar("post_id").references(() => posts.id, {
    onDelete: "cascade",
  }),
  type: varchar("type").notNull(), // 'like', 'love', 'fire', 'celebrate', 'support'
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly/Monthly leaderboard snapshots
export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  period: varchar("period").notNull(), // 'weekly', 'monthly'
  year: integer("year").notNull(),
  week: integer("week"), // for weekly snapshots
  month: integer("month"), // for monthly snapshots
  points: integer("points").default(0),
  switches: integer("switches").default(0),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content moderation reports
export const moderationReports = pgTable("moderation_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  contentType: varchar("content_type").notNull(), // 'post', 'comment'
  contentId: varchar("content_id").notNull(),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: varchar("status").default("PENDING"), // PENDING, REVIEWED, RESOLVED
  moderatorId: varchar("moderator_id").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Post types enum
export const postTypeEnum = pgEnum("post_type", [
  "GENERAL", // Regular posts
  "SWITCH_LOG_PROMPT", // Moderator posts prompting switch logs
  "MISSION_PROMPT", // Moderator posts prompting missions
  "ANNOUNCEMENT", // Official announcements
  "POLL", // Community polls
]);

// Posts (for social feed)
export const posts = pgTable("posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  switchLogId: varchar("switch_log_id").references(() => switchLogs.id, {
    onDelete: "cascade",
  }),
  missionId: varchar("mission_id").references(() => missions.id), // For mission-related posts
  postType: postTypeEnum("post_type").default("GENERAL"),
  title: varchar("title"), // For titled posts like prompts
  content: text("content"),
  imageUrl: varchar("image_url"),
  categoryId: varchar("category_id").references(() => categories.id),
  tags: text("tags").array(), // Array of tag IDs
  communityId: varchar("community_id").references(() => communities.id), // For community-specific posts
  targetBrandFrom: varchar("target_brand_from"), // For switch log prompts
  targetBrandTo: varchar("target_brand_to"), // For switch log prompts
  actionButtonText: varchar("action_button_text"), // Custom text for action button
  actionButtonUrl: varchar("action_button_url"), // URL for action button
  isPromotional: boolean("is_promotional").default(false), // For promoted content
  isPinned: boolean("is_pinned").default(false), // For pinned posts
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  switchLogsCount: integer("switch_logs_count").default(0), // Count of switch logs created from this post
  commentsEnabled: boolean("comments_enabled").default(true),
  upvotesEnabled: boolean("upvotes_enabled").default(true),
  downvotesEnabled: boolean("downvotes_enabled").default(true),
  expiresAt: timestamp("expires_at"), // For time-limited posts
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes
export const likes = pgTable("likes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  postId: varchar("post_id").references(() => posts.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments
export const comments = pgTable("comments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  postId: varchar("post_id").references(() => posts.id, {
    onDelete: "cascade",
  }),
  newsId: varchar("news_id").references(() => newsArticles.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  status: commentStatusEnum("status").default("PENDING"),
  moderatorId: varchar("moderator_id").references(() => users.id),
  moderatorNotes: text("moderator_notes"),
  moderatedAt: timestamp("moderated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// News items
export const newsItems = pgTable("news_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  summary: text("summary"),
  sourceUrl: varchar("source_url"),
  imageUrl: varchar("image_url"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Target suggestions
export const targetSuggestions = pgTable("target_suggestions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  fromBrandName: varchar("from_brand_name").notNull(),
  toBrandName: varchar("to_brand_name"),
  category: switchCategoryEnum("category"),
  rationale: text("rationale"),
  status: varchar("status").default("PENDING"), // PENDING, APPROVED, REJECTED
  enrichmentData: jsonb("enrichment_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Switch targets (approved suggestions)
export const switchTargets = pgTable("switch_targets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromBrandId: varchar("from_brand_id").references(() => brands.id),
  toBrandId: varchar("to_brand_id").references(() => brands.id),
  category: switchCategoryEnum("category"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  pointsRequired: integer("points_required"),
  switchesRequired: integer("switches_required"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  achievementId: varchar("achievement_id").references(() => achievements.id, {
    onDelete: "cascade",
  }),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Feedback questions for moderators to create
export const feedbackQuestions = pgTable("feedback_questions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").default("multiple_choice"), // multiple_choice, text, rating
  options: jsonb("options"), // for multiple choice questions
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback responses from users
export const feedbackResponses = pgTable("feedback_responses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").references(() => feedbackQuestions.id, {
    onDelete: "cascade",
  }),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Missions/targets set by moderators
export const missions = pgTable("missions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  targetCategory: switchCategoryEnum("target_category"),
  categoryId: varchar("category_id").references(() => categories.id),
  tags: text("tags").array(), // Array of tag IDs
  fromBrandIds: text("from_brand_ids").array(), // Array of brand IDs to switch from
  toBrandIds: text("to_brand_ids").array(), // Array of brand IDs to switch to
  impact: impactEnum("impact").default("MEDIUM"),
  financialValue: decimal("financial_value", { precision: 10, scale: 2 }),
  imageUrls: text("image_urls").array(), // Multiple image uploads
  pointsReward: integer("points_reward").default(50),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: missionStatusEnum("status").default("DRAFT"),
  communityId: varchar("community_id").references(() => communities.id), // For community-specific missions
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User mission participation
export const userMissions = pgTable("user_missions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  missionId: varchar("mission_id").references(() => missions.id, {
    onDelete: "cascade",
  }),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  status: varchar("status").default("STARTED"), // STARTED, COMPLETED, FAILED
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// News articles posted by moderators
export const newsArticles = pgTable("news_articles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull(),
  source: text("source"),
  description: text("description").notNull(),
  imageUrls: text("image_urls").array(), // Array of image URLs
  suggestedFromBrandIds: text("suggested_from_brand_ids").array(),
  suggestedToBrandIds: text("suggested_to_brand_ids").array(),
  commentsEnabled: boolean("comments_enabled").default(true),
  upvotesCount: integer("upvotes_count").default(0),
  downvotesCount: integer("downvotes_count").default(0),
  sharesCount: integer("shares_count").default(0),
  commentsCount: integer("comments_count").default(0),
  isPublished: boolean("is_published").default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News votes (upvotes/downvotes)
export const newsVotes = pgTable("news_votes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  newsId: varchar("news_id").references(() => newsArticles.id, {
    onDelete: "cascade",
  }),
  voteType: varchar("vote_type", { length: 10 }).notNull(), // 'upvote' or 'downvote'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate votes from same user
  uniqueUserNews: unique("unique_user_news").on(table.userId, table.newsId),
}));

// News shares
export const newsShares = pgTable("news_shares", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  newsId: varchar("news_id").references(() => newsArticles.id, {
    onDelete: "cascade",
  }),
  platform: varchar("platform"), // 'twitter', 'whatsapp', 'facebook', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Private messages between members and moderators
export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  toUserId: varchar("to_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  attachmentUrls: text("attachment_urls").array(),
  replyToId: varchar("reply_to_id"), // Simplified to avoid circular reference
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced posts with target alternatives and URLs
export const moderatorPosts = pgTable("moderator_posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  targetBrandIds: text("target_brand_ids").array(), // Brands to switch from
  alternativeBrandIds: text("alternative_brand_ids").array(), // Suggested alternatives
  imageUrls: text("image_urls").array(),
  externalUrls: text("external_urls").array(), // Reference links
  category: switchCategoryEnum("category"),
  categoryId: varchar("category_id").references(() => categories.id),
  tags: text("tags").array(), // Array of tag IDs
  communityId: varchar("community_id").references(() => communities.id), // For community-specific posts
  isPinned: boolean("is_pinned").default(false),
  commentsEnabled: boolean("comments_enabled").default(true),
  upvotesEnabled: boolean("upvotes_enabled").default(true),
  downvotesEnabled: boolean("downvotes_enabled").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content tags association table for many-to-many relationships
export const contentTags = pgTable("content_tags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  contentType: varchar("content_type").notNull(), // 'post', 'mission', 'switch_log', 'moderator_post'
  contentId: varchar("content_id").notNull(),
  tagId: varchar("tag_id").references(() => tags.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// GDPR compliance - data export/deletion requests
export const gdprRequests = pgTable("gdpr_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  requestType: varchar("request_type").notNull(), // 'EXPORT', 'DELETE'
  status: varchar("status").default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED
  requestData: jsonb("request_data"), // Additional request details
  processedAt: timestamp("processed_at"),
  downloadUrl: varchar("download_url"), // For export requests
  expiresAt: timestamp("expires_at"), // For download links
  createdAt: timestamp("created_at").defaultNow(),
});

// Recovery methods table for OAuth and WebAuthn
export const recoveryMethods = pgTable("recovery_methods", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  methodType: varchar("method_type").notNull(), // "OAUTH_GOOGLE", "WEBAUTHN"
  providerId: varchar("provider_id"), // Google ID, WebAuthn credential ID
  providerData: jsonb("provider_data"), // Additional provider-specific data
  createdAt: timestamp("created_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

// Feedback submissions (renamed from target suggestions)
export const feedbackSubmissions = pgTable("feedback_submissions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  fromBrandName: varchar("from_brand_name").notNull(),
  toBrandName: varchar("to_brand_name"),
  category: switchCategoryEnum("category"),
  categoryId: varchar("category_id").references(() => categories.id),
  tags: text("tags").array(),
  rationale: text("rationale").notNull(),
  status: varchar("status").default("PENDING"), // PENDING, APPROVED, REJECTED
  moderatorId: varchar("moderator_id").references(() => users.id),
  moderatorNotes: text("moderator_notes"),
  reviewedAt: timestamp("reviewed_at"),
  enrichmentData: jsonb("enrichment_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Distinguish authored vs moderated switch logs
  switchLogs: many(switchLogs, { relationName: "switchLogs_user" }),
  moderatedSwitchLogs: many(switchLogs, { relationName: "switchLogs_moderator" }),
  // Feedback submissions (authored vs moderated)
  feedbackSubmissions: many(feedbackSubmissions, { relationName: "feedback_user" }),
  moderatedFeedbackSubmissions: many(feedbackSubmissions, { relationName: "feedback_moderator" }),
  // Switch feedbacks (authored vs moderated)
  switchFeedbacks: many(switchFeedbacks, { relationName: "switchFeedback_user" }),
  moderatedSwitchFeedbacks: many(switchFeedbacks, { relationName: "switchFeedback_moderator" }),
  // Moderation reports (filed vs moderated)
  reportsFiled: many(moderationReports, { relationName: "reports_reporter" }),
  reportsModerated: many(moderationReports, { relationName: "reports_moderator" }),
  // Messages (sent vs received)
  sentMessages: many(messages, { relationName: "messages_from_user" }),
  receivedMessages: many(messages, { relationName: "messages_to_user" }),
  posts: many(posts),
  likes: many(likes),
  comments: many(comments),
  reactions: many(reactions),
  publicAliases: many(publicAliases, { relationName: "user_public_alias" }),
  userAchievements: many(userAchievements),
  leaderboardSnapshots: many(leaderboardSnapshots),
  communityMemberships: many(communityMembers),
  createdCommunities: many(communities),
  missions: many(missions),
  userMissions: many(userMissions),
  moderatorPosts: many(moderatorPosts),
  recoveryKeys: many(recoveryKeys),
  backupCodes: many(backupCodes),
  userRewards: many(userRewards),
  newsVotes: many(newsVotes),
  newsShares: many(newsShares),
  gdprRequests: many(gdprRequests),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  switchLogs: many(switchLogs),
  posts: many(posts),
  missions: many(missions),
  moderatorPosts: many(moderatorPosts),
  feedbackSubmissions: many(feedbackSubmissions),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  contentTags: many(contentTags),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  creator: one(users, {
    fields: [communities.createdBy],
    references: [users.id],
  }),
  members: many(communityMembers),
  switchLogs: many(switchLogs),
  posts: many(posts),
  missions: many(missions),
  moderatorPosts: many(moderatorPosts),
}));

export const communityMembersRelations = relations(
  communityMembers,
  ({ one }) => ({
    community: one(communities, {
      fields: [communityMembers.communityId],
      references: [communities.id],
    }),
    user: one(users, {
      fields: [communityMembers.userId],
      references: [users.id],
    }),
  })
);

export const switchLogsRelations = relations(switchLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [switchLogs.userId],
    references: [users.id],
    relationName: "switchLogs_user",
  }),
  fromBrand: one(brands, {
    fields: [switchLogs.fromBrandId],
    references: [brands.id],
  }),
  toBrand: one(brands, {
    fields: [switchLogs.toBrandId],
    references: [brands.id],
  }),
  mission: one(missions, {
    fields: [switchLogs.missionId],
    references: [missions.id],
  }),
  category: one(categories, {
    fields: [switchLogs.categoryId],
    references: [categories.id],
  }),
  community: one(communities, {
    fields: [switchLogs.communityId],
    references: [communities.id],
  }),
  moderator: one(users, {
    fields: [switchLogs.moderatorId],
    references: [users.id],
    relationName: "switchLogs_moderator",
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  switchLog: one(switchLogs, {
    fields: [posts.switchLogId],
    references: [switchLogs.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  likes: many(likes),
  comments: many(comments),
  reactions: many(reactions),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  post: one(posts, { fields: [likes.postId], references: [posts.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  // Disambiguate comment parent for Drizzle Studio: map comments -> newsArticles
  news: one(newsArticles, {
    fields: [comments.newsId],
    references: [newsArticles.id],
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
  post: one(posts, { fields: [reactions.postId], references: [posts.id] }),
}));

// Switch feedbacks relations (user vs moderator)
export const switchFeedbacksRelations = relations(switchFeedbacks, ({ one }) => ({
  user: one(users, {
    fields: [switchFeedbacks.userId],
    references: [users.id],
    relationName: "switchFeedback_user",
  }),
  moderator: one(users, {
    fields: [switchFeedbacks.moderatorId],
    references: [users.id],
    relationName: "switchFeedback_moderator",
  }),
}));

// Messages relations (sender vs recipient)
export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: "messages_from_user",
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: "messages_to_user",
  }),
}));

export const leaderboardSnapshotsRelations = relations(
  leaderboardSnapshots,
  ({ one }) => ({
    user: one(users, {
      fields: [leaderboardSnapshots.userId],
      references: [users.id],
    }),
  })
);

// User achievements join table -> users and achievements
export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const moderationReportsRelations = relations(
  moderationReports,
  ({ one }) => ({
    reporter: one(users, {
      fields: [moderationReports.reporterId],
      references: [users.id],
      relationName: "reports_reporter",
    }),
    moderator: one(users, {
      fields: [moderationReports.moderatorId],
      references: [users.id],
      relationName: "reports_moderator",
    }),
  })
);

export const missionsRelations = relations(missions, ({ one, many }) => ({
  creator: one(users, { fields: [missions.createdBy], references: [users.id] }),
  category: one(categories, {
    fields: [missions.categoryId],
    references: [categories.id],
  }),
  community: one(communities, {
    fields: [missions.communityId],
    references: [communities.id],
  }),
  userMissions: many(userMissions),
  switchLogs: many(switchLogs),
}));

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  user: one(users, { fields: [userMissions.userId], references: [users.id] }),
  mission: one(missions, {
    fields: [userMissions.missionId],
    references: [missions.id],
  }),
}));

export const moderatorPostsRelations = relations(moderatorPosts, ({ one }) => ({
  creator: one(users, {
    fields: [moderatorPosts.createdBy],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [moderatorPosts.categoryId],
    references: [categories.id],
  }),
  community: one(communities, {
    fields: [moderatorPosts.communityId],
    references: [communities.id],
  }),
}));

export const feedbackSubmissionsRelations = relations(
  feedbackSubmissions,
  ({ one }) => ({
    user: one(users, {
      fields: [feedbackSubmissions.userId],
      references: [users.id],
      relationName: "feedback_user",
    }),
    category: one(categories, {
      fields: [feedbackSubmissions.categoryId],
      references: [categories.id],
    }),
    moderator: one(users, {
      fields: [feedbackSubmissions.moderatorId],
      references: [users.id],
      relationName: "feedback_moderator",
    }),
  })
);

export const contentTagsRelations = relations(contentTags, ({ one }) => ({
  tag: one(tags, { fields: [contentTags.tagId], references: [tags.id] }),
}));

// Public aliases ↔ users
export const publicAliasesRelations = relations(publicAliases, ({ one }) => ({
  user: one(users, {
    fields: [publicAliases.userId],
    references: [users.id],
    relationName: "user_public_alias",
  }),
}));

// New relations for enhanced features
export const recoveryKeysRelations = relations(recoveryKeys, ({ one }) => ({
  user: one(users, { fields: [recoveryKeys.userId], references: [users.id] }),
}));

export const backupCodesRelations = relations(backupCodes, ({ one }) => ({
  user: one(users, { fields: [backupCodes.userId], references: [users.id] }),
}));

export const rewardsRelations = relations(rewards, ({ many }) => ({
  userRewards: many(userRewards),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, { fields: [userRewards.userId], references: [users.id] }),
  reward: one(rewards, { fields: [userRewards.rewardId], references: [rewards.id] }),
}));

export const newsArticlesRelations = relations(newsArticles, ({ one, many }) => ({
  creator: one(users, { fields: [newsArticles.createdBy], references: [users.id] }),
  comments: many(comments),
  votes: many(newsVotes),
  shares: many(newsShares),
}));

export const newsVotesRelations = relations(newsVotes, ({ one }) => ({
  user: one(users, { fields: [newsVotes.userId], references: [users.id] }),
  news: one(newsArticles, { fields: [newsVotes.newsId], references: [newsArticles.id] }),
}));

export const newsSharesRelations = relations(newsShares, ({ one }) => ({
  user: one(users, { fields: [newsShares.userId], references: [users.id] }),
  news: one(newsArticles, { fields: [newsShares.newsId], references: [newsArticles.id] }),
}));

export const gdprRequestsRelations = relations(gdprRequests, ({ one }) => ({
  user: one(users, { fields: [gdprRequests.userId], references: [users.id] }),
}));

export const recoveryMethodsRelations = relations(recoveryMethods, ({ one }) => ({
  user: one(users, { fields: [recoveryMethods.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertSwitchLogSchema = createInsertSchema(switchLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertTargetSuggestionSchema = createInsertSchema(
  targetSuggestions
).omit({
  id: true,
  createdAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

export const insertModerationReportSchema = createInsertSchema(
  moderationReports
).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertFeedbackQuestionSchema = createInsertSchema(
  feedbackQuestions
).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackResponseSchema = createInsertSchema(
  feedbackResponses
).omit({
  id: true,
  createdAt: true,
});

export const insertMissionSchema = createInsertSchema(missions, {
  startDate: z.coerce.date(), // 👈 accepts string or Date
  endDate: z.coerce.date(),
  financialValue: z.string(), // 👈 decimal maps better as string
}).omit({
  id: true,
  createdAt: true,
});

export const insertUserMissionSchema = createInsertSchema(userMissions).omit({
  id: true,
  createdAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertModeratorPostSchema = createInsertSchema(
  moderatorPosts
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
});

export const insertCommunityMemberSchema = createInsertSchema(
  communityMembers
).omit({
  id: true,
  joinedAt: true,
});

export const insertContentTagSchema = createInsertSchema(contentTags).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSubmissionSchema = createInsertSchema(
  feedbackSubmissions
).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

// New insert schemas for enhanced features
export const insertRecoveryKeySchema = createInsertSchema(recoveryKeys).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
  currentClaims: true,
});

export const insertUserRewardSchema = createInsertSchema(userRewards).omit({
  id: true,
  claimedAt: true,
});

export const insertNewsVoteSchema = createInsertSchema(newsVotes).omit({
  id: true,
  createdAt: true,
});

export const insertNewsShareSchema = createInsertSchema(newsShares).omit({
  id: true,
  createdAt: true,
});

export const insertGdprRequestSchema = createInsertSchema(gdprRequests).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertRecoveryMethodSchema = createInsertSchema(recoveryMethods).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
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
export type InsertTargetSuggestion = z.infer<
  typeof insertTargetSuggestionSchema
>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type ModerationReport = typeof moderationReports.$inferSelect;
export type InsertModerationReport = z.infer<
  typeof insertModerationReportSchema
>;
export type FeedbackQuestion = typeof feedbackQuestions.$inferSelect;
export type InsertFeedbackQuestion = z.infer<
  typeof insertFeedbackQuestionSchema
>;
export type FeedbackResponse = typeof feedbackResponses.$inferSelect;
export type InsertFeedbackResponse = z.infer<
  typeof insertFeedbackResponseSchema
>;
export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type UserMission = typeof userMissions.$inferSelect;
export type InsertUserMission = z.infer<typeof insertUserMissionSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ModeratorPost = typeof moderatorPosts.$inferSelect;
export type InsertModeratorPost = z.infer<typeof insertModeratorPostSchema>;

// New types for enhanced features
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;
export type ContentTag = typeof contentTags.$inferSelect;
export type InsertContentTag = z.infer<typeof insertContentTagSchema>;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type InsertFeedbackSubmission = z.infer<
  typeof insertFeedbackSubmissionSchema
>;

// New types for enhanced features
export type RecoveryKey = typeof recoveryKeys.$inferSelect;
export type InsertRecoveryKey = z.infer<typeof insertRecoveryKeySchema>;
export type BackupCode = typeof backupCodes.$inferSelect;
export type InsertBackupCode = typeof backupCodes.$inferInsert;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
export type NewsLike = typeof newsLikes.$inferSelect;
export type InsertNewsLike = z.infer<typeof insertNewsLikeSchema>;
export type NewsShare = typeof newsShares.$inferSelect;
export type InsertNewsShare = z.infer<typeof insertNewsShareSchema>;
export type GdprRequest = typeof gdprRequests.$inferSelect;
export type InsertGdprRequest = z.infer<typeof insertGdprRequestSchema>;
