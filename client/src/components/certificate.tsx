import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface Certificate {
  userId: number;
  userName: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  certificateLevel: string;
  certificateDate: string;
  serialNumber: string;
}

export default function Certificate() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchCertificate = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest("GET", `/api/users/${user.id}/certificate`);
        const data = await response.json();
        setCertificate(data);
      } catch (error) {
        console.error("Error fetching certificate:", error);
        if (error.status === 404) {
          setError("You haven't completed enough lessons to earn a certificate yet.");
        } else {
          setError("An error occurred while fetching your certificate.");
          toast({
            title: "Error",
            description: "Failed to load certificate data.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [user, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your certificate...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Certificate Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>{error}</p>
          {error.includes("enough lessons") && (
            <div className="mt-4">
              <p className="font-semibold">Keep learning to earn your certificate!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete more lessons to qualify for a Portuguese language certificate.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!certificate) return null;

  const capitalizedLevel = certificate.certificateLevel.charAt(0).toUpperCase() + certificate.certificateLevel.slice(1);

  return (
    <div className="certificate-container p-4">
      <Card className="w-full max-w-3xl mx-auto border-4 border-primary/20 print:border-primary/80">
        <CardHeader className="text-center border-b border-primary/10 pb-6">
          <div className="flex justify-center mb-2">
            <div className="inline-block p-2 bg-primary/10 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21.64 3.64A1.36 1.36 0 0 0 20.28 2h-8.55a1.36 1.36 0 0 0-1.36 1.64l1.33 10a1.36 1.36 0 0 0 1.36 1.08h5.61l-2.72 6.12a1 1 0 0 0 .9 1.4 1 1 0 0 0 .85-.47l5.09-8.49a1.36 1.36 0 0 0-1.2-2.02h-5.21l-.63-4.72h6.5l-1.33 4.42a1 1 0 0 0 1.54 1.16l2.69-2.61a1.36 1.36 0 0 0 .29-1.61Z"/>
                <path d="M8.94 2a1.36 1.36 0 0 0-1.37 1.36l-.37 16a1.35 1.35 0 0 0 1.36 1.36h2.85a1.35 1.35 0 0 0 1.36-1.36l.37-16A1.36 1.36 0 0 0 11.78 2Z"/>
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Certificate of Achievement
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Portuguese Language Proficiency
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-10 px-8 space-y-8">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">This certificate is awarded to</p>
            <h2 className="text-3xl font-bold mt-1">{certificate.userName}</h2>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-muted-foreground">For successfully completing</p>
            <div className="mt-1 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl font-semibold">{capitalizedLevel} Level Portuguese</span>
              <span className="text-base">
                With {Math.round(certificate.progressPercentage)}% proficiency
              </span>
              <span className="text-sm text-muted-foreground">
                Completed {certificate.completedLessons} out of {certificate.totalLessons} lessons
              </span>
            </div>
          </div>
          
          <div className="text-center italic text-muted-foreground">
            <p>This achievement demonstrates the ability to comprehend and communicate in Portuguese at {certificate.certificateLevel} level, following rigorous educational standards.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between items-center border-t border-primary/10 pt-6 gap-4">
          <div className="text-left">
            <p className="font-medium">Date Issued:</p>
            <p className="text-muted-foreground">{certificate.certificateDate}</p>
          </div>
          
          <div className="text-center md:text-left text-xs text-muted-foreground">
            <p>Certificate ID: {certificate.serialNumber}</p>
          </div>
          
          <div className="hidden print:block">
            <p className="font-medium">LinguaPortuguese</p>
            <p className="text-muted-foreground">Official Language Certificate</p>
          </div>
          
          <div className="print:hidden">
            <Button onClick={handlePrint} className="print:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M6 9V2h12v7"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <path d="M6 14h12v8H6z"/>
              </svg>
              Print Certificate
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}