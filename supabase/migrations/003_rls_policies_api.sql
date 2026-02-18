-- ============================================
-- 1PACT – Politiques RLS pour l’API backend (inscription + lecture)
-- Permet au backend (clé anon ou service) d’inscrire des utilisateurs et associations.
-- ============================================

-- USERS : permettre l’insertion (inscription) et la lecture
CREATE POLICY "allow_insert_users" ON users
  FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

CREATE POLICY "allow_select_users" ON users
  FOR SELECT TO anon, authenticated, service_role USING (true);

CREATE POLICY "allow_update_users" ON users
  FOR UPDATE TO anon, authenticated, service_role USING (true);

-- ASSOCIATIONS : permettre l’insertion (inscription) et la lecture
CREATE POLICY "allow_insert_associations" ON associations
  FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

CREATE POLICY "allow_select_associations" ON associations
  FOR SELECT TO anon, authenticated, service_role USING (true);

CREATE POLICY "allow_update_associations" ON associations
  FOR UPDATE TO anon, authenticated, service_role USING (true);

-- PUBLICATIONS : lecture pour tous, écriture pour l’API
CREATE POLICY "allow_select_publications" ON publications
  FOR SELECT TO anon, authenticated, service_role USING (true);

CREATE POLICY "allow_insert_publications" ON publications
  FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

CREATE POLICY "allow_update_publications" ON publications
  FOR UPDATE TO anon, authenticated, service_role USING (true);

CREATE POLICY "allow_delete_publications" ON publications
  FOR DELETE TO anon, authenticated, service_role USING (true);

-- LIKES, COMMENTAIRES, FOLLOWS, CONVERSATIONS, MESSAGES
CREATE POLICY "allow_all_publication_likes" ON publication_likes
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_publication_comments" ON publication_comments
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_follows" ON follows
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_conversations" ON conversations
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_conversation_participants" ON conversation_participants
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_messages" ON messages
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
