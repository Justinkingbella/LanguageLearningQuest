interface User {
  id: number;
  displayName: string;
  level: number;
}

interface AppHeaderProps {
  title: string;
  currentUser?: User;
}

import { Languages } from "lucide-react";

export default function AppHeader({ title, currentUser }: AppHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Languages className="text-green-500 mr-2 h-6 w-6" />
            <h1 className="text-2xl font-heading font-bold text-neutral-800">{title}</h1>
          </div>
          {currentUser && (
            <div className="flex items-center">
              <div className="text-sm text-neutral-800 mr-2">
                <span className="font-semibold">{currentUser.displayName}</span>
                <div className="text-xs text-muted-foreground">Level {currentUser.level}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-heading font-bold">
                {currentUser.displayName.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
