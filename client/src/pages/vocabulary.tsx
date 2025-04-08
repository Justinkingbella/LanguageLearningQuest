import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VocabularyCard from "@/components/vocabulary/VocabularyCard";
import { Vocabulary } from "@shared/schema";

export default function VocabularyPage() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  
  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: [`/api/lessons/${id}`],
  });
  
  const { data: vocabularyItems = [], isLoading: isVocabularyLoading } = useQuery({
    queryKey: [`/api/lessons/${id}/vocabulary`],
  });
  
  const handleBack = () => {
    setLocation("/");
  };
  
  const handleStartQuiz = () => {
    setLocation(`/lessons/${id}/quiz`);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        {isLessonLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h2 className="text-xl font-heading font-bold text-neutral-800">
            {lesson?.title}
          </h2>
        )}
        
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Tap the cards to see pronunciation and usage details.
      </p>
      
      {isVocabularyLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabularyItems.map((vocab: Vocabulary) => (
            <VocabularyCard key={vocab.id} vocabulary={vocab} />
          ))}
        </div>
      )}
      
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleStartQuiz}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md flex items-center font-heading font-bold"
        >
          Test Your Knowledge
          <HelpCircle className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
