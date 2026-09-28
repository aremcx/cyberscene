import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './components/auth/AuthProvider';
import { AdminRoute } from './components/auth/AdminRoute';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/Home';
import { ArticlesPage } from './pages/Articles';
import { NewsPage } from './pages/News';
import { TutorialsPage } from './pages/Tutorials';
import { ResearchPage } from './pages/Research';
import { VulnerabilitiesPage } from './pages/Vulnerabilities';
import { EventsPage } from './pages/Events';
import { SecurityAwarenessPage } from './pages/SecurityAwareness';
import { ThreatIntelligencePage } from './pages/ThreatIntelligence';
import { IntelligenceDashboardPage } from './pages/IntelligenceDashboard';
import { ToolsPage } from './pages/Tools';
import { ToolDetailPage } from './pages/ToolDetail';
import { AcademyPage } from './pages/Academy';
import { CommunityPage } from './pages/Community';
import { JobsPage } from './pages/Jobs';
import { SearchResults } from './components/search/SearchResults';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AuthDemoPage } from './pages/auth/AuthDemoPage';
import { DatabaseDemoPage } from './pages/DatabaseDemo';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminArticles } from './pages/admin/AdminArticles';
import { ArticleEditor } from './pages/admin/ArticleEditor';
import { ReviewQueue } from './pages/admin/ReviewQueue';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminTags } from './pages/admin/AdminTags';
import { AdminAuthors } from './pages/admin/AdminAuthors';
import { AdminTools } from './pages/admin/AdminTools';
import { NotFoundPage } from './pages/NotFound';
import { ROUTES } from './config/routes';
import { initializeDatabase } from './db';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = async () => {
      await initializeDatabase({ seed: true });
    };
    init();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInitializer>
          <AuthProvider>
            <Routes>
              <Route element={<Layout />}>
                {/* Public Routes */}
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.ARTICLES} element={<ArticlesPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/tutorials" element={<TutorialsPage />} />
                <Route path="/research" element={<ResearchPage />} />
                <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/security-awareness" element={<SecurityAwarenessPage />} />
                <Route path={ROUTES.THREAT_INTEL} element={<ThreatIntelligencePage />} />
                <Route path="/intelligence" element={<IntelligenceDashboardPage />} />
                <Route path={ROUTES.TOOLS} element={<ToolsPage />} />
                <Route path="/tools/:slug" element={<ToolDetailPage />} />
                <Route path={ROUTES.ACADEMY} element={<AcademyPage />} />
                <Route path={ROUTES.COMMUNITY} element={<CommunityPage />} />
                <Route path={ROUTES.JOBS} element={<JobsPage />} />
                <Route path="/search" element={<SearchResults />} />

                {/* Auth Routes */}
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

                {/* Admin Routes */}
                <Route
                  path={ROUTES.ADMIN}
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path={ROUTES.ADMIN_ARTICLES}
                  element={
                    <AdminRoute>
                      <AdminArticles />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/articles/new"
                  element={
                    <AdminRoute>
                      <ArticleEditor />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/articles/:id/edit"
                  element={
                    <AdminRoute>
                      <ArticleEditor />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/review"
                  element={
                    <AdminRoute>
                      <ReviewQueue />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategories />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tags"
                  element={
                    <AdminRoute>
                      <AdminTags />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/authors"
                  element={
                    <AdminRoute>
                      <AdminAuthors />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/tools"
                  element={
                    <AdminRoute>
                      <AdminTools />
                    </AdminRoute>
                  }
                />

                {/* Demo Routes */}
                <Route path={ROUTES.DEMO_DATABASE} element={<DatabaseDemoPage />} />
                <Route path={ROUTES.AUTH_DEMO} element={<AuthDemoPage />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </AppInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
