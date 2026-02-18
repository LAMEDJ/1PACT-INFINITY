/**
 * Page 404 – route inconnue.
 */
import { Link } from 'react-router-dom';
import './PageCommon.css';

export default function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <div className="page-inner not-found-inner">
        <h2>Page introuvable</h2>
        <p>L'adresse demandée n'existe pas.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
