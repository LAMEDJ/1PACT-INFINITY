/**
 * Store 1PACT basé sur Supabase (PostgreSQL).
 * Même interface que store.js mais toutes les méthodes sont asynchrones.
 * Utilisé quand SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis.
 */
export function createSupabaseStore(supabase) {
  const u = () => supabase.from('users');
  const a = () => supabase.from('associations');
  const p = () => supabase.from('publications');
  const pl = () => supabase.from('publication_likes');
  const pc = () => supabase.from('publication_comments');
  const f = () => supabase.from('follows');
  const c = () => supabase.from('conversations');
  const cp = () => supabase.from('conversation_participants');
  const m = () => supabase.from('messages');
  const q = () => supabase.from('quests');
  const n = () => supabase.from('notifications');
  const prop = () => supabase.from('propositions');

  const USER_SELECT_SAFE = 'id, email, password_hash, name, created_at, bio, avatar_url, city, phone, profile_visibility, notifications_enabled';
  const USER_SELECT_FULL = USER_SELECT_SAFE + ', impact_points, impact_level, total_valid_actions, last_rewarded_action_count';

  async function selectUser(queryFn) {
    let res = await queryFn(USER_SELECT_FULL);
    if (res.error && /impact_level|impact_points|schema cache/i.test(res.error.message)) {
      res = await queryFn(USER_SELECT_SAFE);
    }
    return res;
  }

  return {
    users: {
      getAll: async () => {
        const { data } = await selectUser((cols) => u().select(cols));
        return data || [];
      },
      get: async (id) => {
        const { data } = await selectUser((cols) => u().select(cols).eq('id', id).single());
        return data;
      },
      add: async (row) => {
        const full = {
          email: row.email,
          password_hash: row.password_hash,
          name: row.name,
          impact_points: row.impact_points ?? 0,
          impact_level: row.impact_level ?? 1,
          total_valid_actions: row.total_valid_actions ?? 0,
          last_rewarded_action_count: row.last_rewarded_action_count ?? 0,
        };
        let { data, error } = await u().insert(full).select('id').single();
        if (error && /impact_level|impact_points|column/i.test(error.message)) {
          ({ data, error } = await u().insert({ email: row.email, password_hash: row.password_hash, name: row.name }).select('id').single());
        }
        if (error) throw error;
        return Number(data.id);
      },
      update: async (id, upd) => {
        let { error } = await u().update(upd).eq('id', id);
        if (error && /impact_level|impact_points|column.*does not exist/i.test(error.message)) {
          const safe = { ...upd };
          delete safe.impact_points;
          delete safe.impact_level;
          delete safe.total_valid_actions;
          delete safe.last_rewarded_action_count;
          if (Object.keys(safe).length) {
            ({ error } = await u().update(safe).eq('id', id));
          } else {
            error = null;
          }
        }
        if (error) throw error;
      },
      getByEmail: async (email) => {
        const { data } = await selectUser((cols) => u().select(cols).eq('email', email).maybeSingle());
        return data;
      },
      delete: async (id) => {
        await f().delete().eq('user_id', id);
        await pl().delete().eq('user_id', id);
        await prop().delete().eq('user_id', id);
        const { data: cids } = await cp().select('conversation_id').eq('user_id', id);
        if (cids?.length) for (const cid of cids) await m().delete().eq('conversation_id', cid.conversation_id);
        await cp().delete().eq('user_id', id);
        await u().delete().eq('id', id);
      },
    },
    associations: {
      getAll: async () => {
        const { data } = await a().select('*');
        return data || [];
      },
      get: async (id) => {
        const { data } = await a().select('*').eq('id', id).single();
        return data;
      },
      add: async (row) => {
        const { data, error } = await a().insert({
          email: row.email,
          password_hash: row.password_hash,
          name: row.name,
          bio: row.bio ?? '',
          category: row.category ?? '',
          public_cible: row.public_cible ?? '',
          location: row.location ?? '',
          contact: row.contact ?? row.email ?? '',
          profile_views: row.profile_views ?? 0,
          latitude: row.latitude ?? null,
          longitude: row.longitude ?? null,
          impact_points: row.impact_points ?? 0,
        }).select('id').single();
        if (error) throw error;
        return Number(data.id);
      },
      update: async (id, upd) => {
        await a().update(upd).eq('id', id);
      },
      getByEmail: async (email) => {
        const { data } = await a().select('*').eq('email', email).maybeSingle();
        return data;
      },
      incrementViews: async (id) => {
        const row = await a().select('profile_views').eq('id', id).single().then((r) => r.data);
        if (row) await a().update({ profile_views: (row.profile_views || 0) + 1 }).eq('id', id);
      },
      delete: async (id) => {
        const { data: pubs } = await p().select('id').eq('association_id', id);
        const pubIds = (pubs || []).map((x) => x.id);
        for (const pid of pubIds) {
          await pl().delete().eq('publication_id', pid);
          await pc().delete().eq('publication_id', pid);
        }
        await p().delete().eq('association_id', id);
        await f().delete().eq('association_id', id);
        await prop().delete().eq('association_id', id);
        await a().delete().eq('id', id);
      },
    },
    publications: {
      getAll: async () => {
        const { data } = await p().select('*').order('created_at', { ascending: false });
        return data || [];
      },
      get: async (id) => {
        const { data } = await p().select('*').eq('id', id).single();
        return data;
      },
      getByAssociation: async (aid) => {
        const { data } = await p().select('*').eq('association_id', aid).order('created_at', { ascending: true });
        return data || [];
      },
      add: async (row) => {
        const { data, error } = await p().insert({
          association_id: row.association_id,
          text: row.text ?? '',
          image_url: row.image_url ?? null,
          video_url: row.video_url ?? null,
          visibility: row.visibility ?? 'public',
          impact_points: row.impact_points ?? 0,
        }).select('id').single();
        if (error) throw error;
        return Number(data.id);
      },
      update: async (id, upd) => {
        await p().update(upd).eq('id', id);
      },
      delete: async (id) => {
        await pl().delete().eq('publication_id', id);
        await pc().delete().eq('publication_id', id);
        await p().delete().eq('id', id);
      },
    },
    publicationLikes: {
      getByPublication: async (pid) => {
        const { data } = await pl().select('*').eq('publication_id', pid);
        return data || [];
      },
      count: async (pid) => {
        const { count } = await pl().select('*', { count: 'exact', head: true }).eq('publication_id', pid);
        return count ?? 0;
      },
      countByUser: async (uid) => {
        const { count } = await pl().select('*', { count: 'exact', head: true }).eq('user_id', uid);
        return count ?? 0;
      },
      toggle: async (pid, uid) => {
        const { data: existing } = await pl().select('publication_id').eq('publication_id', pid).eq('user_id', uid).maybeSingle();
        if (existing) {
          await pl().delete().eq('publication_id', pid).eq('user_id', uid);
          return false;
        }
        await pl().insert({ publication_id: pid, user_id: uid });
        return true;
      },
    },
    publicationComments: {
      getByPublication: async (pid) => {
        const { data } = await pc().select('*').eq('publication_id', pid).order('created_at', { ascending: true });
        return data || [];
      },
      countByUser: async (uid) => {
        const { count } = await pc().select('*', { count: 'exact', head: true }).eq('user_id', uid);
        return count ?? 0;
      },
      add: async (row) => {
        const { data, error } = await pc().insert({
          publication_id: row.publication_id,
          user_id: row.user_id ?? null,
          association_id: row.association_id ?? null,
          text: row.text,
        }).select('id').single();
        if (error) throw error;
        return Number(data.id);
      },
    },
    follows: {
      getByUser: async (uid) => {
        const { data } = await f().select('*').eq('user_id', uid);
        return data || [];
      },
      getByAssociation: async (aid) => {
        const { data } = await f().select('*').eq('association_id', aid);
        return data || [];
      },
      countByAssociation: async (aid) => {
        const { count } = await f().select('*', { count: 'exact', head: true }).eq('association_id', aid);
        return count ?? 0;
      },
      add: async (uid, aid) => {
        const { data: existing } = await f().select('user_id').eq('user_id', uid).eq('association_id', aid).maybeSingle();
        if (!existing) await f().insert({ user_id: uid, association_id: aid });
      },
      remove: async (uid, aid) => {
        await f().delete().eq('user_id', uid).eq('association_id', aid);
      },
    },
    conversations: {
      add: async () => {
        const { data, error } = await c().insert({}).select('id').single();
        if (error) throw error;
        return Number(data.id);
      },
      get: async (id) => {
        const { data } = await c().select('*').eq('id', id).single();
        return data;
      },
    },
    conversationParticipants: {
      getByConversation: async (cid) => {
        const { data } = await cp().select('*').eq('conversation_id', cid);
        return data || [];
      },
      getConversationIdsForUser: async (uid) => {
        const { data } = await cp().select('conversation_id').eq('user_id', uid);
        return (data || []).map((x) => x.conversation_id);
      },
      getConversationIdsForAssociation: async (aid) => {
        const { data } = await cp().select('conversation_id').eq('association_id', aid);
        return (data || []).map((x) => x.conversation_id);
      },
      add: async (row) => {
        await cp().insert({
          conversation_id: row.conversation_id,
          user_id: row.user_id ?? null,
          association_id: row.association_id ?? null,
        });
      },
    },
    messages: {
      getByConversation: async (cid) => {
        const { data } = await m().select('*').eq('conversation_id', cid).order('created_at', { ascending: true });
        return data || [];
      },
      get: async (id) => {
        const { data } = await m().select('*').eq('id', id).single();
        return data;
      },
      add: async (row) => {
        const { data, error } = await m().insert({
          conversation_id: row.conversation_id,
          sender_user_id: row.sender_user_id ?? null,
          sender_association_id: row.sender_association_id ?? null,
          text: row.text,
        }).select('id').single();
        if (error) throw error;
        return Number(data.id);
      },
    },
    quests: {
      getAll: async () => {
        const { data } = await q().select('id, title, description, lat, lng, radius_m, reward, icon_url, progression').order('created_at', { ascending: false });
        return data || [];
      },
      get: async (id) => {
        const { data } = await q().select('*').eq('id', id).single();
        return data;
      },
    },
    propositions: {
      add: async (row) => {
        const { data, error } = await prop()
          .insert({
            user_id: row.user_id ?? null,
            association_id: row.association_id ?? null,
            category: row.category ?? '',
            public_cible: row.public_cible ?? '',
            titre: row.titre ?? '',
            description: row.description ?? '',
          })
          .select('id')
          .single();
        if (error) throw error;
        return Number(data.id);
      },
      getByAssociation: async (associationId) => {
        const { data, error } = await prop().select('*').eq('association_id', associationId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      },
    },
    notifications: {
      getForUser: async (userId, associationId, limit = 50) => {
        let query = n().select('*').order('created_at', { ascending: false }).limit(limit);
        if (userId) query = query.eq('user_id', userId);
        if (associationId) query = query.eq('association_id', associationId);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      add: async (row) => {
        const { data, error } = await n()
          .insert({
            user_id: row.user_id ?? null,
            association_id: row.association_id ?? null,
            type: row.type,
            payload: row.payload ?? {},
            is_read: false,
          })
          .select('id')
          .single();
        if (error) throw error;
        return Number(data.id);
      },
      markAllRead: async (userId, associationId) => {
        let query = n().update({ is_read: true });
        if (userId) query = query.eq('user_id', userId);
        if (associationId) query = query.eq('association_id', associationId);
        await query;
      },
    },
  };
}
