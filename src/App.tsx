import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './components/auth/AuthProvider';
import { AdminRoute } from './components/auth/AdminRoute';
import { Layout } from './components/layout/Layout';
import { ROUTES } from './config/routes';
import { initializeDatabase } from './db';

const HomePage = lazy(() => import('./pages/Home').then((module) => ({ default: module.HomePage })));
const ArticlesPage = lazy(() => import('./pages/Articles').then((module) => ({ default: module.ArticlesPage })));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage').then((module) => ({ default: module.ArticleDetailPage })));
const NewsPage = lazy(() => import('./pages/News').then((module) => ({ default: module.NewsPage })));
const TutorialsPage = lazy(() => import('./pages/Tutorials').then((module) => ({ default: module.TutorialsPage })));
const ResearchPage = lazy(() => import('./pages/Research').then((module) => ({ default: module.ResearchPage })));
const VulnerabilitiesPage = lazy(() => import('./pages/Vulnerabilities').then((module) => ({ default: module.VulnerabilitiesPage })));
const EventsPage = lazy(() => import('./pages/Events').then((module) => ({ default: module.EventsPage })));
const SecurityAwarenessPage = lazy(() => import('./pages/SecurityAwareness').then((module) => ({ default: module.SecurityAwarenessPage })));
const ThreatIntelligencePage = lazy(() => import('./pages/ThreatIntelligence').then((module) => ({ default: module.ThreatIntelligencePage })));
const IntelligenceDashboardPage = lazy(() => import('./pages/IntelligenceDashboard').then((module) => ({ default: module.IntelligenceDashboardPage })));
const ToolsPage = lazy(() => import('./pages/Tools').then((module) => ({ default: module.ToolsPage })));
const ToolDetailPage = lazy(() => import('./pages/ToolDetail').then((module) => ({ default: module.ToolDetailPage })));
const AcademyPage = lazy(() => import('./pages/Academy').then((module) => ({ default: module.AcademyPage })));
const LearningPathsPage = lazy(() => import('./pages/academy/LearningPathsPage').then((module) => ({ default: module.LearningPathsPage })));
const LearningPathDetailPage = lazy(() => import('./pages/academy/LearningPathDetailPage').then((module) => ({ default: module.LearningPathDetailPage })));
const LabsPage = lazy(() => import('./pages/academy/LabsPage').then((module) => ({ default: module.LabsPage })));
const LabDetailPage = lazy(() => import('./pages/academy/LabDetailPage').then((module) => ({ default: module.LabDetailPage })));
const UserDashboardPage = lazy(() => import('./pages/academy/UserDashboardPage').then((module) => ({ default: module.UserDashboardPage })));
const CommunityPage = lazy(() => import('./pages/Community').then((module) => ({ default: module.CommunityPage })));
const JobsPage = lazy(() => import('./pages/Jobs').then((module) => ({ default: module.JobsPage })));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage').then((module) => ({ default: module.JobDetailPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then((module) => ({ default: module.EventDetailPage })));
const VulnerabilityDetailPage = lazy(() => import('./pages/VulnerabilityDetailPage').then((module) => ({ default: module.VulnerabilityDetailPage })));
const SearchResults = lazy(() => import('./components/search/SearchResults').then((module) => ({ default: module.SearchResults })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const AuthDemoPage = lazy(() => import('./pages/auth/AuthDemoPage').then((module) => ({ default: module.AuthDemoPage })));
const DatabaseDemoPage = lazy(() => import('./pages/DatabaseDemo').then((module) => ({ default: module.DatabaseDemoPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles').then((module) => ({ default: module.AdminArticles })));
const ArticleEditor = lazy(() => import('./pages/admin/ArticleEditor').then((module) => ({ default: module.ArticleEditor })));
const ReviewQueue = lazy(() => import('./pages/admin/ReviewQueue').then((module) => ({ default: module.ReviewQueue })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then((module) => ({ default: module.AdminCategories })));
const AdminTags = lazy(() => import('./pages/admin/AdminTags').then((module) => ({ default: module.AdminTags })));
const AdminAuthors = lazy(() => import('./pages/admin/AdminAuthors').then((module) => ({ default: module.AdminAuthors })));
const AdminTools = lazy(() => import('./pages/admin/AdminTools').then((module) => ({ default: module.AdminTools })));
const NewsletterManagementPage = lazy(() => import('./pages/admin/NewsletterManagementPage').then((module) => ({ default: module.NewsletterManagementPage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage').then((module) => ({ default: module.AIAssistantPage })));
const NotFoundPage = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFoundPage })));

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const init = async () => {
      await initializeDatabase({ seed: true });
    };
    init();
  }, []);

  return <>{children}</>;
}

function AppLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
        <p className="text-gray-400">Loading page...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInitializer>
          <AuthProvider>
            <Suspense fallback={<AppLoadingState />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.ARTICLES} element={<ArticlesPage />} />
                  <Route path="/articles/:slug" element={<ArticleDetailPage />} />
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
                  <Route path="/academy/paths" element={<LearningPathsPage />} />
                  <Route path="/academy/paths/:slug" element={<LearningPathDetailPage />} />
                  <Route path="/academy/labs" element={<LabsPage />} />
                  <Route path="/academy/labs/:slug" element={<LabDetailPage />} />
                  <Route path="/academy/dashboard" element={<UserDashboardPage />} />
                  <Route path={ROUTES.COMMUNITY} element={<CommunityPage />} />
                  <Route path={ROUTES.JOBS} element={<JobsPage />} />
                  <Route path="/jobs/:slug" element={<JobDetailPage />} />
                  <Route path="/events/:slug" element={<EventDetailPage />} />
                  <Route path="/vulnerabilities/:cveId" element={<VulnerabilityDetailPage />} />
                  <Route path="/search" element={<SearchResults />} />

                  <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                  <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                  <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

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
                  <Route
                    path="/admin/newsletter"
                    element={
                      <AdminRoute>
                        <NewsletterManagementPage />
                      </AdminRoute>
                    }
                  />

                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path={ROUTES.DEMO_DATABASE} element={<DatabaseDemoPage />} />
                  <Route path={ROUTES.AUTH_DEMO} element={<AuthDemoPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </AppInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
