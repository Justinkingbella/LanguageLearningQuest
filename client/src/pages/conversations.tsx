import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ScenarioCard from "@/components/conversation/ScenarioCard";
import { getQueryFn } from "@/lib/queryClient";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ConversationScenario {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  context: string;
  imageUrl: string | null;
  difficulty: string;
  category: string;
}

interface UserConversationPractice {
  id: number;
  userId: number;
  scenarioId: number;
  completed: boolean;
  accuracy: number | null;
  completedAt: string | null;
}

export default function ConversationsPage() {
  const [, params] = useRoute("/conversations/:lessonId?");
  const lessonId = params?.lessonId ? parseInt(params.lessonId) : undefined;
  
  // State to track active filter
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  // Get scenarios from the API
  const { data: scenarios, isLoading: isLoadingScenarios } = useQuery({
    queryKey: [lessonId ? `/api/lessons/${lessonId}/conversations` : '/api/lessons'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Get user's conversation practice history
  const { data: userPractice, isLoading: isLoadingPractice } = useQuery({
    queryKey: ['/api/users/1/conversation-practice'], // In a real app, use the actual user ID
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  interface Lesson {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    duration: number;
    order: number;
    wordCount: number;
    status: string;
  }
  
  // Get all lessons to show lesson names
  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: ['/api/lessons'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  if (isLoadingScenarios || isLoadingPractice || isLoadingLessons) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader title="Conversation Practice" />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading conversations...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  // If we have a lesson ID, filter scenarios by that lesson
  let filteredScenarios: ConversationScenario[] = [];
  
  if (Array.isArray(scenarios)) {
    // If we're looking at a specific lesson, the API returns scenarios directly
    filteredScenarios = scenarios;
  } else if (lessonId && lessons) {
    // If we have a lessonId but the API doesn't return scenarios directly,
    // we need to fetch all scenarios and filter them (this shouldn't happen with our API)
    console.error("API returned unexpected format for scenarios");
    filteredScenarios = [];
  } else if (lessons) {
    // If we're on the main conversations page, we need to fetch scenarios for each lesson
    // For now, we'll show a message asking to select a lesson
    filteredScenarios = [];
  }
  
  // Apply filters based on the selected tab
  if (activeFilter !== "all") {
    filteredScenarios = filteredScenarios.filter(scenario => 
      scenario.difficulty.toLowerCase() === activeFilter
    );
  }
  
  // Get the current lesson name
  const currentLesson = lessonId && lessons && Array.isArray(lessons)
    ? lessons.find((lesson) => lesson.id === parseInt(lessonId))
    : null;
  
  // Function to find practice data for a scenario
  const findPracticeForScenario = (scenarioId: number) => {
    if (!Array.isArray(userPractice)) return undefined;
    return userPractice.find((practice: UserConversationPractice) => 
      practice.scenarioId === scenarioId
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        title={currentLesson ? `${currentLesson.title} - Conversations` : "Conversation Practice"} 
      />
      
      <main className="flex-grow container max-w-md mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            Practice Your Portuguese
          </h2>
          <p className="text-muted-foreground">
            Complete these conversation scenarios to improve your speaking and listening skills.
          </p>
        </div>
        
        {lessonId ? (
          <>
            {/* Difficulty filters */}
            <Tabs 
              defaultValue="all" 
              className="mb-4"
              onValueChange={setActiveFilter}
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Scenario cards */}
            {filteredScenarios.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredScenarios.map((scenario) => (
                  <ScenarioCard 
                    key={scenario.id}
                    scenario={scenario}
                    practice={findPracticeForScenario(scenario.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>No conversation scenarios available for this filter.</p>
              </div>
            )}
          </>
        ) : (
          // If no lesson is selected, show a message to select a lesson
          <div className="text-center py-8">
            <p className="mb-4">
              Please select a lesson to view its conversation scenarios.
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
              {lessons && lessons.map((lesson) => (
                <a 
                  key={lesson.id}
                  href={`/conversations/${lesson.id}`}
                  className="block p-3 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {lesson.title}
                  {lesson.status === "completed" && (
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Completed</Badge>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
}