/**
 * Stockage JSON (fichiers) pour le MVP – pas de compilation native.
 * Remplace SQLite pour fonctionner partout (ex. Windows sans Python).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

function path(table) {
  return join(DATA_DIR, `${table}.json`);
}

function load(table) {
  const p = path(table);
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

function save(table, data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path(table), JSON.stringify(data, null, 2), 'utf8');
}

let users = load('users');
let associations = load('associations');
let publications = load('publications');
let publicationLikes = load('publication_likes');
let publicationComments = load('publication_comments');
let follows = load('follows');
let conversations = load('conversations');
let conversationParticipants = load('conversation_participants');
let messages = load('messages');
let quests = load('quests');
let notifications = load('notifications');
let propositions = load('propositions');

function persist() {
  save('users', users);
  save('associations', associations);
  save('publications', publications);
  save('publication_likes', publicationLikes);
  save('publication_comments', publicationComments);
  save('follows', follows);
  save('conversations', conversations);
  save('conversation_participants', conversationParticipants);
  save('messages', messages);
  save('quests', quests);
  save('notifications', notifications);
  save('propositions', propositions);
}

function reload() {
  users = load('users');
  associations = load('associations');
  publications = load('publications');
  publicationLikes = load('publication_likes');
  publicationComments = load('publication_comments');
  follows = load('follows');
  conversations = load('conversations');
  conversationParticipants = load('conversation_participants');
  messages = load('messages');
  quests = load('quests');
  notifications = load('notifications');
  propositions = load('propositions');
}

export const db = {
  users: { getAll: () => users, get: (id) => users.find((u) => u.id === id), add: (u) => { u.id = (users.length ? Math.max(...users.map((x) => x.id)) : 0) + 1; users.push(u); persist(); return u.id; }, update: (id, upd) => { const i = users.findIndex((u) => u.id === id); if (i >= 0) { users[i] = { ...users[i], ...upd }; persist(); } }, getByEmail: (email) => users.find((u) => u.email === email), delete: (id) => { users = users.filter((u) => u.id !== id); follows = follows.filter((f) => f.user_id !== id); publicationLikes = publicationLikes.filter((pl) => pl.user_id !== id); propositions = propositions.filter((p) => p.user_id !== id); conversationParticipants = conversationParticipants.filter((cp) => cp.user_id !== id); persist(); } },
  associations: { getAll: () => associations, get: (id) => associations.find((a) => a.id === id), add: (a) => { a.id = (associations.length ? Math.max(...associations.map((x) => x.id)) : 0) + 1; a.profile_views = a.profile_views || 0; associations.push(a); persist(); return a.id; }, update: (id, upd) => { const i = associations.findIndex((a) => a.id === id); if (i >= 0) { associations[i] = { ...associations[i], ...upd }; persist(); } }, getByEmail: (email) => associations.find((a) => a.email === email), incrementViews: (id) => { const a = associations.find((x) => x.id === id); if (a) { a.profile_views = (a.profile_views || 0) + 1; persist(); } }, delete: (id) => { const pubIds = publications.filter((p) => p.association_id === id).map((p) => p.id); publications = publications.filter((p) => p.association_id !== id); publicationLikes = publicationLikes.filter((pl) => !pubIds.includes(pl.publication_id)); publicationComments = publicationComments.filter((pc) => !pubIds.includes(pc.publication_id)); follows = follows.filter((f) => f.association_id !== id); propositions = propositions.filter((p) => p.association_id !== id); associations = associations.filter((a) => a.id !== id); persist(); } },
  publications: { getAll: () => publications, get: (id) => publications.find((p) => p.id === id), getByAssociation: (aid) => publications.filter((p) => p.association_id === aid), add: (p) => { p.id = (publications.length ? Math.max(...publications.map((x) => x.id)) : 0) + 1; p.created_at = new Date().toISOString(); publications.push(p); persist(); return p.id; }, update: (id, upd) => { const i = publications.findIndex((p) => p.id === id); if (i >= 0) { publications[i] = { ...publications[i], ...upd }; persist(); } }, delete: (id) => { publications = publications.filter((p) => p.id !== id); publicationLikes = publicationLikes.filter((pl) => pl.publication_id !== id); publicationComments = publicationComments.filter((pc) => pc.publication_id !== id); persist(); } },
  publicationLikes: { getByPublication: (pid) => publicationLikes.filter((pl) => pl.publication_id === pid), count: (pid) => publicationLikes.filter((pl) => pl.publication_id === pid).length, countByUser: (uid) => publicationLikes.filter((pl) => pl.user_id === uid).length, toggle: (pid, uid) => { const i = publicationLikes.findIndex((pl) => pl.publication_id === pid && pl.user_id === uid); if (i >= 0) { publicationLikes.splice(i, 1); persist(); return false; } publicationLikes.push({ publication_id: pid, user_id: uid }); persist(); return true; } },
  publicationComments: { getByPublication: (pid) => publicationComments.filter((pc) => pc.publication_id === pid), countByUser: (uid) => publicationComments.filter((pc) => pc.user_id === uid).length, add: (c) => { c.id = (publicationComments.length ? Math.max(...publicationComments.map((x) => x.id)) : 0) + 1; c.created_at = new Date().toISOString(); publicationComments.push(c); persist(); return c.id; } },
  follows: { getByUser: (uid) => follows.filter((f) => f.user_id === uid), getByAssociation: (aid) => follows.filter((f) => f.association_id === aid), countByAssociation: (aid) => follows.filter((f) => f.association_id === aid).length, add: (uid, aid) => { if (follows.some((f) => f.user_id === uid && f.association_id === aid)) return; follows.push({ user_id: uid, association_id: aid }); persist(); }, remove: (uid, aid) => { follows = follows.filter((f) => !(f.user_id === uid && f.association_id === aid)); persist(); } },
  conversations: { add: () => { const id = (conversations.length ? Math.max(...conversations.map((x) => x.id)) : 0) + 1; conversations.push({ id, created_at: new Date().toISOString() }); persist(); return id; }, get: (id) => conversations.find((c) => c.id === id) },
  conversationParticipants: { getByConversation: (cid) => conversationParticipants.filter((cp) => cp.conversation_id === cid), getConversationIdsForUser: (uid) => conversationParticipants.filter((cp) => cp.user_id === uid).map((cp) => cp.conversation_id), getConversationIdsForAssociation: (aid) => conversationParticipants.filter((cp) => cp.association_id === aid).map((cp) => cp.conversation_id), add: (cp) => { conversationParticipants.push(cp); persist(); } },
  messages: { getByConversation: (cid) => messages.filter((m) => m.conversation_id === cid).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), get: (id) => messages.find((m) => m.id === id), add: (m) => { m.id = (messages.length ? Math.max(...messages.map((x) => x.id)) : 0) + 1; m.created_at = new Date().toISOString(); messages.push(m); persist(); return m.id; } },
  quests: {
    getAll: () => quests,
    get: (id) => quests.find((q) => q.id === id),
    add: (q) => {
      q.id = (quests.length ? Math.max(...quests.map((x) => x.id)) : 0) + 1;
      q.created_at = q.updated_at = new Date().toISOString();
      quests.push(q);
      persist();
      return q.id;
    },
    update: (id, upd) => {
      const i = quests.findIndex((q) => q.id === id);
      if (i >= 0) {
        quests[i] = { ...quests[i], ...upd, updated_at: new Date().toISOString() };
        persist();
      }
    },
  },
  propositions: {
    add: (row) => {
      const id = (propositions.length ? Math.max(...propositions.map((x) => x.id)) : 0) + 1;
      propositions.push({
        id,
        user_id: row.user_id ?? null,
        association_id: row.association_id ?? null,
        category: row.category ?? '',
        public_cible: row.public_cible ?? '',
        titre: row.titre ?? '',
        description: row.description ?? '',
        created_at: new Date().toISOString(),
      });
      persist();
      return id;
    },
    getByAssociation: (associationId) => propositions.filter((p) => p.association_id === associationId),
  },
  notifications: {
    getForUser: (userId, associationId, limit = 50) => {
      const list = notifications.filter((n) => {
        if (userId && n.user_id === userId) return true;
        if (associationId && n.association_id === associationId) return true;
        return false;
      });
      return list
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    },
    add: (n) => {
      const id = (notifications.length ? Math.max(...notifications.map((x) => x.id)) : 0) + 1;
      notifications.push({
        id,
        user_id: n.user_id ?? null,
        association_id: n.association_id ?? null,
        type: n.type,
        payload: n.payload ?? {},
        is_read: false,
        created_at: new Date().toISOString(),
      });
      persist();
      return id;
    },
    markAllRead: (userId, associationId) => {
      let changed = false;
      notifications = notifications.map((n) => {
        if (
          !n.is_read &&
          ((userId && n.user_id === userId) ||
            (associationId && n.association_id === associationId))
        ) {
          changed = true;
          return { ...n, is_read: true };
        }
        return n;
      });
      if (changed) persist();
    },
  },
};

async function seed() {
  const { default: bcrypt } = await import('bcryptjs');
  const hash = bcrypt.hashSync('demo123', 10);

  // Compte démo Utilisateur (pour se connecter et accéder au profil)
  if (users.length === 0) {
    db.users.add({ email: 'user@demo.fr', password_hash: hash, name: 'Utilisateur Démo' });
  }

  if (associations.length === 0) {
    [
      { email: 'contact@solidaritejeunes.fr', password_hash: hash, name: 'Solidarité Jeunes', bio: "Association d'entraide pour les jeunes.", category: 'Humanitaire', public_cible: 'Ados, Adultes', location: 'Paris 15e', contact: 'contact@solidaritejeunes.fr', impact_points: 120, profile_views: 0, latitude: 48.8422, longitude: 2.3003 },
      { email: 'contact@culturepartage.fr', password_hash: hash, name: 'Culture & Partage', bio: 'Ateliers culturels et artistiques.', category: 'Culturel', public_cible: 'Ados, Adultes', location: 'Lyon', contact: 'contact@culturepartage.fr', impact_points: 85, profile_views: 0, latitude: 45.7640, longitude: 4.8357 },
      { email: 'contact@sportpourtous.fr', password_hash: hash, name: 'Sport pour tous', bio: 'Running et sport en groupe.', category: 'Sport', public_cible: 'Adultes', location: 'Marseille', contact: 'contact@sportpourtous.fr', impact_points: 150, profile_views: 0, latitude: 43.2965, longitude: 5.3698 },
    ].forEach((a) => db.associations.add(a));
    db.publications.add({ association_id: 1, text: 'Nous cherchons des bénévoles pour notre collecte alimentaire ce samedi. Inscription sur le lien ci-dessous !', impact_points: 12, visibility: 'public' });
    db.publications.add({ association_id: 2, text: 'Atelier peinture gratuit pour les 12-18 ans, mercredi 15h. Places limitées.', impact_points: 8, visibility: 'public' });
    db.publications.add({ association_id: 3, text: 'Nouvelle session de running collectif chaque mardi 18h. Débutants bienvenus.', impact_points: 15, visibility: 'public' });
  }
  if (quests.length === 0) {
    [
      { title: 'Point d\'accueil centre-ville', description: 'Rendez-vous au kiosque pour valider la quête.', lat: 46.603354, lng: 2.381132, radius_m: 50, reward: 'Badge Explorateur', icon_url: '', progression: 0 },
      { title: 'Parc des associations', description: 'Trouvez le totem 1PACT dans le parc.', lat: 46.612, lng: 2.39, radius_m: 80, reward: '100 points', icon_url: '', progression: 0 },
      { title: 'Gare – stand partenaire', description: 'Scannez le QR code au stand.', lat: 46.598, lng: 2.375, radius_m: 50, reward: 'Badge Voyageur', icon_url: '', progression: 0 },
    ].forEach((q) => db.quests.add(q));
  }
}

const DEMO_COORDS = {
  'contact@solidaritejeunes.fr': { latitude: 48.8422, longitude: 2.3003 },
  'contact@culturepartage.fr': { latitude: 45.7640, longitude: 4.8357 },
  'contact@sportpourtous.fr': { latitude: 43.2965, longitude: 5.3698 },
};

function ensureDemoCoords() {
  associations.forEach((a) => {
    if (a.latitude != null) return;
    const coords = DEMO_COORDS[a.email];
    if (coords) {
      a.latitude = coords.latitude;
      a.longitude = coords.longitude;
      persist();
    }
  });
}

export async function initStore() {
  reload();
  await seed();
  ensureDemoCoords();
}
