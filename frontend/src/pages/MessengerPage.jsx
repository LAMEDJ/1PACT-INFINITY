/**
 * Messagerie type Messenger – conversations, envoi/réception temps réel, non-lus.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './PageCommon.css';
import './MessengerPage.css';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatPreview(text) {
  if (!text) return 'Aucun message';
  return text.length > 45 ? text.slice(0, 45) + '…' : text;
}

export default function MessengerPage({ openConv }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(openConv ?? null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [associationsList, setAssociationsList] = useState([]);
  const [creatingConv, setCreatingConv] = useState(false);
  const [unreadIds, setUnreadIds] = useState(new Set());
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef(selectedId);

  selectedIdRef.current = selectedId;

  const fetchConversations = useCallback(() => {
    if (!user) return;
    api.conversations.list().then((list) => {
      setConversations(list);
    }).catch(() => setConversations([]));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    if (openConv != null) setSelectedId(openConv);
  }, [user, openConv, fetchConversations]);

  useEffect(() => {
    if (showNewConv && user?.type === 'user') {
      api.associations.list().then(setAssociationsList).catch(() => setAssociationsList([]));
    }
  }, [showNewConv, user?.type]);

  // Un seul socket par utilisateur
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('new_message', (msg) => {
      const cid = Number(msg.conversation_id);
      const isCurrent = cid === selectedIdRef.current;

      if (isCurrent) {
        setMessages((m) => [...m, msg]);
      } else {
        setUnreadIds((prev) => new Set(prev).add(cid));
        setConversations((prev) => {
          const next = prev.map((c) =>
            c.id === cid
              ? { ...c, lastMessage: msg.text, lastMessageAt: msg.created_at, unread: true }
              : c
          );
          const conv = next.find((c) => c.id === cid);
          if (conv) {
            const rest = next.filter((c) => c.id !== cid);
            return [{ ...conv, lastMessage: msg.text, lastMessageAt: msg.created_at }, ...rest];
          }
          return next;
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Rejoindre la conversation sélectionnée (pour recevoir les messages en direct)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedId) return;
    socket.emit('join_conversation', selectedId);
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedId);
      return next;
    });
    setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, unread: false } : c)));
    return () => {
      socket.emit('leave_conversation', selectedId);
    };
  }, [selectedId]);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedId || !user) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    api.conversations.messages(selectedId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [selectedId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await api.conversations.sendMessage(selectedId, text);
      setMessages((m) => [...m, msg]);
      setConversations((prev) => {
        const updated = prev.find((c) => c.id === selectedId);
        if (!updated) return prev;
        const rest = prev.filter((c) => c.id !== selectedId);
        return [{ ...updated, lastMessage: msg.text, lastMessageAt: msg.created_at }, ...rest];
      });
    } catch (err) {
      addToast(err?.message || 'Erreur envoi', 'error');
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const startConversation = async (associationId) => {
    setCreatingConv(true);
    try {
      const { id: convId } = await api.conversations.create(null, associationId);
      const assoc = associationsList.find((a) => a.id === associationId);
      setConversations((prev) => [
        { id: convId, otherName: assoc?.name || 'Association', lastMessage: null, lastMessageAt: null, unread: false },
        ...prev,
      ]);
      setSelectedId(convId);
      setShowNewConv(false);
    } catch (err) {
      addToast(err?.message || 'Erreur création conversation', 'error');
    } finally {
      setCreatingConv(false);
    }
  };

  const selectConversation = (id) => {
    setSelectedId(id);
  };

  if (!user) {
    return (
      <div className="page messenger-page">
        <div className="page-inner messenger-guest messenger-page__glass">
          <h2>💬 Messagerie</h2>
          <p>Connectez-vous pour échanger avec les associations ou d'autres utilisateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page messenger-page">
      <div className="page-inner messenger-inner messenger-page__glass">
        <div className="messenger-header">
          <h2>💬 Messagerie</h2>
          {user.type === 'user' && (
            <button
              type="button"
              className="btn-primary messenger-new-btn"
              onClick={() => setShowNewConv(!showNewConv)}
            >
              {showNewConv ? 'Fermer' : 'Nouvelle conversation'}
            </button>
          )}
          {user.type === 'association' && (
            <span className="messenger-new-hint">Répondez aux utilisateurs dans les conversations ci-dessous.</span>
          )}
        </div>

        {showNewConv && user.type === 'user' && (
          <div className="messenger-new-conv-panel">
            <h3>Choisir une association</h3>
            {associationsList.length === 0 && !creatingConv && <p className="page-hint">Chargement...</p>}
            <ul className="messenger-assoc-list">
              {associationsList.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="messenger-assoc-item"
                    onClick={() => startConversation(a.id)}
                    disabled={creatingConv}
                  >
                    <span className="conversation-avatar">{a.name?.charAt(0)}</span>
                    <span>{a.name}</span>
                    {a.category && <span className="messenger-assoc-cat">{a.category}</span>}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-secondary" onClick={() => setShowNewConv(false)}>Fermer</button>
          </div>
        )}

        <div className="messenger-layout">
          <aside className="messenger-sidebar">
            {conversations.length === 0 && !selectedId && !showNewConv && (
              <p className="conversation-empty">Aucune conversation. Cliquez sur « Nouvelle conversation » ou contactez une association depuis son profil.</p>
            )}
            <ul className="conversation-list">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    type="button"
                    className={`conversation-item ${selectedId === conv.id ? 'active' : ''} ${unreadIds.has(conv.id) ? 'unread' : ''}`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <div className="conversation-avatar">{conv.otherName?.charAt(0) || '?'}</div>
                    <div className="conversation-body">
                      <span className="conversation-name">{conv.otherName}</span>
                      <span className="conversation-preview">{formatPreview(conv.lastMessage)}</span>
                    </div>
                    <div className="conversation-meta">
                      <span className="conversation-time">{conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}</span>
                      {unreadIds.has(conv.id) && <span className="conversation-badge" aria-label="Non lu" />}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="chat-panel">
            {!selectedId ? (
              <div className="chat-placeholder">
                <p>Sélectionnez une conversation ou créez-en une avec une association.</p>
              </div>
            ) : (
              <>
                <header className="chat-header">
                  <span>{selectedConv?.otherName || 'Conversation'}</span>
                </header>
                <div className="chat-messages">
                  {messagesLoading && <p className="chat-loading">Chargement des messages...</p>}
                  {!messagesLoading && messages.length === 0 && (
                    <p className="chat-empty">Aucun message. Envoyez le premier !</p>
                  )}
                  {messages.map((msg) => {
                    const isMe =
                      (user.type === 'user' && msg.sender_user_id === user.id) ||
                      (user.type === 'association' && msg.sender_association_id === user.id);
                    return (
                      <div key={msg.id} className={`chat-message ${isMe ? 'me' : ''}`}>
                        <span className="chat-message-text">{msg.text}</span>
                        <span className="chat-message-time">{formatTime(msg.created_at)}</span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form className="chat-form" onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    disabled={sending}
                    maxLength={2000}
                  />
                  <button type="submit" className="btn-primary" disabled={sending || !input.trim()}>
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
