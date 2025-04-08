import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortugueseSpeaker, SpeechRecognizer } from "@/components/ui/portuguese-speaker";
import { AlertCircle, Check, User, Volume2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vocabulary } from "@shared/schema";

interface TeacherDemoProps {
  vocabulary: Vocabulary;
  onClose: () => void;
}

export default function TeacherDemo({ vocabulary, onClose }: TeacherDemoProps) {
  const [step, setStep] = useState<'listen' | 'practice' | 'usage'>('listen');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [userAttempt, setUserAttempt] = useState<string>('');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  
  // Progress through the teacher demo
  const handleNext = () => {
    if (step === 'listen') {
      setStep('practice');
    } else if (step === 'practice') {
      setStep('usage');
    }
  };
  
  // Handle speech recognition result
  const handleSpeechResult = (transcript: string) => {
    setUserAttempt(transcript);
    
    // Simple comparison for demonstration
    // In a real app, this would use a more sophisticated comparison
    const normalizedTranscript = transcript.toLowerCase().trim();
    const normalizedTarget = vocabulary.portuguese.toLowerCase().trim();
    
    let similarity = 0;
    if (normalizedTranscript === normalizedTarget) {
      similarity = 100;
    } else if (normalizedTranscript.includes(normalizedTarget) || 
               normalizedTarget.includes(normalizedTranscript)) {
      similarity = 75;
    } else {
      // Calculate character-by-character similarity
      const maxLength = Math.max(normalizedTranscript.length, normalizedTarget.length);
      let matchCount = 0;
      
      for (let i = 0; i < Math.min(normalizedTranscript.length, normalizedTarget.length); i++) {
        if (normalizedTranscript[i] === normalizedTarget[i]) {
          matchCount++;
        }
      }
      
      similarity = Math.floor((matchCount / maxLength) * 100);
    }
    
    setPronunciationScore(similarity);
    setFeedback(similarity >= 70 ? 'success' : 'error');
  };
  
  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center text-lg">
          <User className="mr-2 h-5 w-5 text-blue-500" />
          Teacher Mode: {vocabulary.portuguese}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {step === 'listen' && (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-neutral-800 mb-2">
                {vocabulary.portuguese}
              </div>
              <div className="text-muted-foreground italic mb-4">
                {vocabulary.english}
              </div>
              
              <div className="flex justify-center mb-6">
                <PortugueseSpeaker 
                  text={vocabulary.portuguese}
                  displayText="Listen to Teacher"
                  variant="primary"
                  size="md"
                />
              </div>
              
              <p className="text-sm text-neutral-700 mb-4">
                Listen carefully to the pronunciation. Note the accent and intonation.
                You can click the button multiple times to hear it again.
              </p>
              
              <div className="bg-blue-50 p-3 rounded-md mb-6">
                <p className="text-sm font-medium">Pronunciation tip:</p>
                <p className="text-sm">{vocabulary.pronunciation}</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleNext} className="bg-green-500 hover:bg-green-600">
                I'm Ready to Practice
              </Button>
            </div>
          </>
        )}
        
        {step === 'practice' && (
          <>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-neutral-800 mb-2">
                {vocabulary.portuguese}
              </div>
              <p className="text-sm text-neutral-700 mb-4">
                Now it's your turn! Try to pronounce the word.
                Click the button below and speak clearly.
              </p>
              
              <div className="flex justify-center space-x-3 mb-6">
                <PortugueseSpeaker 
                  text={vocabulary.portuguese}
                  showText={false}
                  variant="outline"
                  size="md"
                />
                
                <SpeechRecognizer
                  onResult={handleSpeechResult}
                  variant={feedback === 'success' ? 'primary' : 'outline'}
                >
                  {userAttempt ? 'Try Again' : 'Speak Now'}
                </SpeechRecognizer>
              </div>
              
              {userAttempt && (
                <div className="mb-6">
                  <p className="text-sm text-neutral-700 mb-2">Your pronunciation:</p>
                  <p className="font-medium">{userAttempt}</p>
                  
                  {pronunciationScore !== null && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>{pronunciationScore}%</span>
                      </div>
                      <Progress value={pronunciationScore} className="h-2" />
                      
                      <div className="mt-3">
                        {feedback === 'success' ? (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <p className="text-sm">Good job! Your pronunciation is on the right track.</p>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Try again</p>
                              <p className="text-sm">Focus on the pronunciation: {vocabulary.pronunciation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <Button 
                onClick={handleNext} 
                className="bg-green-500 hover:bg-green-600"
                disabled={feedback !== 'success'}
              >
                Continue to Usage Examples
              </Button>
            </div>
          </>
        )}
        
        {step === 'usage' && (
          <>
            <div className="text-center mb-6">
              <Badge className="mb-4 bg-blue-500">Usage Examples</Badge>
              
              <div className="text-2xl font-bold text-neutral-800 mb-4">
                {vocabulary.portuguese}
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-md mb-6 text-left">
                <p className="text-sm text-neutral-700 mb-2 font-medium">Common usage:</p>
                <p className="mb-3">{vocabulary.usage}</p>
                
                {/* Example conversations would go here in a real app */}
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-neutral-700 mb-2 font-medium">Example conversation:</p>
                  <p className="mb-1 flex items-center">
                    <Badge className="mr-2 bg-blue-500">Person A</Badge>
                    <span>{vocabulary.portuguese}!</span>
                    <PortugueseSpeaker 
                      text={vocabulary.portuguese}
                      showText={false}
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    />
                  </p>
                  <p className="flex items-center">
                    <Badge className="mr-2 bg-green-500">Person B</Badge>
                    <span>{vocabulary.portuguese}, tudo bem?</span>
                    <PortugueseSpeaker 
                      text={`${vocabulary.portuguese}, tudo bem?`}
                      showText={false}
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                    />
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
                Complete Lesson
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}