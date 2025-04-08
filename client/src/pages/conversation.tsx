import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { getQueryFn } from "@/lib/queryClient";
import { AudioPlayer } from "@/components/ui/audioplayer";
import { Badge } from "@/components/ui/badge";
import { Mic, CornerDownLeft, Volume2, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogueMessage {
  id: number;
  speakerRole: string;
  portuguese: string;
  english: string;
  audioUrl: string | null;
  order: number;
  hints: string[];
  acceptedResponses: string[];
}

interface ConversationScenario {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  context: string;
  imageUrl: string | null;
  difficulty: string;
  category: string;
}

export default function ConversationPage() {
  const [, params] = useRoute("/conversation/:id");
  const scenarioId = params?.id ? parseInt(params.id) : 0;
  
  const [currentMessage, setCurrentMessage] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const [, navigate] = useLocation();
  const recognitionRef = useRef<any>(null);
  
  // Get the conversation scenario
  const { data: scenario } = useQuery<ConversationScenario>({
    queryKey: ['/api/conversations', scenarioId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!scenarioId,
  });
  
  // Get the dialogue messages
  const { data: dialogues, isLoading } = useQuery<DialogueMessage[]>({
    queryKey: ['/api/conversations', scenarioId, 'dialogues'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!scenarioId,
  });
  
  // Initialize the speech recognition when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // @ts-ignore: Typescript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'pt-BR'; // Portuguese (Brazil)
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setUserInput(transcript);
          checkResponse(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [dialogues, currentMessage]);
  
  // Start listening for speech
  const startListening = () => {
    setUserInput("");
    setShowHint(false);
    setShowFeedback(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      setFeedbackMessage("Speech recognition is not supported in your browser.");
      setShowFeedback(true);
    }
  };
  
  // Stop listening for speech
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  // Check the user's response against the accepted responses
  const checkResponse = (input: string) => {
    if (!dialogues || currentMessage >= dialogues.length) return;
    
    const currentDialogue = dialogues[currentMessage];
    
    if (currentDialogue.speakerRole === 'native_speaker') {
      // If the current message is from the native speaker, just proceed to the next one
      goToNextMessage();
      return;
    }
    
    // Check if the user's response matches any of the accepted responses
    const normalizedInput = input.toLowerCase().trim();
    
    const isCorrect = currentDialogue.acceptedResponses.some(response => {
      const normalizedResponse = response.toLowerCase().trim();
      return normalizedInput.includes(normalizedResponse) || 
             normalizedResponse.includes(normalizedInput);
    });
    
    if (isCorrect) {
      setFeedbackMessage("Correct! 🎉");
      setCorrectResponses(prev => prev + 1);
    } else {
      setFeedbackMessage(`Try again. You can say: "${currentDialogue.portuguese}"`);
    }
    
    setShowFeedback(true);
    
    if (isCorrect) {
      // Proceed to next message after a short delay for feedback
      setTimeout(() => {
        goToNextMessage();
      }, 1500);
    }
  };
  
  // Submit the text input
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkResponse(userInput);
  };
  
  // Go to the next message in the dialogue
  const goToNextMessage = () => {
    if (!dialogues) return;
    
    const nextIndex = currentMessage + 1;
    
    if (nextIndex < dialogues.length) {
      setCurrentMessage(nextIndex);
      setUserInput("");
      setShowHint(false);
      setShowFeedback(false);
      setShowTranslation(false);
      
      // If the next message is from the native speaker
      // Note: We don't auto-play audio anymore since we removed the id
      // The user can play the audio manually
    } else {
      // End of conversation
      const accuracy = Math.round((correctResponses / (dialogues.filter(d => d.speakerRole === 'user').length)) * 100);
      
      // Submit the results
      fetch(`/api/conversations/${scenarioId}/practice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // In a real app, this would be the current user's ID
          scenarioId,
          completed: true,
          accuracy,
        }),
      })
      .then(res => res.json())
      .then(() => {
        setCompleted(true);
      })
      .catch(err => {
        console.error('Error submitting conversation practice:', err);
      });
    }
  };
  
  // Show or hide the hint
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  
  // Show or hide the translation
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };
  
  // Continue the conversation (for native speaker turns)
  const continueConversation = () => {
    goToNextMessage();
  };
  
  // Return to the lessons page
  const returnToLessons = () => {
    navigate("/");
  };

  // If we're still loading the data or there are no dialogues, show a loading state
  if (isLoading || !dialogues || !scenario) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader title="Conversation Practice" />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading conversation...</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  // Get the current dialogue message
  const currentDialogue = dialogues[currentMessage];
  const isNativeSpeaker = currentDialogue.speakerRole === 'native_speaker';
  const isUserTurn = currentDialogue.speakerRole === 'user';
  
  // Calculate progress
  const totalMessages = dialogues.length;
  const progress = Math.round((currentMessage / totalMessages) * 100);
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader title={scenario.title} />
      
      <main className="flex-grow container max-w-md mx-auto p-4">
        {/* Progress indicator */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
          <div 
            className="h-2 bg-primary rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Context card */}
        {currentMessage === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conversation Context</CardTitle>
              <Badge variant="outline" className="w-fit">{scenario.difficulty}</Badge>
            </CardHeader>
            <CardContent>
              <p>{scenario.context}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setCurrentMessage(1)}>Start Conversation</Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Completed card */}
        {completed && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conversation Completed!</CardTitle>
              <CardDescription>
                You have completed this conversation practice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You got {correctResponses} out of {dialogues.filter(d => d.speakerRole === 'user').length} responses correct.
              </p>
              <p>
                Score: {Math.round((correctResponses / (dialogues.filter(d => d.speakerRole === 'user').length)) * 100)}%
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCurrentMessage(0);
                setCorrectResponses(0);
                setCompleted(false);
              }}>
                Practice Again
              </Button>
              <Button onClick={returnToLessons}>Return to Lessons</Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Conversation dialogue */}
        {currentMessage > 0 && !completed && currentDialogue && (
          <>
            <div 
              className={cn(
                "mb-4 p-4 rounded-lg max-w-[80%]",
                isNativeSpeaker 
                  ? "bg-secondary text-secondary-foreground ml-0" 
                  : "bg-primary text-primary-foreground ml-auto"
              )}
            >
              <div className="mb-2 font-semibold">
                {isNativeSpeaker ? 'Native Speaker' : 'You'}
              </div>
              <p>{currentDialogue.portuguese}</p>
              {showTranslation && (
                <p className="mt-2 text-sm italic opacity-80">{currentDialogue.english}</p>
              )}
              {isNativeSpeaker && currentDialogue.audioUrl && (
                <div className="mt-2">
                  <AudioPlayer 
                    src={currentDialogue.audioUrl} 
                    className="w-full"
                    onPlay={() => {
                      // Audio is being played
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
              {isNativeSpeaker ? (
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="outline" 
                    onClick={toggleTranslation}
                    className="flex items-center gap-2"
                  >
                    <Volume2 size={16} />
                    {showTranslation ? "Hide Translation" : "Show Translation"}
                  </Button>
                  <Button onClick={continueConversation} className="w-full">
                    Continue Conversation
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your response in Portuguese..."
                      className="flex-grow p-2 border rounded-md"
                    />
                    <Button type="submit">
                      <CornerDownLeft size={16} />
                    </Button>
                  </form>
                  
                  <div className="flex justify-between gap-2">
                    <Button 
                      variant={isListening ? "destructive" : "outline"} 
                      onClick={isListening ? stopListening : startListening}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Mic size={16} />
                      {isListening ? "Stop Listening" : "Speak"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={toggleHint}
                      className="flex items-center gap-2 flex-1"
                    >
                      <HelpCircle size={16} />
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <BottomNavigation />
      
      {/* Hint dialog */}
      <Dialog open={showHint} onOpenChange={setShowHint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hint</DialogTitle>
            <DialogDescription>
              Here are some hints to help you respond:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ul className="list-disc pl-5 space-y-2">
              {currentDialogue?.hints.map((hint, index) => (
                <li key={index}>{hint}</li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Feedback dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>{feedbackMessage}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}