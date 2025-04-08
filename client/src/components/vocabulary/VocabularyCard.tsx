import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audioplayer";
import { PortugueseSpeaker } from "@/components/ui/portuguese-speaker";
import { Vocabulary } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart, GraduationCap, RefreshCw } from "lucide-react";
import TeacherDemo from "./TeacherDemo";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VocabularyCardProps {
  vocabulary: Vocabulary;
}

export default function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping when audio button is clicked
  };
  
  const startTeacherMode = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping
    setShowTeacherMode(true);
  };
  
  return (
    <>
      <div className="h-[280px] mb-4 perspective-1000">
        <div 
          className={`h-full w-full relative transition-transform duration-600 ${
            isFlipped ? "rotate-y-180" : ""
          } transform-style-preserve-3d cursor-pointer`}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <Card className={`absolute inset-0 backface-hidden ${
            isFlipped ? "invisible" : "visible"
          } flex flex-col items-center justify-center p-4`}>
            <div className="text-2xl font-heading font-bold text-neutral-800 mb-2">
              {vocabulary.portuguese}
            </div>
            <div className="text-muted-foreground italic mb-4">
              {vocabulary.english}
            </div>
            <div className="flex space-x-3" onClick={handleAudioPlay}>
              <PortugueseSpeaker 
                text={vocabulary.portuguese}
                showText={false}
                size="md"
              />
              <Button
                variant="outline"
                size="icon"
                className="text-green-500 border-green-500 hover:bg-green-50"
                onClick={startTeacherMode}
                aria-label="Practice with teacher"
              >
                <GraduationCap className="h-5 w-5" />
              </Button>
            </div>
          </Card>
          
          {/* Back of card */}
          <Card className={`absolute inset-0 backface-hidden rotate-y-180 ${
            isFlipped ? "visible" : "invisible"
          } flex flex-col items-center justify-between p-4`}>
            {vocabulary.imageUrl && (
              <div className="w-32 h-32 rounded-lg mb-4 bg-gray-100 flex items-center justify-center">
                <img 
                  src={vocabulary.imageUrl} 
                  alt={vocabulary.portuguese} 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="text-sm text-muted-foreground mb-4 w-full">
              <p className="mb-2"><strong>Pronunciation:</strong> {vocabulary.pronunciation}</p>
              <p><strong>Usage:</strong> {vocabulary.usage}</p>
            </div>
            
            <div className="flex space-x-3" onClick={handleAudioPlay}>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-500 border-blue-500 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Flip Card
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-500 border-green-500 hover:bg-green-50"
                onClick={startTeacherMode}
              >
                <GraduationCap className="h-4 w-4 mr-1" />
                Practice
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      <Dialog open={showTeacherMode} onOpenChange={setShowTeacherMode}>
        <DialogContent className="max-w-md p-0">
          <TeacherDemo 
            vocabulary={vocabulary} 
            onClose={() => setShowTeacherMode(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
