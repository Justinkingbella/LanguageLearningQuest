import React from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

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

interface ScenarioCardProps {
  scenario: ConversationScenario;
  practice?: UserConversationPractice;
}

export default function ScenarioCard({ scenario, practice }: ScenarioCardProps) {
  const [_, navigate] = useLocation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };
  
  const handlePractice = () => {
    navigate(`/conversation/${scenario.id}`);
  };
  
  return (
    <Card className="mb-4 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{scenario.title}</CardTitle>
          <Badge
            className={`ml-2 ${getDifficultyColor(scenario.difficulty)}`}
            variant="outline"
          >
            {scenario.difficulty}
          </Badge>
        </div>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {scenario.context}
        </p>
        
        {practice?.completed && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm font-medium">
              Your score: {practice.accuracy}%
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={handlePractice}
          className="w-full"
          variant={practice?.completed ? "outline" : "default"}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {practice?.completed ? "Practice Again" : "Start Practice"}
        </Button>
      </CardFooter>
    </Card>
  );
}