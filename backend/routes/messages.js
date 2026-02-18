import { Router } from 'express';
import { db } from '../db.js';
import { authUser } from '../middleware/auth.js';

const router = Router();

router.get('/', authUser, async (req, res) => {
  const convIds = req.userType === 'association'
    ? await db.conversationParticipants.getConversationIdsForAssociation(req.userId)
    : await db.conversationParticipants.getConversationIdsForUser(req.userId);
  const result = [];
  for (const cid of [...new Set(convIds)]) {
    const msgs = await db.messages.getByConversation(cid);
    const lastMsg = msgs[msgs.length - 1];
    const participants = await db.conversationParticipants.getByConversation(cid);
    let otherName = 'Conversation';
    for (const p of participants) {
      if (p.user_id && (req.userType !== 'user' || p.user_id !== req.userId)) {
        const u = await db.users.get(p.user_id);
        if (u) otherName = u.name;
        break;
      }
      if (p.association_id && (req.userType !== 'association' || p.association_id !== req.userId)) {
        const a = await db.associations.get(p.association_id);
        if (a) otherName = a.name;
        break;
      }
    }
    const conv = await db.conversations.get(cid);
    result.push({
      id: cid,
      otherName,
      lastMessage: lastMsg?.text || null,
      lastMessageAt: lastMsg?.created_at || conv?.created_at,
      unread: false,
    });
  }
  result.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
  return res.json(result);
});

router.post('/', authUser, async (req, res) => {
  const { other_user_id, other_association_id } = req.body;
  if (!other_user_id && !other_association_id) return res.status(400).json({ error: 'Indiquer other_user_id ou other_association_id' });
  // Empêcher un utilisateur / une association de se contacter lui‑même
  if ((req.userType === 'user' && other_user_id && Number(other_user_id) === req.userId) ||
      (req.userType === 'association' && other_association_id && Number(other_association_id) === req.userId)) {
    return res.status(400).json({ error: 'Impossible de démarrer une conversation avec vous-même.' });
  }

  let convId = null;

  // Chercher une conversation existante entre les deux participants
  if (req.userType === 'user') {
    const myUserId = req.userId;
    if (other_user_id) {
      const targetUserId = Number(other_user_id);
      const mine = await db.conversationParticipants.getConversationIdsForUser(myUserId);
      const theirs = await db.conversationParticipants.getConversationIdsForUser(targetUserId);
      convId = mine.find((id) => theirs.includes(id)) ?? null;
      if (!convId) {
        convId = await db.conversations.add();
        await db.conversationParticipants.add({ conversation_id: convId, user_id: myUserId, association_id: null });
        await db.conversationParticipants.add({ conversation_id: convId, user_id: targetUserId, association_id: null });
      }
    } else {
      const targetAssociationId = Number(other_association_id);
      const mine = await db.conversationParticipants.getConversationIdsForUser(myUserId);
      const theirs = await db.conversationParticipants.getConversationIdsForAssociation(targetAssociationId);
      convId = mine.find((id) => theirs.includes(id)) ?? null;
      if (!convId) {
        convId = await db.conversations.add();
        await db.conversationParticipants.add({ conversation_id: convId, user_id: myUserId, association_id: null });
        await db.conversationParticipants.add({ conversation_id: convId, user_id: null, association_id: targetAssociationId });
      }
    }
  } else {
    const myAssociationId = req.userId;
    if (other_user_id) {
      const targetUserId = Number(other_user_id);
      const mine = await db.conversationParticipants.getConversationIdsForAssociation(myAssociationId);
      const theirs = await db.conversationParticipants.getConversationIdsForUser(targetUserId);
      convId = mine.find((id) => theirs.includes(id)) ?? null;
      if (!convId) {
        convId = await db.conversations.add();
        await db.conversationParticipants.add({ conversation_id: convId, user_id: null, association_id: myAssociationId });
        await db.conversationParticipants.add({ conversation_id: convId, user_id: targetUserId, association_id: null });
      }
    } else {
      const targetAssociationId = Number(other_association_id);
      if (targetAssociationId === myAssociationId) {
        return res.status(400).json({ error: 'Impossible de démarrer une conversation avec vous-même.' });
      }
      const mine = await db.conversationParticipants.getConversationIdsForAssociation(myAssociationId);
      const theirs = await db.conversationParticipants.getConversationIdsForAssociation(targetAssociationId);
      convId = mine.find((id) => theirs.includes(id)) ?? null;
      if (!convId) {
        convId = await db.conversations.add();
        await db.conversationParticipants.add({ conversation_id: convId, user_id: null, association_id: myAssociationId });
        await db.conversationParticipants.add({ conversation_id: convId, user_id: null, association_id: targetAssociationId });
      }
    }
  }

  return res.status(201).json({ id: convId });
});

router.get('/:id/messages', authUser, async (req, res) => {
  const cid = Number(req.params.id);
  const participants = await db.conversationParticipants.getByConversation(cid);
  const allowed = participants.some((p) =>
    (p.user_id === req.userId && req.userType === 'user') || (p.association_id === req.userId && req.userType === 'association'));
  if (!allowed) return res.status(404).json({ error: 'Conversation introuvable' });
  const messages = await db.messages.getByConversation(cid);
  return res.json(messages);
});

router.post('/:id/messages', authUser, async (req, res) => {
  const cid = Number(req.params.id);
  const participants = await db.conversationParticipants.getByConversation(cid);
  const allowed = participants.some((p) =>
    (p.user_id === req.userId && req.userType === 'user') || (p.association_id === req.userId && req.userType === 'association'));
  if (!allowed) return res.status(404).json({ error: 'Conversation introuvable' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texte requis' });
  const senderUserId = req.userType === 'user' ? req.userId : null;
  const senderAssociationId = req.userType === 'association' ? req.userId : null;
  const id = await db.messages.add({ conversation_id: cid, sender_user_id: senderUserId, sender_association_id: senderAssociationId, text });
  const messages = await db.messages.getByConversation(cid);
  const row = messages.find((m) => m.id === id);
  req.app.locals.emitMessage?.(cid, row);

  // Notifications de nouveau message pour tous les autres participants
  const senderName =
    senderUserId ? (await db.users.get(senderUserId))?.name :
    senderAssociationId ? (await db.associations.get(senderAssociationId))?.name :
    'Nouveau message';

  await Promise.all(
    participants.map(async (p) => {
      if (p.user_id && senderUserId && p.user_id === senderUserId) return;
      if (p.association_id && senderAssociationId && p.association_id === senderAssociationId) return;
      if (p.user_id) {
        await db.notifications.add({
          user_id: p.user_id,
          association_id: null,
          type: 'message',
          payload: { conversation_id: cid, from_user_id: senderUserId, from_association_id: senderAssociationId, from_name: senderName, text },
        });
      } else if (p.association_id) {
        await db.notifications.add({
          user_id: null,
          association_id: p.association_id,
          type: 'message',
          payload: { conversation_id: cid, from_user_id: senderUserId, from_association_id: senderAssociationId, from_name: senderName, text },
        });
      }
    })
  ).catch(() => {});

  return res.status(201).json(row);
});

export default router;
