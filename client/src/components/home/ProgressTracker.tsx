import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  currentProgress: number;
  totalLessons: number;
}

export default function ProgressTracker({ 
  currentProgress, 
  totalLessons 
}: ProgressTrackerProps) {
  const progressPercentage = totalLessons > 0 ? 
    Math.round((currentProgress / totalLessons) * 100) : 0;

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          <div className="w-full">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-foreground font-semibold">Your Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
