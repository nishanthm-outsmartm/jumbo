import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";

// Import pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LogSwitch from "@/pages/LogSwitch";
import AdminPanel from "@/pages/AdminPanel";
import ModeratorPanel from "@/pages/ModeratorPanel";
import EnhancedHome from "@/pages/EnhancedHome";
import EnhancedLogin from "@/pages/EnhancedLogin";
import EnhancedMemberDashboard from "@/pages/EnhancedMemberDashboard";
import EnhancedModeratorPanel from "@/pages/EnhancedModeratorPanel";
import MemberRegistration from "@/pages/MemberRegistration";
import ModeratorRegistration from "@/pages/ModeratorRegistration";
import News from "@/pages/News";
import Missions from "@/pages/Missions";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import CookieConsent from "./components/landing/CookieConsent";
import ModeratorFeedbackPage from "./pages/moderator/ModeratorFeedbackPage";
import Rewards from "@/pages/Rewards";
import PrivacyCenterPage from "@/pages/PrivacyCenter";
import { AnonymousUserBanner } from "./components/auth/AnonymousUserBanner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedLogin />;
  }

  return <div className="mb-16">{children}</div>;
}
function ProtectedModeratorRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedLogin />;
  }
  if (user?.role !== "MODERATOR") {
    return <NotFound />;
  }

  return <>{children}</>;
}
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") return <NotFound />;
  if (!user) {
    return <EnhancedLogin />;
  }

  return <>{children}</>;
}

function AppRouter() {
  const { user, loading } = useAuth();

  // Show landing page for non-authenticated users
  const HomePage = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return user ? <Home /> : <LandingPage />;
  };

  return (
    <div className="min-h-screen">
      {user && <Navigation />}
      <AnonymousUserBanner />
      <CookieConsent />
      <Switch>
        <Route path="/login" component={EnhancedLogin} />
        {/* <Route path="/old-login" component={Login} /> */}
        <Route path="/register" component={Register} />
        {/* <Route path="/register/moderator" component={EnhancedLogin} /> */}
        {/* <Route path="/old-register" component={Register} /> */}
        <Route path="/reset-password" component={EnhancedLogin} />
        <Route
          path="/moderator/suggested-feedbacks"
          component={ModeratorFeedbackPage}
        />

        {/* Home Route - Landing page for non-auth, Home for authenticated users */}
        <Route path="/" component={HomePage} />

        {/* Protected Routes */}
        <Route path="/home">
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>

        <Route path="/log-switch">
          <ProtectedRoute>
            <LogSwitch />
          </ProtectedRoute>
        </Route>

        <Route path="/admin">
          <ProtectedAdminRoute>
            <AdminPanel />
          </ProtectedAdminRoute>
        </Route>

        <Route path="/moderator">
          <ProtectedModeratorRoute>
            <EnhancedModeratorPanel />
          </ProtectedModeratorRoute>
        </Route>
        <Route path="/moderator/suggested-feedbacks">
          <ProtectedModeratorRoute>
            <ModeratorFeedbackPage />
          </ProtectedModeratorRoute>
        </Route>

        {/* <Route path="/dashboard">
          <ProtectedRoute>
            <EnhancedMemberDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/enhanced">
          <ProtectedRoute>
            <EnhancedHome />
          </ProtectedRoute>
        </Route> */}

        <Route path="/news">
          <ProtectedRoute>
            <News />
          </ProtectedRoute>
        </Route>

        <Route path="/missions">
          <ProtectedRoute>
            <Missions />
          </ProtectedRoute>
        </Route>

        <Route path="/rewards">
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        </Route>

        <Route path="/privacy">
          <ProtectedRoute>
            <PrivacyCenterPage />
          </ProtectedRoute>
        </Route>

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />

          <AppRouter />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
