import { useQuery } from "@tanstack/react-query";
import LessonCard from "@/components/home/LessonCard";
import ProgressTracker from "@/components/home/ProgressTracker";
import { Skeleton } from "@/components/ui/skeleton";
import { Lesson } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Book, Calendar, Headphones, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { data: user, isLoading: isUserLoading } = useQuery<any>({
    queryKey: ['/api/users/1'],
  });
  
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery<Lesson[]>({
    queryKey: ['/api/lessons'],
  });
  
  // Find the in-progress lesson (if any)
  const currentLesson = lessons.find((lesson: Lesson) => lesson.status === "in_progress");
  
  // Get upcoming lessons (those that are available but not in progress)
  const upcomingLessons = lessons.filter((lesson: Lesson) => 
    lesson.status === "available"
  );
  
  const completedLessons = lessons.filter((lesson: Lesson) => 
    lesson.status === "completed"
  ).length;
  
  return (
    <>
      <ProgressTracker 
        currentProgress={completedLessons} 
        totalLessons={lessons.length} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Daily Streak Card - Mobile only */}
        <div className="mb-6 overflow-x-auto pb-2 md:hidden">
          <div className="flex gap-3 min-w-max">
            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-amber-800">3 Day Streak!</h3>
                  <p className="text-xs text-amber-700">Keep it going</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">250 XP</h3>
                  <p className="text-xs text-blue-700">Level 3</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-none">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Book className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">6 words</h3>
                  <p className="text-xs text-green-700">Learned so far</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Hero Card - Desktop only */}
        <Card className="mb-8 bg-gradient-to-r from-green-100 to-blue-100 border-none shadow-sm hidden md:block overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="max-w-lg">
              <h2 className="text-2xl font-heading font-bold text-blue-800 mb-3">
                Welcome to LinguaBrasil
              </h2>
              <p className="text-blue-700 mb-4">
                Your journey to Portuguese fluency starts here. Learn with interactive lessons, 
                pronunciation practice, and quizzes designed to help you speak with confidence.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Headphones className="h-4 w-4 mr-2" />
                  Try Teacher Mode
                </Button>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Grammar Reference
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              {/* Hero image could go here */}
            </div>
          </CardContent>
        </Card>
        
        {/* Current lesson section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-heading font-bold text-neutral-800">
              Continue Learning
            </h2>
            
            {!isLessonsLoading && currentLesson && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                In Progress
              </Badge>
            )}
          </div>
          
          {isLessonsLoading ? (
            <Skeleton className="h-40 w-full mb-6" />
          ) : currentLesson ? (
            <LessonCard lesson={currentLesson} isCurrentLesson={true} />
          ) : (
            <Card className="p-6 text-center bg-neutral-50 border-dashed">
              <p className="text-muted-foreground mb-4">
                No lessons in progress. Start one from below!
              </p>
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                <Calendar className="h-4 w-4 mr-2" />
                Set a Learning Schedule
              </Button>
            </Card>
          )}
        </div>
        
        {/* Upcoming lessons section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-heading font-bold text-neutral-800">
              Upcoming Lessons
            </h2>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 hover:text-blue-600"
              disabled
            >
              View All
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          {isLessonsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-40 md:h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {upcomingLessons.map((lesson: Lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
              {upcomingLessons.length === 0 && (
                <Card className="p-6 text-center col-span-full bg-neutral-50 border-dashed">
                  <p className="text-muted-foreground">
                    No upcoming lessons available.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
