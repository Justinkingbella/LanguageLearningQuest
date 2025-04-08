import { Card } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audioplayer";
import { Vocabulary } from "@shared/schema";
import { useState } from "react";

interface VocabularyCardProps {
  vocabulary: Vocabulary;
}

export default function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleAudioPlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from flipping when audio button is clicked
  };
  
  return (
    <div className="h-64 mb-4 perspective-1000">
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
          <div onClick={handleAudioPlay}>
            <AudioPlayer src={vocabulary.audioUrl} />
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
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Pronunciation:</strong> {vocabulary.pronunciation}</p>
            <p><strong>Usage:</strong> {vocabulary.usage}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
