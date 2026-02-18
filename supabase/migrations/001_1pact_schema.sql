-- ============================================
-- 1PACT – Schéma des tables Supabase (PostgreSQL)
-- À exécuter dans le SQL Editor de ton projet Supabase
-- ============================================

-- Utilisateurs (membres du site)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associations
CREATE TABLE IF NOT EXISTS associations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  category TEXT DEFAULT '',
  public_cible TEXT DEFAULT '',
  location TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  profile_views INT DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  impact_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publications (par les associations)
CREATE TABLE IF NOT EXISTS publications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  association_id BIGINT NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  visibility TEXT DEFAULT 'public',
  impact_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publications_association ON publications(association_id);
CREATE INDEX IF NOT EXISTS idx_publications_created ON publications(created_at DESC);

-- Likes sur les publications (utilisateurs uniquement)
CREATE TABLE IF NOT EXISTS publication_likes (
  publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_publication_likes_publication ON publication_likes(publication_id);

-- Commentaires sur les publications
CREATE TABLE IF NOT EXISTS publication_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  association_id BIGINT REFERENCES associations(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publication_comments_publication ON publication_comments(publication_id);

-- Abonnements utilisateur -> association (follows)
CREATE TABLE IF NOT EXISTS follows (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  association_id BIGINT NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, association_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_association ON follows(association_id);

-- Conversations (messagerie)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants d'une conversation (user et/ou association)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  association_id BIGINT REFERENCES associations(id) ON DELETE CASCADE,
  UNIQUE (conversation_id, user_id, association_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_assoc ON conversation_participants(association_id);

-- Messages dans une conversation
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  sender_association_id BIGINT REFERENCES associations(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Activer RLS (Row Level Security) – optionnel, pour sécuriser l’accès direct depuis le client
-- Ici on laisse le backend utiliser la service_role key qui bypass RLS.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques permissives pour que le backend (service_role) puisse tout faire.
-- En lecture/écriture depuis l’API backend, RLS n’est pas appliqué avec service_role.
