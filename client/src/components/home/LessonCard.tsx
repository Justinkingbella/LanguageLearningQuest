import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Lesson } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface LessonCardProps {
  lesson: Lesson;
  isCurrentLesson?: boolean;
}

export default function LessonCard({ lesson, isCurrentLesson = false }: LessonCardProps) {
  const [_, setLocation] = useLocation();
  
  const statusMap = {
    locked: { 
      label: "Locked", 
      color: "bg-gray-200 bg-opacity-10 text-gray-500 border-gray-300",
      icon: <Lock className="h-3 w-3 mr-1" />,
      progress: 0
    },
    available: { 
      label: "Available", 
      color: "bg-blue-100 text-blue-500 border-blue-300",
      icon: <BookOpen className="h-3 w-3 mr-1" />,
      progress: 0
    },
    in_progress: { 
      label: "In Progress", 
      color: "bg-green-100 text-green-500 border-green-300",
      icon: <Sparkles className="h-3 w-3 mr-1" />,
      progress: 30
    },
    completed: { 
      label: "Completed", 
      color: "bg-yellow-100 text-yellow-500 border-yellow-300",
      icon: <Sparkles className="h-3 w-3 mr-1" />,
      progress: 100
    }
  };

  const status = statusMap[lesson.status as keyof typeof statusMap] || statusMap.locked;

  const handleContinue = () => {
    setLocation(`/lessons/${lesson.id}/vocabulary`);
  };

  return (
    <Card className="overflow-hidden border-l-4 hover:shadow-md transition-shadow duration-300" 
      style={{ borderLeftColor: lesson.status === 'in_progress' ? '#22c55e' : 
               lesson.status === 'completed' ? '#eab308' : 
               lesson.status === 'available' ? '#3b82f6' : '#d1d5db' }}
    >
      <CardHeader className="p-3 md:p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-base md:text-lg line-clamp-1">{lesson.title}</h3>
          <Badge 
            className={`${status.color} text-xs`}
          >
            <span className="flex items-center">
              {status.icon}
              {status.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lesson.description}</p>
        
        {status.progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-1.5" />
          </div>
        )}
        
        <div className="flex flex-wrap justify-between gap-2 items-center">
          <div className="flex items-center bg-neutral-50 px-2 py-1 rounded-full text-xs">
            <Clock className="text-amber-500 h-3 w-3 mr-1" />
            <span className="text-muted-foreground">
              {lesson.duration} min
            </span>
          </div>
          
          <div className="flex items-center bg-neutral-50 px-2 py-1 rounded-full text-xs">
            <BookOpen className="text-blue-500 h-3 w-3 mr-1" />
            <span className="text-muted-foreground">
              {lesson.wordCount} words
            </span>
          </div>
          
          <Button 
            onClick={handleContinue}
            disabled={lesson.status === 'locked'}
            size="sm"
            className={`ml-auto ${isCurrentLesson ? 
              'bg-green-500 hover:bg-green-600' : 
              'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            {isCurrentLesson ? 'Continue' : 'Start'}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
