
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.displayName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.displayName}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            
            <div className="grid gap-2">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Level</label>
                <p>{user.level}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">XP</label>
                <p>{user.xp}</p>
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
