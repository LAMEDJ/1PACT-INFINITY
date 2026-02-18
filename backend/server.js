/**
 * Serveur 1PACT : API REST + Socket.io (chat temps réel).
 * Charge les variables d'environnement depuis .env (dotenv) avant tout.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initStore } from './db.js';
import authRoutes from './routes/auth.js';
import associationsRoutes from './routes/associations.js';
import publicationsRoutes from './routes/publications.js';
import messagesRoutes from './routes/messages.js';
import dashboardRoutes from './routes/dashboard.js';
import stripeRoutes from './routes/stripe.js';
import uploadRoutes from './routes/upload.js';
import followsRoutes from './routes/follows.js';
import questsRoutes from './routes/quests.js';
import notificationsRoutes from './routes/notifications.js';
import propositionsRoutes from './routes/propositions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

// Sécurité : en production, JWT_SECRET doit être défini et différent du défaut
if (isProd) {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret === 'change-moi-en-production' || secret.length < 24) {
    console.error('En production, définis JWT_SECRET dans .env (min. 24 caractères aléatoires).');
    process.exit(1);
  }
}

const corsOrigin = process.env.CORS_ORIGIN || true;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
});

// En-têtes de sécurité
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '512kb' }));

// Fichiers uploadés (médias) accessibles via /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Stocker la fonction d'émission pour les routes (après création du message en HTTP)
app.locals.emitMessage = (conversationId, message) => {
  io.to(`conv:${conversationId}`).emit('new_message', message);
};

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/associations', associationsRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/conversations', messagesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/propositions', propositionsRoutes);

// Erreur 404
app.use((req, res) => res.status(404).json({ error: 'Route non trouvée' }));

// Socket.io : rejoindre une conversation et recevoir les messages en direct
io.on('connection', (socket) => {
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conv:${conversationId}`);
  });
});

const PORT = process.env.PORT || 3000;

// Éviter que le processus plante sur une promesse rejetée non gérée
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

initStore()
  .then(() => {
    httpServer.listen(PORT, () => {
      const dbMode = process.env.SUPABASE_URL ? 'Supabase (PostgreSQL)' : 'JSON (fichiers)';
      console.log(`1PACT API + Socket.io sur http://localhost:${PORT} [DB: ${dbMode}]`);
    });
  })
  .catch((err) => {
    console.error('Erreur init DB:', err);
    process.exit(1);
  });
