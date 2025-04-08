import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import VocabularyPage from "@/pages/vocabulary";
import QuizPage from "@/pages/quiz";
import ResultsPage from "@/pages/results";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/lessons/:id/vocabulary" component={VocabularyPage} />
      <Route path="/lessons/:id/quiz" component={QuizPage} />
      <Route path="/lessons/:id/results" component={ResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Default user for the app (in a real app, this would come from authentication)
  const [user] = useState({
    id: 1,
    displayName: "Maria",
    level: 3
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col">
        <AppHeader title="LinguaBrasil" currentUser={user} />
        <div className="flex-grow overflow-auto">
          <Router />
        </div>
        <BottomNavigation />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
