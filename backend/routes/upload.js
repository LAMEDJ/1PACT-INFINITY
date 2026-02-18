/**
 * Upload de médias (images et vidéos) pour les publications.
 * Les fichiers sont enregistrés dans backend/uploads et servis via /uploads/...
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authUser } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype?.startsWith('video/') ? '.mp4' : '.jpg');
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 Mo max
  fileFilter: (req, file, cb) => {
    const allowed = /^image\//.test(file.mimetype) || /^video\//.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Fichier non autorisé (images ou vidéos uniquement)'));
  },
});

const router = Router();

// POST /upload – un fichier (image ou vidéo), renvoie l'URL publique
router.post('/', authUser, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Erreur upload' });
    next();
  });
}, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoyé' });
  const url = `/uploads/${req.file.filename}`;
  return res.json({ url });
});

// POST /upload/multiple – plusieurs fichiers (pour une publication avec galerie)
router.post('/multiple', authUser, (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Erreur upload' });
    next();
  });
}, (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Aucun fichier envoyé' });
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  return res.json({ urls });
});

export default router;
