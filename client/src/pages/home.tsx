import { useQuery } from "@tanstack/react-query";
import LessonCard from "@/components/home/LessonCard";
import ProgressTracker from "@/components/home/ProgressTracker";
import { Skeleton } from "@/components/ui/skeleton";
import { Lesson } from "@shared/schema";

export default function HomePage() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Current lesson section */}
        <h2 className="text-xl font-heading font-bold text-neutral-800 mb-6">
          Continue Learning
        </h2>
        
        {isLessonsLoading ? (
          <Skeleton className="h-40 w-full mb-6" />
        ) : currentLesson ? (
          <LessonCard lesson={currentLesson} isCurrentLesson={true} />
        ) : (
          <p className="text-muted-foreground mb-6">
            No lessons in progress. Start one from below!
          </p>
        )}
        
        {/* Upcoming lessons section */}
        <h2 className="text-xl font-heading font-bold text-neutral-800 mb-6">
          Upcoming Lessons
        </h2>
        
        {isLessonsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingLessons.map((lesson: Lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
            {upcomingLessons.length === 0 && (
              <p className="text-muted-foreground col-span-full">
                No upcoming lessons available.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
