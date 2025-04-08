import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";

interface PortugueseSpeakerProps {
  text: string;
  displayText?: string;
  onPlay?: () => void;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

/**
 * A component that speaks Portuguese text with native pronunciation
 */
export function PortugueseSpeaker({
  text,
  displayText,
  onPlay,
  size = "md",
  showText = true,
  className = "",
  variant = "primary"
}: PortugueseSpeakerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  
  useEffect(() => {
    // Check if speech synthesis is available
    setIsAvailable('speechSynthesis' in window);
  }, []);
  
  const speakText = () => {
    if (!isAvailable || isPlaying) return;
    
    setIsPlaying(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; // Brazilian Portuguese
    utterance.rate = 0.9; // Slightly slower for learning
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      setIsPlaying(false);
    };
    
    window.speechSynthesis.speak(utterance);
    
    if (onPlay) {
      onPlay();
    }
  };
  
  // Size variants
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const buttonVariants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
    ghost: "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
  };
  
  // Full button version with text
  if (showText) {
    return (
      <Button
        variant="ghost"
        onClick={speakText}
        disabled={!isAvailable || isPlaying}
        className={`flex items-center gap-2 ${buttonVariants[variant]} ${className}`}
        aria-label="Listen to pronunciation"
      >
        {isPlaying ? (
          <VolumeX className={sizeClasses[size]} />
        ) : (
          <Volume2 className={sizeClasses[size]} />
        )}
        <span>{displayText || "Listen"}</span>
      </Button>
    );
  }
  
  // Icon-only version
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={speakText}
      disabled={!isAvailable || isPlaying}
      className={`${buttonVariants[variant]} ${className}`}
      aria-label="Listen to pronunciation"
    >
      {isPlaying ? (
        <VolumeX className={sizeClasses[size]} />
      ) : (
        <Volume2 className={sizeClasses[size]} />
      )}
    </Button>
  );
}

// Speech Recognition Component
interface SpeechRecognizerProps {
  onResult: (transcript: string) => void;
  language?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  children?: React.ReactNode;
}

export function SpeechRecognizer({
  onResult,
  language = 'pt-BR',
  size = "md",
  className = "",
  variant = "primary",
  children
}: SpeechRecognizerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  useEffect(() => {
    // Check if Web Speech API is available
    // @ts-ignore - TypeScript doesn't know about webkit prefixed version
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      setIsAvailable(true);
    }
    
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [language, onResult]);
  
  const toggleListening = () => {
    if (!isAvailable) return;
    
    if (isListening) {
      recognition.abort();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };
  
  // Size variants
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const buttonVariants = {
    primary: "bg-green-500 hover:bg-green-600 text-white",
    outline: "border border-green-500 text-green-500 hover:bg-green-50",
    ghost: "text-green-500 hover:text-green-600 hover:bg-green-50"
  };
  
  return (
    <Button
      variant="ghost"
      onClick={toggleListening}
      disabled={!isAvailable}
      className={`flex items-center gap-2 ${buttonVariants[variant]} ${className}`}
      aria-label={isListening ? "Stop speaking" : "Speak now"}
    >
      {isListening ? (
        <MicOff className={sizeClasses[size]} />
      ) : (
        <Mic className={sizeClasses[size]} />
      )}
      {children}
    </Button>
  );
}