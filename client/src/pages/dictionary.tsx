import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PortugueseSpeaker } from "@/components/ui/portuguese-speaker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface DictionaryResult {
  id?: number;
  portuguese: string;
  english: string;
  usage: string;
  lessonTitle?: string;
  lessonId?: number;
  audioUrl?: string | null;
}

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/vocabulary/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || !isSearching) return [] as DictionaryResult[];
      
      try {
        const url = `/api/vocabulary/search?term=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setIsSearching(false);
        return data as DictionaryResult[];
      } catch (error) {
        console.error('Error fetching search results:', error);
        setIsSearching(false);
        return [] as DictionaryResult[];
      }
    },
    enabled: isSearching && !!searchTerm,
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      refetch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader title="Portuguese Dictionary" />
      
      <main className="flex-1 container max-w-lg px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Find Word Meaning & Pronunciation</h1>
        
        <div className="flex gap-2 mb-6">
          <Input 
            type="text" 
            placeholder="Enter a Portuguese word or phrase..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {isLoading && (
          <Card className="mb-4">
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        )}

        {searchResults && searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{result.portuguese}</CardTitle>
                    <PortugueseSpeaker 
                      text={result.portuguese} 
                      variant="primary"
                      size="md"
                      showText={false}
                    />
                  </div>
                  <CardDescription className="text-lg font-medium">{result.english}</CardDescription>
                  {result.lessonTitle && (
                    <Badge variant="outline" className="mt-1">
                      Lesson: {result.lessonTitle}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium mb-1">Example usage:</h3>
                  <p className="text-sm italic">{result.usage}</p>
                </CardContent>
                <CardFooter className="bg-muted/50 pt-2 pb-2">
                  <div className="w-full">
                    <p className="text-sm font-medium">Pronunciation tips:</p>
                    <p className="text-sm">Click the speaker icon to hear correct pronunciation.</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : searchTerm && !isLoading && isSearching === false ? (
          <Card className="p-6 text-center">
            <p className="mb-2">No matching words found.</p>
            <p className="text-sm text-muted-foreground">Try searching for another term or check your spelling.</p>
          </Card>
        ) : null}

        {!searchTerm && !isLoading && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-3">Dictionary & Pronunciation Guide</h2>
            <p className="mb-4">Enter any Portuguese word or phrase to get:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Detailed translation</li>
              <li>Example usage in sentences</li>
              <li>Proper pronunciation through audio</li>
              <li>Related lesson information</li>
            </ul>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">Search for common words like "olá", "obrigado", or any term from your lessons.</p>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}