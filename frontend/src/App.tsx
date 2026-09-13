import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { EditProjectPage } from './pages/EditProjectPage';
import { CreateBuildLogPage } from './pages/CreateBuildLogPage';
import { EditBuildLogPage } from './pages/EditBuildLogPage';
import { SetupPage } from './pages/SetupPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { FeedPage } from './pages/FeedPage';
import { SearchPage } from './pages/SearchPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { PublicProjectPage } from './pages/PublicProjectPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * App Component
 *
 * Configures the application's global AuthProvider and React Router routes.
 * Routes requiring authentication are wrapped in ProtectedRoute.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

            {/* Public developer portfolio & project pages (Milestones 8 & 9) */}
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="/u/:username/:projectSlug" element={<PublicProjectPage />} />

            {/* Authenticated but setup NOT required (onboarding itself) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/setup" element={<SetupPage />} />
            </Route>

            {/* Protected Routes — require auth AND completed onboarding */}
            <Route element={<ProtectedRoute requireCompleteProfile />}>
              <Route path="/home" element={<FeedPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/new" element={<CreateProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects/:id/edit" element={<EditProjectPage />} />
              <Route path="/projects/:id/log/new" element={<CreateBuildLogPage />} />
              <Route path="/projects/:id/log/:logId/edit" element={<EditBuildLogPage />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;