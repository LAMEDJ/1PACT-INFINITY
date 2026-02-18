/**
 * Page Accueil – Landing marketing ultra premium animée (style Apple / SaaS 2026).
 * 100% marketing. Widgets dynamiques sur le Fil d'actualité.
 */
import { useAuth } from '../context/AuthContext';
import HeroSectionPremium from '../components/landing/HeroSectionPremium';
import HowItWorksAnimated from '../components/landing/HowItWorksAnimated';
import ImpactGamificationSection from '../components/landing/ImpactGamificationSection';
import TargetAudienceSection from '../components/landing/TargetAudienceSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import '../components/landing/Landing.css';
import './PageCommon.css';
import './AccueilPage.css';

export default function AccueilPage({ onGoToPage }) {
  const { user } = useAuth();

  return (
    <div className="page accueil-page accueil-page--landing">
      <div className="page-inner accueil-page-inner accueil-page-inner--landing">
        <HeroSectionPremium user={user} onGoToPage={onGoToPage} />
        <HowItWorksAnimated />
        <ImpactGamificationSection />
        <TargetAudienceSection />
        <SocialProofSection />
        <FinalCTASection user={user} onGoToPage={onGoToPage} />
      </div>
    </div>
  );
}
