-- ═══════════════════════════════════════════════════════════════════════════════
-- Iron Passport: Gym Passport & Gym Battle tables
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. stamps ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stamps (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_email text        NOT NULL,
  gym_id     bigint      NOT NULL REFERENCES gyms(id),
  visited_at date        DEFAULT CURRENT_DATE,
  rating     smallint    CHECK (rating BETWEEN 1 AND 5),
  review     text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_email, gym_id)
);

ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stamps_select" ON stamps FOR SELECT TO anon USING (true);
CREATE POLICY "stamps_insert" ON stamps FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "stamps_update" ON stamps FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 2. gym_battles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_battles (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_email    text,
  location_text text           NOT NULL,
  latitude      double precision,
  longitude     double precision,
  created_at    timestamptz    DEFAULT now()
);

ALTER TABLE gym_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gym_battles_select" ON gym_battles FOR SELECT TO anon USING (true);
CREATE POLICY "gym_battles_insert" ON gym_battles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "gym_battles_update" ON gym_battles FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 3. battle_votes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS battle_votes (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  battle_id      bigint  NOT NULL REFERENCES gym_battles(id),
  user_email     text,
  winner_gym_id  bigint  NOT NULL REFERENCES gyms(id),
  loser_gym_id   bigint  NOT NULL REFERENCES gyms(id),
  skipped        boolean DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE battle_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "battle_votes_select" ON battle_votes FOR SELECT TO anon USING (true);
CREATE POLICY "battle_votes_insert" ON battle_votes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "battle_votes_update" ON battle_votes FOR UPDATE TO anon USING (true) WITH CHECK (true);
