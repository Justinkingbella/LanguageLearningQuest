import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QuizCard from "@/components/quiz/QuizCard";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface QuizQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  explanation?: string;
  options: {
    id: number;
    option: string;
  }[];
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [currentQuestionAnswered, setCurrentQuestionAnswered] = useState(false);
  
  const { data: lesson, isLoading: isLessonLoading } = useQuery({
    queryKey: [`/api/lessons/${id}`],
  });
  
  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: [`/api/lessons/${id}/quiz`],
  });
  
  // Reset currentQuestionAnswered when moving to a new question
  useEffect(() => {
    setCurrentQuestionAnswered(
      answers.length > currentQuestionIndex ? true : false
    );
  }, [currentQuestionIndex, answers]);
  
  const handleBack = () => {
    setLocation(`/lessons/${id}/vocabulary`);
  };
  
  const handleAnswer = (isCorrect: boolean) => {
    setAnswers([...answers.slice(0, currentQuestionIndex), isCorrect]);
    setCurrentQuestionAnswered(true);
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit results and navigate to results page
      try {
        const correctAnswers = answers.filter(a => a).length;
        
        await apiRequest("POST", `/api/lessons/${id}/progress`, {
          userId: 1, // In a real app, this would be the authenticated user
          lessonId: parseInt(id),
          completed: true,
          score: correctAnswers
        });
        
        setLocation(`/lessons/${id}/results?score=${correctAnswers}&total=${questions.length}`);
      } catch (error) {
        console.error("Error submitting quiz results:", error);
      }
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex] as QuizQuestion | undefined;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        {isLessonLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h2 className="text-xl font-heading font-bold text-neutral-800">
            Quiz: {lesson?.title}
          </h2>
        )}
        
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      
      {isQuestionsLoading ? (
        <Skeleton className="h-64 w-full mb-6" />
      ) : currentQuestion ? (
        <QuizCard 
          question={currentQuestion}
          onAnswer={handleAnswer}
          audioPath={`/api/audio/${currentQuestion.correctAnswer.toLowerCase().replace(/ /g, "_")}`}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No questions available.</p>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!currentQuestionAnswered}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
