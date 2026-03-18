-- ═══════════════════════════════════════════════════════════════════════════════
-- Iron Passport: Gym Master Table Enhancement
-- Adds stable unique slugs, required/optional fields, and freshness tracking
-- Run this in Supabase SQL Editor AFTER the gyms table already exists
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Add slug column (stable, unique, URL-safe identifier) ──────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS slug text;

-- Back-fill slugs for existing rows: lowercase name + city, deduped with id
UPDATE gyms
SET slug = CONCAT(
  REGEXP_REPLACE(LOWER(TRIM(name)), '[^a-z0-9]+', '-', 'g'),
  '-',
  REGEXP_REPLACE(LOWER(TRIM(COALESCE(city, 'unknown'))), '[^a-z0-9]+', '-', 'g')
)
WHERE slug IS NULL;

-- Handle any duplicate slugs by appending the row id
WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) AS rn
  FROM gyms
)
UPDATE gyms
SET slug = gyms.slug || '-' || gyms.id
FROM dupes
WHERE gyms.id = dupes.id AND dupes.rn > 1;

-- Now make slug NOT NULL and UNIQUE
ALTER TABLE gyms ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS gyms_slug_unique ON gyms (slug);

-- 2. Ensure required fields have NOT NULL constraints ────────────────────────
-- name and address already NOT NULL (part of unique constraint)
-- Add NOT NULL to city (critical for SEO city pages)
UPDATE gyms SET city = 'Unknown' WHERE city IS NULL;
ALTER TABLE gyms ALTER COLUMN city SET NOT NULL;

-- 3. Add optional but valuable columns ──────────────────────────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS photos         text[];          -- Array of photo URLs
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS latitude       double precision;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS longitude      double precision;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS amenities      text[];          -- e.g. {"sauna","pool","wifi"}
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS hotel_nearby   jsonb;           -- [{name, distance, walkMin}]

-- 4. Data freshness tracking ────────────────────────────────────────────────
-- updated_at already exists; add a dedicated verified_at for editorial review
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS verified_at    timestamptz;     -- Last time data was manually verified
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS data_source    text;            -- "seed", "user", "api", "manual"

-- Ensure updated_at auto-updates on every write
CREATE OR REPLACE FUNCTION update_gyms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gyms_updated_at_trigger ON gyms;
CREATE TRIGGER gyms_updated_at_trigger
  BEFORE UPDATE ON gyms
  FOR EACH ROW
  EXECUTE FUNCTION update_gyms_updated_at();

-- 5. Useful indexes ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS gyms_city_idx ON gyms (city);
CREATE INDEX IF NOT EXISTS gyms_city_slug_idx ON gyms (city, slug);
CREATE INDEX IF NOT EXISTS gyms_updated_at_idx ON gyms (updated_at);

-- 6. View: stale gyms (not updated in 90 days) ─────────────────────────────
CREATE OR REPLACE VIEW stale_gyms
  WITH (security_invoker = true) AS
SELECT id, slug, name, city, country, updated_at, verified_at,
       NOW() - updated_at AS age,
       CASE
         WHEN verified_at IS NULL AND updated_at < NOW() - INTERVAL '90 days' THEN 'stale'
         WHEN verified_at IS NOT NULL AND verified_at < NOW() - INTERVAL '180 days' THEN 'needs_reverification'
         WHEN updated_at < NOW() - INTERVAL '90 days' THEN 'stale'
         ELSE 'fresh'
       END AS freshness
FROM gyms
ORDER BY updated_at ASC;
