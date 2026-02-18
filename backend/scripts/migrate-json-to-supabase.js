/**
 * Migre les données des fichiers JSON (backend/data/) vers Supabase.
 * À lancer une fois après avoir exécuté le schéma SQL et renseigné SUPABASE_SERVICE_ROLE_KEY dans backend/.env
 *
 * Usage: node scripts/migrate-json-to-supabase.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

function load(table) {
  const p = join(DATA_DIR, `${table}.json`);
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !String(key).trim()) {
    console.error('Définit SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans backend/.env (clé depuis Supabase > Settings > API)');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const users = load('users');
  const associations = load('associations');
  const publications = load('publications');
  const publicationLikes = load('publication_likes');
  const publicationComments = load('publication_comments');
  const follows = load('follows');
  const conversations = load('conversations');
  const conversationParticipants = load('conversation_participants');
  const messages = load('messages');

  const userNew = {};
  const assocNew = {};
  const pubNew = {};
  const convNew = {};

  console.log('Migration JSON → Supabase (projet 1PACT)...');

  for (const u of users) {
    const { data, error } = await supabase.from('users').insert({
      email: u.email,
      password_hash: u.password_hash,
      name: u.name,
    }).select('id').single();
    if (error) {
      console.error('users', u.id, error.message);
      continue;
    }
    userNew[u.id] = data.id;
  }
  console.log('Users:', Object.keys(userNew).length);

  for (const a of associations) {
    const { data, error } = await supabase.from('associations').insert({
      email: a.email,
      password_hash: a.password_hash,
      name: a.name,
      bio: a.bio ?? '',
      category: a.category ?? '',
      public_cible: a.public_cible ?? '',
      location: a.location ?? '',
      contact: a.contact ?? a.email ?? '',
      profile_views: a.profile_views ?? 0,
      latitude: a.latitude ?? null,
      longitude: a.longitude ?? null,
      impact_points: a.impact_points ?? 0,
    }).select('id').single();
    if (error) {
      console.error('associations', a.id, error.message);
      continue;
    }
    assocNew[a.id] = data.id;
  }
  console.log('Associations:', Object.keys(assocNew).length);

  for (const p of publications) {
    const aid = assocNew[p.association_id];
    if (aid == null) continue;
    const { data, error } = await supabase.from('publications').insert({
      association_id: aid,
      text: p.text ?? '',
      image_url: p.image_url ?? null,
      video_url: p.video_url ?? null,
      visibility: p.visibility ?? 'public',
      impact_points: p.impact_points ?? 0,
    }).select('id').single();
    if (error) {
      console.error('publications', p.id, error.message);
      continue;
    }
    pubNew[p.id] = data.id;
  }
  console.log('Publications:', Object.keys(pubNew).length);

  for (const pl of publicationLikes) {
    const pid = pubNew[pl.publication_id];
    const uid = userNew[pl.user_id];
    if (pid == null || uid == null) continue;
    await supabase.from('publication_likes').insert({ publication_id: pid, user_id: uid }).select();
  }
  console.log('Publication likes:', publicationLikes.length);

  for (const c of publicationComments) {
    const pid = pubNew[c.publication_id];
    if (pid == null) continue;
    await supabase.from('publication_comments').insert({
      publication_id: pid,
      user_id: c.user_id ? userNew[c.user_id] ?? null : null,
      association_id: c.association_id ? assocNew[c.association_id] ?? null : null,
      text: c.text,
    });
  }
  console.log('Publication comments:', publicationComments.length);

  for (const f of follows) {
    const uid = userNew[f.user_id];
    const aid = assocNew[f.association_id];
    if (uid == null || aid == null) continue;
    await supabase.from('follows').insert({ user_id: uid, association_id: aid }).select();
  }
  console.log('Follows:', follows.length);

  for (const c of conversations) {
    const { data, error } = await supabase.from('conversations').insert({}).select('id').single();
    if (error) {
      console.error('conversations', c.id, error.message);
      continue;
    }
    convNew[c.id] = data.id;
  }
  console.log('Conversations:', Object.keys(convNew).length);

  for (const cp of conversationParticipants) {
    const cid = convNew[cp.conversation_id];
    if (cid == null) continue;
    await supabase.from('conversation_participants').insert({
      conversation_id: cid,
      user_id: cp.user_id ? userNew[cp.user_id] ?? null : null,
      association_id: cp.association_id ? assocNew[cp.association_id] ?? null : null,
    });
  }
  console.log('Conversation participants:', conversationParticipants.length);

  for (const m of messages) {
    const cid = convNew[m.conversation_id];
    if (cid == null) continue;
    await supabase.from('messages').insert({
      conversation_id: cid,
      sender_user_id: m.sender_user_id ? userNew[m.sender_user_id] ?? null : null,
      sender_association_id: m.sender_association_id ? assocNew[m.sender_association_id] ?? null : null,
      text: m.text,
    });
  }
  console.log('Messages:', messages.length);

  console.log('Migration terminée.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
