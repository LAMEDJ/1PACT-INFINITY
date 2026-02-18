/**
 * Tableau de bord association – stats et publications (API).
 */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './PageCommon.css';
import './DashboardPage.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d) / 60000;
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString('fr-FR');
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAssociation } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user || !isAssociation) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    Promise.all([api.dashboard.stats(), api.dashboard.publications()])
      .then(([s, p]) => {
        setStats(s);
        setPosts(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isAssociation]);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette publication ?')) return;
    setDeletingId(id);
    try {
      await api.publications.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      addToast('Publication supprimée.', 'success');
    } catch (e) {
      addToast(e?.message || 'Erreur suppression', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStripe = async () => {
    try {
      const data = await api.stripe.createCheckout();
      if (data.url) window.location.href = data.url;
      else addToast(data.message || 'Paiement non configuré. Configurez STRIPE_SECRET_KEY côté serveur.', 'info');
    } catch (e) {
      addToast(e?.message || 'Paiement non disponible.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="page dashboard-page">
        <div className="page-inner">
          <button type="button" className="back-link" onClick={() => navigate('/')}>← Retour</button>
          <p>Connectez-vous en tant qu'association pour accéder au tableau de bord.</p>
          <Link to="/login" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Se connecter</Link>
        </div>
      </div>
    );
  }

  if (!isAssociation) {
    return (
      <div className="page dashboard-page">
        <div className="page-inner">
          <button type="button" className="back-link" onClick={() => navigate('/')}>← Retour</button>
          <p>Réservé aux associations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="page-inner">
        <button type="button" className="back-link" onClick={() => navigate('/')}>← Retour</button>
        <h2>📊 Tableau de bord</h2>

        {loading && <p>Chargement...</p>}
        {stats && (
          <section className="dashboard-stats">
            <h3>Statistiques</h3>
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card"><span className="dashboard-stat-value">{stats.profileViews}</span><span className="dashboard-stat-label">Vues du profil</span></div>
              <div className="dashboard-stat-card"><span className="dashboard-stat-value">{stats.subscribers}</span><span className="dashboard-stat-label">Abonnés</span></div>
              <div className="dashboard-stat-card"><span className="dashboard-stat-value">{stats.likes}</span><span className="dashboard-stat-label">Likes</span></div>
              <div className="dashboard-stat-card"><span className="dashboard-stat-value">{stats.comments}</span><span className="dashboard-stat-label">Commentaires</span></div>
            </div>
          </section>
        )}

        <section className="dashboard-posts">
          <h3>Gestion des publications</h3>
          <button type="button" className="btn-primary dashboard-new-post" onClick={() => navigate('/publish')}>Nouvelle publication</button>
          <ul className="dashboard-post-list">
            {posts.map((post) => (
              <li key={post.id} className="dashboard-post-item">
                <div>
                  <p className="dashboard-post-text">{post.text}</p>
                  <span className="dashboard-post-meta">{formatDate(post.created_at)} · {post.likes ?? 0} likes</span>
                </div>
                <div className="dashboard-post-actions">
                  <button type="button" className="dashboard-post-btn" onClick={() => navigate(`/publish?edit=${post.id}`)}>Modifier</button>
                  <button type="button" className="dashboard-post-btn danger" onClick={() => handleDelete(post.id)} disabled={deletingId === post.id}>{deletingId === post.id ? 'Suppression...' : 'Supprimer'}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="dashboard-billing">
          <h3>Abonnement / Facturation</h3>
          <p className="dashboard-billing-desc">Gestion via Stripe (à configurer avec STRIPE_SECRET_KEY).</p>
          <button type="button" className="btn-secondary" onClick={handleStripe}>Gérer l'abonnement</button>
        </section>
      </div>
    </div>
  );
}
