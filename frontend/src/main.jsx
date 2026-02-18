import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ImpactProvider } from './context/ImpactContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
const BackgroundImage = lazy(() => import('./components/BackgroundImage.jsx'))
import './index.css'
import App from './App.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AssociationProfilePage from './pages/AssociationProfilePage.jsx'
import PublishPage from './pages/PublishPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CockpitPage from './pages/CockpitPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <ThemeProvider>
      <ImpactProvider>
      <ToastProvider>
      <SettingsProvider>
      <div className="app-shell">
        <Suspense fallback={<div className="background-image-fallback" aria-hidden="true" />}>
          <BackgroundImage />
        </Suspense>
        <div className="app-routes">
        <Routes>
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<Navigate to="/?page=4" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/association/:id" element={<AssociationProfilePage />} />
        <Route path="/publish" element={<ProtectedRoute><PublishPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requireAssociation><DashboardPage /></ProtectedRoute>} />
        <Route path="/cockpit" element={<ProtectedRoute><CockpitPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </div>
      </div>
      </SettingsProvider>
      </ToastProvider>
      </ImpactProvider>
      </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
