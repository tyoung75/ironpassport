-- ═══════════════════════════════════════════════════════════════════════════════
-- Iron Passport: Cities Table + city_slug on Gyms
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create cities table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            text NOT NULL UNIQUE,
  name            text NOT NULL UNIQUE,
  country         text NOT NULL,
  region          text,
  description     text,
  nearby_destinations text[],
  related_cities  text[],
  faqs            jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-update updated_at on cities
CREATE OR REPLACE FUNCTION update_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cities_updated_at_trigger
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_cities_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS cities_slug_idx ON cities (slug);
CREATE INDEX IF NOT EXISTS cities_region_idx ON cities (region);

-- 2. Add city_slug column to gyms table ───────────────────────────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS city_slug text;

-- Backfill city_slug from existing city names
UPDATE gyms
SET city_slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        city,
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE city_slug IS NULL;

CREATE INDEX IF NOT EXISTS gyms_city_slug_fk_idx ON gyms (city_slug);

-- 3. RLS policies ─────────────────────────────────────────────────────────────
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (true);

CREATE POLICY "Cities are insertable by authenticated users"
  ON cities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Cities are updatable by authenticated users"
  ON cities FOR UPDATE
  USING (true);

-- Ensure gyms table also has public read access
CREATE POLICY IF NOT EXISTS "Gyms are viewable by everyone"
  ON gyms FOR SELECT
  USING (true);
