-- Run these statements ONCE in:
-- Cloudflare > D1 SQLite Database > arash-website-db > Console
--
-- They add media metadata to existing Telegram posts.
-- Existing rows remain intact.

ALTER TABLE telegram_posts ADD COLUMN media_file_id TEXT;
ALTER TABLE telegram_posts ADD COLUMN media_type TEXT;
ALTER TABLE telegram_posts ADD COLUMN media_group_id TEXT;
