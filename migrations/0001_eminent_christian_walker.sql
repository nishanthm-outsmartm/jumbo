ALTER TABLE "comments" ADD COLUMN "session_id" varchar;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "guest_name" varchar;--> statement-breakpoint
ALTER TABLE "news_shares" ADD COLUMN "session_id" varchar;--> statement-breakpoint
ALTER TABLE "news_votes" ADD COLUMN "session_id" varchar;--> statement-breakpoint
ALTER TABLE "news_shares" ADD CONSTRAINT "unique_session_share" UNIQUE("session_id","news_id");--> statement-breakpoint
ALTER TABLE "news_votes" ADD CONSTRAINT "unique_session_news" UNIQUE("session_id","news_id");