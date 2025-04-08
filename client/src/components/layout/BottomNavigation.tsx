import { Home, Dumbbell, User, BookOpen, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const isActivePage = (path: string) => {
    return location === path;
  };
  
  const handleNavigate = (path: string, implemented = true) => {
    if (implemented) {
      setLocation(path);
    } else {
      toast({
        title: "Coming soon",
        description: "This feature is not available in the demo version",
        duration: 3000,
      });
    }
  };
  
  return (
    <nav className="bg-white shadow-lg border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => handleNavigate("/")}
            className={`flex flex-col items-center px-3 py-1 ${
              isActivePage("/") ? "text-green-500" : "text-neutral-500 hover:text-green-500"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => handleNavigate("/dictionary")}
            className={`flex flex-col items-center px-3 py-1 ${
              isActivePage("/dictionary") ? "text-green-500" : "text-neutral-500 hover:text-green-500"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs mt-1">Dictionary</span>
          </button>
          
          <button 
            onClick={() => handleNavigate("/conversations")}
            className={`flex flex-col items-center px-3 py-1 ${
              location.startsWith("/conversation") ? "text-green-500" : "text-neutral-500 hover:text-green-500"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Conversations</span>
          </button>
          
          <button 
            onClick={() => handleNavigate("/profile", false)}
            className="flex flex-col items-center px-3 py-1 text-neutral-500 hover:text-green-500"
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
