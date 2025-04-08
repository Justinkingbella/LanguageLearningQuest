import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Volume2 } from "lucide-react";
import { useState } from "react";
import { AudioPlayer } from "@/components/ui/audioplayer";

interface QuizOption {
  id: number;
  option: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  explanation?: string;
  options: QuizOption[];
}

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
  audioPath?: string;
}

export default function QuizCard({
  question,
  onAnswer,
  audioPath
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setHasSubmitted(true);
    onAnswer(correct);
  };
  
  const resetQuestion = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-heading font-semibold">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          disabled={hasSubmitted}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div key={option.id} className="border border-neutral-200 rounded-md hover:bg-neutral-100">
              <Label 
                htmlFor={`option-${option.id}`}
                className="flex items-center p-3 cursor-pointer w-full"
              >
                <RadioGroupItem 
                  id={`option-${option.id}`} 
                  value={option.option} 
                  className="h-5 w-5 text-primary"
                />
                <span className="ml-3 text-neutral-800">{option.option}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {hasSubmitted && (
          <div className="mt-6">
            {isCorrect ? (
              <div className="bg-green-500 bg-opacity-10 text-green-500 p-3 rounded-md flex items-start">
                <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Correct!</p>
                  <p className="text-sm">{question.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-500 bg-opacity-10 text-red-500 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Not quite!</p>
                  <p className="text-sm">
                    The correct answer is "{question.correctAnswer}".
                  </p>
                  <p className="text-sm">{question.explanation}</p>
                  
                  {audioPath && (
                    <div className="mt-2 flex items-center text-sm">
                      <AudioPlayer src={audioPath} className="mr-2" />
                      <span>Hear pronunciation</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          {!hasSubmitted ? (
            <Button 
              onClick={handleCheckAnswer} 
              disabled={!selectedOption}
              className="bg-green-500 hover:bg-green-600"
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={resetQuestion} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
