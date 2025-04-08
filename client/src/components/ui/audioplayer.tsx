import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  onPlay?: () => void;
  className?: string;
}

export function AudioPlayer({ src, onPlay, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playAudio = () => {
    const audio = new Audio(src);
    
    setIsPlaying(true);
    
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
    });
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    if (onPlay) {
      onPlay();
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`text-primary hover:text-primary/80 ${className}`}
      onClick={playAudio}
      disabled={isPlaying}
      aria-label="Play pronunciation"
    >
      {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </Button>
  );
}
