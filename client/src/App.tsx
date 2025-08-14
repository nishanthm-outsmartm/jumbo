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
import EnhancedModeratorPanel from "./pages/EnhancedModeratorPanel";
import EnhancedMemberDashboard from "@/pages/EnhancedMemberDashboard";
import NotFound from "@/pages/not-found";

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

  return <>{children}</>;
}

function AppRouter() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {user && <Navigation />}
      <Switch>
        <Route path="/login" component={EnhancedLogin} />
        <Route path="/old-login" component={Login} />
        <Route path="/register" component={Register} />

        {/* Protected Routes */}
        <Route path="/">
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
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        </Route>

        <Route path="/moderator">
          <ProtectedRoute>
            <EnhancedModeratorPanel />
          </ProtectedRoute>
        </Route>

        <Route path="/dashboard">
          <ProtectedRoute>
            <EnhancedMemberDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/enhanced">
          <ProtectedRoute>
            <EnhancedHome />
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
