import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, GraduationCap, HelpCircle, Volume2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VocabularyCard from "@/components/vocabulary/VocabularyCard";
import { Vocabulary, Lesson } from "@shared/schema";
import { PortugueseSpeaker } from "@/components/ui/portuguese-speaker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function VocabularyPage() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  
  const { data: lesson, isLoading: isLessonLoading } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${id}`],
  });
  
  const { data: vocabularyItems = [], isLoading: isVocabularyLoading } = useQuery<Vocabulary[]>({
    queryKey: [`/api/lessons/${id}/vocabulary`],
  });
  
  const handleBack = () => {
    setLocation("/");
  };
  
  const handleStartQuiz = () => {
    setLocation(`/lessons/${id}/quiz`);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
      {/* Mobile header (fixed position on small screens) */}
      <div className="sticky top-0 bg-white z-10 py-3 border-b md:static md:border-none md:py-0">
        <div className="flex items-center justify-between mb-2 md:mb-6">
          {isLessonLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h2 className="text-lg md:text-xl font-heading font-bold text-neutral-800 truncate max-w-[200px] md:max-w-none">
              {lesson?.title}
            </h2>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Back</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-500 hover:text-amber-600 md:hidden"
              disabled
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Word count and progress indicators */}
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            {vocabularyItems.length} words
          </Badge>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-green-500" />
            <span>Learning progress</span>
          </div>
        </div>
        
        <div className="mb-4 md:mb-6">
          <Progress value={40} className="h-1 md:h-2" />
        </div>
      </div>
      
      {/* Feature card (only visible on larger screens) */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-none hidden md:block">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-700 mb-1">New! Teacher Pronunciation</h3>
            <p className="text-sm text-neutral-600">
              Practice with our virtual teacher. Click the <GraduationCap className="h-3 w-3 inline" /> icon on any vocabulary card.
            </p>
          </div>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            <Volume2 className="h-4 w-4 mr-1" />
            Learn More
          </Button>
        </CardContent>
      </Card>
      
      <div className="mb-2 md:mb-4">
        <p className="text-sm text-muted-foreground mb-3 md:mb-4">
          Tap cards to flip, use <Volume2 className="h-3 w-3 inline" /> for pronunciation or <GraduationCap className="h-3 w-3 inline" /> for teacher mode.
        </p>
      </div>
      
      {/* Cards grid with better responsive layout */}
      {isVocabularyLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-[280px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {vocabularyItems.map((vocab: Vocabulary) => (
            <VocabularyCard key={vocab.id} vocabulary={vocab} />
          ))}
        </div>
      )}
      
      {/* Fixed quiz button on mobile */}
      <div className="fixed bottom-[60px] left-0 right-0 p-3 bg-white border-t md:static md:bg-transparent md:border-0 md:mt-8 md:p-0">
        <Button 
          onClick={handleStartQuiz}
          className="bg-green-500 hover:bg-green-600 text-white w-full md:w-auto md:px-6 md:py-3 rounded-md flex items-center justify-center font-heading font-bold"
        >
          Test Your Knowledge
          <HelpCircle className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
