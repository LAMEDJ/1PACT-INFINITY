-- Quêtes géolocalisées pour la carte 1PACT (type Pokémon Go)
CREATE TABLE IF NOT EXISTS quests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_m INT DEFAULT 50,
  reward TEXT,
  icon_url TEXT,
  progression INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lecture publique (RLS)
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests are public read"
  ON quests FOR SELECT
  USING (true);

-- Optionnel : insertion par rôle service (backend)
-- CREATE POLICY "Service role can manage quests"
--   ON quests FOR ALL
--   USING (auth.role() = 'service_role');

COMMENT ON TABLE quests IS 'Quêtes géolocalisées pour la carte interactive 1PACT';
