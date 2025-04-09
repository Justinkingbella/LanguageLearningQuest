import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import useDebounce from "@/hooks/useDebounce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface DictionaryResult {
  id: number;
  word: string;
  translation: string;
  partOfSpeech: string;
  example?: string;
}

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["dictionary-search", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const response = await apiRequest(`/api/vocabulary/search?term=${encodeURIComponent(debouncedSearchTerm)}`);
      return response as DictionaryResult[];
    },
    enabled: !!debouncedSearchTerm,
  });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Dictionary</h1>
        <Input
          type="search"
          placeholder="Search for words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="verbs">Verbs</TabsTrigger>
          <TabsTrigger value="nouns">Nouns</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{result.word}</h3>
                        <p className="text-sm text-muted-foreground">{result.translation}</p>
                        {result.example && (
                          <p className="text-sm italic mt-2">"{result.example}"</p>
                        )}
                      </div>
                      <Badge>{result.partOfSpeech}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchTerm ? (
            <p className="text-center text-muted-foreground py-8">No results found.</p>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}