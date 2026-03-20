CREATE INDEX IF NOT EXISTS "Banner_enabled_position_sort_idx"
ON "Banner" ("enabled", "position", "sortOrder");

CREATE INDEX IF NOT EXISTS "Campaign_status_idx"
ON "Campaign" ("status");

CREATE INDEX IF NOT EXISTS "HomepageCollection_enabled_sort_idx"
ON "HomepageCollection" ("enabled", "sortOrder");
