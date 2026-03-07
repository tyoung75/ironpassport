-- ═══════════════════════════════════════════════════════════════════════════════
-- Iron Passport: Add slug column to gyms table
-- Run this in Supabase SQL Editor AFTER the initial gyms table exists.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Add slug column ──────────────────────────────────────────────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS slug text;

-- 2. Generate slugs for existing rows ─────────────────────────────────────────
-- Pattern: {gym-name}-{city}, lowercase, alphanumeric + hyphens only
UPDATE gyms
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        concat(name, ' ', coalesce(city, '')),
        '[^a-zA-Z0-9\s-]', '', 'g'   -- remove non-alphanumeric
      ),
      '\s+', '-', 'g'                  -- spaces → hyphens
    ),
    '-+', '-', 'g'                      -- collapse multiple hyphens
  )
)
WHERE slug IS NULL;

-- 3. Add unique index on slug ─────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_gyms_slug ON gyms(slug);

-- 4. Add fields that may not exist yet ────────────────────────────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS highlights jsonb;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS equipment_list text[];
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS recovery_amenities text[];
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS hotel_proximity text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS nearby_hotels jsonb;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS photos text[];

-- 5. Verify ───────────────────────────────────────────────────────────────────
-- SELECT id, name, city, slug FROM gyms ORDER BY city, name LIMIT 30;
