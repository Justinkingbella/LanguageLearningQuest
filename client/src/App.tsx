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

import ProfilePage from "@/pages/profile";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { cn } from "@/lib/utils";

// Create wrapper components that always return an element
const HomePageWrapper = () => <HomePage />;
const VocabularyPageWrapper = () => <VocabularyPage />;
const QuizPageWrapper = () => <QuizPage />;
const ResultsPageWrapper = () => <ResultsPage />;
const DictionaryPageWrapper = () => <DictionaryPage />;
const ConversationsPageWrapper = () => <ConversationsPage />;
const ConversationPageWrapper = () => <ConversationPage />;
const CertificatePageWrapper = () => <CertificatePage />;
const ProfilePageWrapper = () => <ProfilePage />;

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePageWrapper} />
      <ProtectedRoute path="/lessons/:id/vocabulary" component={VocabularyPageWrapper} />
      <ProtectedRoute path="/lessons/:id/quiz" component={QuizPageWrapper} />
      <ProtectedRoute path="/lessons/:id/results" component={ResultsPageWrapper} />
      <ProtectedRoute path="/dictionary" component={DictionaryPageWrapper} />
      <ProtectedRoute path="/conversations" component={ConversationsPageWrapper} />
      <ProtectedRoute path="/conversations/:lessonId" component={ConversationsPageWrapper} />
      <ProtectedRoute path="/conversation/:id" component={ConversationPageWrapper} />
      <ProtectedRoute path="/certificate" component={CertificatePageWrapper} />
      <ProtectedRoute path="/profile" component={ProfilePageWrapper} />
      <Route path="/auth">
        <AuthPage />
      </Route>
      <Route path="/:rest*">
        <NotFound />
      </Route>
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
  
  // Only show navigation if not on auth page
  const showNavigation = location !== '/auth';
  
  return (
    <div className="h-screen flex flex-col">
      {showNavigation && <AppHeader title="LinguaPortuguese" currentUser={user || undefined} />}
      <div className={cn("flex-grow overflow-auto", !showNavigation && "min-h-screen")}>
        <Router />
      </div>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}

export default App;
