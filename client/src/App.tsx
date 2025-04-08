import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import VocabularyPage from "@/pages/vocabulary";
import QuizPage from "@/pages/quiz";
import ResultsPage from "@/pages/results";
import DictionaryPage from "@/pages/dictionary";
import ConversationsPage from "@/pages/conversations";
import ConversationPage from "@/pages/conversation";
import AuthPage from "@/pages/auth-page";
import CertificatePage from "@/pages/certificate-page";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/lessons/:id/vocabulary" component={VocabularyPage} />
      <ProtectedRoute path="/lessons/:id/quiz" component={QuizPage} />
      <ProtectedRoute path="/lessons/:id/results" component={ResultsPage} />
      <ProtectedRoute path="/dictionary" component={DictionaryPage} />
      <ProtectedRoute path="/conversations" component={ConversationsPage} />
      <ProtectedRoute path="/conversations/:lessonId" component={ConversationsPage} />
      <ProtectedRoute path="/conversation/:id" component={ConversationPage} />
      <ProtectedRoute path="/certificate" component={CertificatePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Only show navigation if the user is authenticated
  const isAuthPath = location === '/auth';
  
  if (isAuthPath) {
    return (
      <div className="min-h-screen">
        <Router />
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col">
      <AppHeader title="LinguaPortuguese" currentUser={user || undefined} />
      <div className="flex-grow overflow-auto">
        <Router />
      </div>
      <BottomNavigation />
    </div>
  );
}

export default App;
