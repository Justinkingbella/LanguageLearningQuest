import Certificate from "@/components/certificate";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CertificatePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Certificate</h1>
        <Button variant="outline" onClick={() => setLocation("/")}>
          Back to Dashboard
        </Button>
      </div>
      
      <Certificate />
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Your certificate reflects your achievements in learning Portuguese.</p>
        <p>Continue learning to improve your level and unlock advanced certificates!</p>
      </div>
    </div>
  );
}