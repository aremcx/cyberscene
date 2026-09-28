import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home';
import { ArticlesPage } from './pages/Articles';
import { ThreatIntelPage } from './pages/ThreatIntel';
import { ToolsPage } from './pages/Tools';
import { AcademyPage } from './pages/Academy';
import { CommunityPage } from './pages/Community';
import { JobsPage } from './pages/Jobs';
import { LoginPage } from './pages/Login';
import { NotFoundPage } from './pages/NotFound';
import { ROUTES } from './config/routes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.ARTICLES} element={<ArticlesPage />} />
            <Route path={ROUTES.THREAT_INTEL} element={<ThreatIntelPage />} />
            <Route path={ROUTES.TOOLS} element={<ToolsPage />} />
            <Route path={ROUTES.ACADEMY} element={<AcademyPage />} />
            <Route path={ROUTES.COMMUNITY} element={<CommunityPage />} />
            <Route path={ROUTES.JOBS} element={<JobsPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
