
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BookOpen, Award, BarChart2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Profile Not Available</CardTitle>
            <CardDescription>You need to be logged in to view your profile.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/auth">Login or Register</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Getting user progress from API
  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user.id, "progress"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/users/${user.id}/progress`);
        return await res.json();
      } catch (error) {
        console.error("Failed to fetch user progress:", error);
        return [];
      }
    }
  });

  // Getting user certificate
  const { data: certificate, isLoading: isCertificateLoading } = useQuery({
    queryKey: ["/api/users", user.id, "certificate"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/users/${user.id}/certificate`);
        return await res.json();
      } catch (error: any) {
        // Return null if certificate not found
        if (error && error.status === 404) {
          return null;
        }
        console.error("Certificate error:", error);
        return null;
      }
    },
    retry: false,
  });

  // Calculate XP progress percentage to next level
  const xpForCurrentLevel = user.level * 100;
  const xpForNextLevel = (user.level + 1) * 100;
  const xpProgress = ((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-bold">
                {user.displayName.charAt(0)}
              </div>
            </div>
            <CardTitle className="text-center mt-4">{user.displayName}</CardTitle>
            <CardDescription className="text-center">@{user.username}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-bold text-lg text-primary">{user.level}</p>
                </div>
                <Progress value={xpProgress} className="h-2 mt-1" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{user.xp} XP</span>
                  <span>{xpForNextLevel} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="w-full"
            >
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-primary" />
                      Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {userProgress?.completedLessons || 0}/{userProgress?.totalLessons || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="h-4 w-4 mr-2 text-primary" />
                      Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{user.level}</p>
                    <p className="text-xs text-muted-foreground">Current Level</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                      XP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{user.xp}</p>
                    <p className="text-xs text-muted-foreground">Total Experience</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      Next Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{xpForNextLevel - user.xp}</p>
                    <p className="text-xs text-muted-foreground">XP Required</p>
                  </CardContent>
                </Card>
              </div>
              
              {certificate ? (
                <Card className="bg-primary/5 border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Award className="h-4 w-4 mr-2 text-primary" />
                      Certificate Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="font-medium">
                      You've earned a {certificate.certificateLevel} level certificate!
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/certificate">View Certificate</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      Certificate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete more lessons to earn your Portuguese language certificate.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="progress">
              <div className="space-y-4">
                <p className="text-muted-foreground">Your progress through the lessons</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{Math.round((userProgress?.completedLessons || 0) / (userProgress?.totalLessons || 1) * 100)}%</span>
                  </div>
                  <Progress value={(userProgress?.completedLessons || 0) / (userProgress?.totalLessons || 1) * 100} className="h-2" />
                </div>
                
                {/* Would normally map through userProgress.lessons here */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                  Detailed lesson progress will be available soon
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements">
              <div className="text-center py-8">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Achievements Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  We're working on adding badges and achievements to track your language learning journey.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="text-center py-8">
                <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Detailed Statistics Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  We'll be adding detailed statistics about your learning journey soon.
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
