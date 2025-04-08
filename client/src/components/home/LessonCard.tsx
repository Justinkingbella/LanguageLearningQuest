import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Lesson } from "@shared/schema";

interface LessonCardProps {
  lesson: Lesson;
  isCurrentLesson?: boolean;
}

export default function LessonCard({ lesson, isCurrentLesson = false }: LessonCardProps) {
  const [_, setLocation] = useLocation();
  
  const statusMap = {
    locked: { 
      label: "Locked", 
      color: "bg-gray-200 bg-opacity-10 text-gray-500" 
    },
    available: { 
      label: "Available", 
      color: "bg-blue-500 bg-opacity-10 text-blue-500" 
    },
    in_progress: { 
      label: "In Progress", 
      color: "bg-green-500 bg-opacity-10 text-green-500" 
    },
    completed: { 
      label: "Completed", 
      color: "bg-yellow-500 bg-opacity-10 text-yellow-500" 
    }
  };

  const status = statusMap[lesson.status as keyof typeof statusMap] || statusMap.locked;

  const handleContinue = () => {
    setLocation(`/lessons/${lesson.id}/vocabulary`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-lg">{lesson.title}</h3>
          <Badge 
            variant="outline" 
            className={`${status.color}`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-muted-foreground mb-4">{lesson.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="text-yellow-500 h-4 w-4 mr-1" />
            <span className="text-sm text-muted-foreground">
              {lesson.duration} minutes
            </span>
          </div>
          <Button 
            onClick={handleContinue}
            disabled={lesson.status === 'locked'}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isCurrentLesson ? 'Continue' : 'Start'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
