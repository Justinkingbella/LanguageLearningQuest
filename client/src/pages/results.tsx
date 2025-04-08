import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Parse score from query string
  const params = new URLSearchParams(location.split('?')[1]);
  const score = parseInt(params.get('score') || '0');
  const total = parseInt(params.get('total') || '5');
  
  const { data: lesson } = useQuery({
    queryKey: [`/api/lessons/${id}`],
  });
  
  const handleReviewMistakes = () => {
    toast({
      title: "Coming soon",
      description: "The review feature will be available in the full version",
      duration: 3000,
    });
  };
  
  const handleBackToHome = () => {
    setLocation("/");
  };
  
  const handleNextLesson = () => {
    toast({
      title: "Coming soon",
      description: "The next lesson feature will be available in the full version",
      duration: 3000,
    });
  };
  
  const badgeName = lesson?.title ? `${lesson.title} Master` : "Lesson Completed";
  const earnedXp = Math.round((score / total) * 100);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card className="p-6 text-center">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-500 bg-opacity-10 mb-6">
          <Trophy className="h-12 w-12 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-heading font-bold text-neutral-800 mb-2">
          Parabéns! (Congratulations!)
        </h2>
        <p className="text-muted-foreground mb-6">
          You completed the {lesson?.title} quiz
        </p>
        
        <div className="bg-neutral-100 p-4 rounded-md inline-block mb-6">
          <div className="text-4xl font-heading font-bold text-green-500 mb-1">
            {score}/{total}
          </div>
          <div className="text-muted-foreground">Correct answers</div>
        </div>
        
        <div className="mb-8">
          <h3 className="font-heading font-semibold mb-3">You've earned:</h3>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 bg-opacity-10 text-yellow-500">
            <Trophy className="h-4 w-4 mr-1" />
            {badgeName} Badge
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            +{earnedXp} XP Points
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={handleReviewMistakes}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Review Mistakes
          </Button>
          
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleBackToHome}
          >
            <Home className="mr-1 h-4 w-4" />
            Back to Home
          </Button>
          
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleNextLesson}
          >
            <ArrowRight className="mr-1 h-4 w-4" />
            Next Lesson
          </Button>
        </div>
      </Card>
    </div>
  );
}
