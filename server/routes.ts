import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserProgressSchema,
  insertUserConversationPracticeSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API routes
  const apiRouter = app.route("/api");
  
  // Get all lessons
  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      return res.json(lessons);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });
  
  // Get a specific lesson
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      
      const lesson = await storage.getLesson(id);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      
      return res.json(lesson);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });
  
  // Get vocabulary for a lesson
  app.get("/api/lessons/:id/vocabulary", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      
      const vocabulary = await storage.getVocabularyByLessonId(id);
      return res.json(vocabulary);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });
  
  // Get quiz questions for a lesson
  app.get("/api/lessons/:id/quiz", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      
      const questions = await storage.getQuizQuestionsByLessonId(id);
      
      // Get options for each question
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await storage.getQuizOptionsByQuestionId(question.id);
          return {
            ...question,
            options: options.map(opt => ({
              id: opt.id,
              option: opt.option
            }))
          };
        })
      );
      
      return res.json(questionsWithOptions);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });
  
  // Update lesson status
  app.patch("/api/lessons/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedLesson = await storage.updateLessonStatus(id, status);
      if (!updatedLesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }
      
      return res.json(updatedLesson);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update lesson status" });
    }
  });
  
  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Get progress percentage
      const progressPercentage = await storage.calculateUserProgressPercentage(id);
      
      return res.json({ 
        ...userWithoutPassword,
        progressPercentage
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Audio file placeholder - in a real app, this would serve actual audio files
  app.get("/api/audio/:fileName", (req, res) => {
    // This is a placeholder route to demonstrate the endpoint structure
    // In a real application, this would serve actual audio files
    return res.status(204).send();
  });
  
  // Submit quiz results
  app.post("/api/lessons/:id/progress", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      if (isNaN(lessonId)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      
      // Validate request body
      const progressSchema = insertUserProgressSchema.extend({
        score: z.number().min(0),
      });
      
      const validatedData = progressSchema.parse(req.body);
      
      // Check if progress already exists
      const existingProgress = await storage.getUserProgressByLessonId(
        validatedData.userId, 
        lessonId
      );
      
      let progress;
      
      if (existingProgress) {
        // Update existing progress
        progress = await storage.updateUserProgress(existingProgress.id, {
          completed: true,
          score: validatedData.score,
          completedAt: new Date().toISOString()
        });
      } else {
        // Create new progress
        progress = await storage.createUserProgress({
          userId: validatedData.userId,
          lessonId,
          completed: true,
          score: validatedData.score,
          completedAt: new Date().toISOString()
        });
      }
      
      // Update lesson status to completed
      await storage.updateLessonStatus(lessonId, "completed");
      
      return res.json(progress);
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data provided", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to save progress" });
    }
  });
  
  // Get progress for a user
  app.get("/api/users/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const progress = await storage.getUserProgressByUserId(id);
      return res.json(progress);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch progress" });
    }
  });
  
  // Get user progress for a specific lesson
  app.get("/api/users/:userId/lessons/:lessonId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const lessonId = parseInt(req.params.lessonId);
      
      if (isNaN(userId) || isNaN(lessonId)) {
        return res.status(400).json({ error: "Invalid user ID or lesson ID" });
      }
      
      const progress = await storage.getUserProgressByLessonId(userId, lessonId);
      
      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      
      return res.json(progress);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch progress" });
    }
  });
  
  // Get user study statistics
  app.get("/api/users/:id/statistics", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get all user progress
      const progress = await storage.getUserProgressByUserId(id);
      
      // Get all lessons
      const lessons = await storage.getLessons();
      
      // Calculate statistics
      const completedLessons = progress.filter(p => p.completed).length;
      const totalLessons = lessons.length;
      const progressPercentage = await storage.calculateUserProgressPercentage(id);
      
      // Calculate average score if there are completed lessons
      let averageScore = 0;
      const scoresWithValues = progress.filter(p => p.completed && p.score !== null);
      
      if (scoresWithValues.length > 0) {
        const totalScore = scoresWithValues.reduce((sum, p) => sum + (p.score || 0), 0);
        averageScore = Math.round(totalScore / scoresWithValues.length);
      }
      
      // Calculate vocabulary learned
      const completedLessonIds = progress
        .filter(p => p.completed)
        .map(p => p.lessonId);
      
      let vocabularyCount = 0;
      for (const lessonId of completedLessonIds) {
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
          vocabularyCount += lesson.wordCount;
        }
      }
      
      return res.json({
        completedLessons,
        totalLessons,
        progressPercentage,
        averageScore,
        vocabularyCount,
        level: user.level,
        xp: user.xp
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  
  // Search vocabulary
  app.get("/api/vocabulary/search", async (req, res) => {
    try {
      const searchTerm = req.query.term as string;
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ error: "Search term is required" });
      }
      
      // Get all vocabulary items from all lessons
      const lessons = await storage.getLessons();
      const results = [];
      
      for (const lesson of lessons) {
        const vocabularyItems = await storage.getVocabularyByLessonId(lesson.id);
        
        // Filter vocabulary items that match the search term
        const matchingItems = vocabularyItems.filter(item => 
          item.portuguese.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.english.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Add lesson info to matching items
        const itemsWithLessonInfo = matchingItems.map(item => ({
          ...item,
          lessonTitle: lesson.title,
          lessonId: lesson.id
        }));
        
        results.push(...itemsWithLessonInfo);
      }
      
      // Sort by relevance - exact matches first, then partial matches
      // This is a basic relevance algorithm that could be improved
      results.sort((a, b) => {
        const aExactMatch = 
          a.portuguese.toLowerCase() === searchTerm.toLowerCase() || 
          a.english.toLowerCase() === searchTerm.toLowerCase();
        
        const bExactMatch = 
          b.portuguese.toLowerCase() === searchTerm.toLowerCase() || 
          b.english.toLowerCase() === searchTerm.toLowerCase();
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // If both are exact matches or both are partial, sort alphabetically
        return a.portuguese.localeCompare(b.portuguese);
      });
      
      return res.json(results);
    } catch (error) {
      console.error('Vocabulary search error:', error);
      return res.status(500).json({ error: "Failed to search vocabulary" });
    }
  });
  
  // Get conversation scenarios for a lesson
  app.get("/api/lessons/:id/conversations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lesson ID" });
      }
      
      const scenarios = await storage.getConversationScenariosByLessonId(id);
      return res.json(scenarios);
    } catch (error) {
      console.error('Get conversation scenarios error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation scenarios" });
    }
  });
  
  // Get all conversation scenarios
  app.get("/api/conversation-scenarios", async (req, res) => {
    try {
      // Get all lessons
      const lessons = await storage.getLessons();
      
      // Get scenarios for each lesson
      const allScenarios = [];
      for (const lesson of lessons) {
        const scenarios = await storage.getConversationScenariosByLessonId(lesson.id);
        allScenarios.push(...scenarios);
      }
      
      return res.json(allScenarios);
    } catch (error) {
      console.error('Get all conversation scenarios error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation scenarios" });
    }
  });
  
  // Get a specific conversation scenario
  app.get("/api/conversation-scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const scenario = await storage.getConversationScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: "Conversation scenario not found" });
      }
      
      return res.json(scenario);
    } catch (error) {
      console.error('Get conversation scenario error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation scenario" });
    }
  });
  
  // Get a specific conversation scenario (legacy URL)
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const scenario = await storage.getConversationScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: "Conversation scenario not found" });
      }
      
      return res.json(scenario);
    } catch (error) {
      console.error('Get conversation scenario error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation scenario" });
    }
  });
  
  // Get dialogues for a conversation scenario
  app.get("/api/conversation-scenarios/:id/dialogues", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const dialogues = await storage.getConversationDialoguesByScenarioId(id);
      
      console.log('Raw dialogue data sample:', 
        dialogues.length > 0 ? {
          id: dialogues[0].id,
          hints: dialogues[0].hints,
          hintsType: typeof dialogues[0].hints,
          acceptedResponses: dialogues[0].acceptedResponses,
          acceptedResponsesType: typeof dialogues[0].acceptedResponses
        } : 'No dialogues found'
      );
      
      // Process dialogue data based on its type
      const processedDialogues = dialogues.map(dialogue => {
        let hintsArray = [];
        let responsesArray = [];
        
        // Handle hints based on its type
        if (Array.isArray(dialogue.hints)) {
          hintsArray = dialogue.hints;
        } else if (typeof dialogue.hints === 'string') {
          try {
            hintsArray = JSON.parse(dialogue.hints);
          } catch (e) {
            console.error('Error parsing hints as JSON:', e);
            hintsArray = [];
          }
        }
        
        // Handle acceptedResponses based on its type
        if (Array.isArray(dialogue.acceptedResponses)) {
          responsesArray = dialogue.acceptedResponses;
        } else if (typeof dialogue.acceptedResponses === 'string') {
          try {
            responsesArray = JSON.parse(dialogue.acceptedResponses);
          } catch (e) {
            console.error('Error parsing acceptedResponses as JSON:', e);
            responsesArray = [];
          }
        }
        
        return {
          ...dialogue,
          hints: hintsArray,
          acceptedResponses: responsesArray
        };
      });
      
      return res.json(processedDialogues);
    } catch (error) {
      console.error('Get conversation dialogues error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation dialogues" });
    }
  });
  
  // Get dialogues for a conversation scenario (legacy URL)
  app.get("/api/conversations/:id/dialogues", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const dialogues = await storage.getConversationDialoguesByScenarioId(id);
      
      // Process dialogue data based on its type
      const processedDialogues = dialogues.map(dialogue => {
        let hintsArray = [];
        let responsesArray = [];
        
        // Handle hints based on its type
        if (Array.isArray(dialogue.hints)) {
          hintsArray = dialogue.hints;
        } else if (typeof dialogue.hints === 'string') {
          try {
            hintsArray = JSON.parse(dialogue.hints);
          } catch (e) {
            console.error('Error parsing hints as JSON:', e);
            hintsArray = [];
          }
        }
        
        // Handle acceptedResponses based on its type
        if (Array.isArray(dialogue.acceptedResponses)) {
          responsesArray = dialogue.acceptedResponses;
        } else if (typeof dialogue.acceptedResponses === 'string') {
          try {
            responsesArray = JSON.parse(dialogue.acceptedResponses);
          } catch (e) {
            console.error('Error parsing acceptedResponses as JSON:', e);
            responsesArray = [];
          }
        }
        
        return {
          ...dialogue,
          hints: hintsArray,
          acceptedResponses: responsesArray
        };
      });
      
      return res.json(processedDialogues);
    } catch (error) {
      console.error('Get conversation dialogues error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation dialogues" });
    }
  });
  
  // Submit conversation practice results
  app.post("/api/conversation-scenarios/:id/practice", async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.id);
      if (isNaN(scenarioId)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      // Validate request body
      const practiceSchema = insertUserConversationPracticeSchema.extend({
        accuracy: z.number().min(0).max(100),
      });
      
      const validatedData = practiceSchema.parse(req.body);
      
      // Check if practice already exists
      const existingPractice = await storage.getUserConversationPracticeByScenarioId(
        validatedData.userId, 
        scenarioId
      );
      
      let practice;
      
      if (existingPractice) {
        // Update existing practice
        practice = await storage.updateUserConversationPractice(existingPractice.id, {
          completed: true,
          accuracy: validatedData.accuracy,
          completedAt: new Date().toISOString()
        });
      } else {
        // Create new practice
        practice = await storage.createUserConversationPractice({
          userId: validatedData.userId,
          scenarioId,
          completed: true,
          accuracy: validatedData.accuracy,
          completedAt: new Date().toISOString()
        });
      }
      
      return res.json(practice);
    } catch (error) {
      console.error('Submit conversation practice error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data provided", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to save conversation practice" });
    }
  });
  
  // Submit conversation practice results (legacy URL)
  app.post("/api/conversations/:id/practice", async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.id);
      if (isNaN(scenarioId)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      // Validate request body
      const practiceSchema = insertUserConversationPracticeSchema.extend({
        accuracy: z.number().min(0).max(100),
      });
      
      const validatedData = practiceSchema.parse(req.body);
      
      // Check if practice already exists
      const existingPractice = await storage.getUserConversationPracticeByScenarioId(
        validatedData.userId, 
        scenarioId
      );
      
      let practice;
      
      if (existingPractice) {
        // Update existing practice
        practice = await storage.updateUserConversationPractice(existingPractice.id, {
          completed: true,
          accuracy: validatedData.accuracy,
          completedAt: new Date().toISOString()
        });
      } else {
        // Create new practice
        practice = await storage.createUserConversationPractice({
          userId: validatedData.userId,
          scenarioId,
          completed: true,
          accuracy: validatedData.accuracy,
          completedAt: new Date().toISOString()
        });
      }
      
      return res.json(practice);
    } catch (error) {
      console.error('Submit conversation practice error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data provided", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to save conversation practice" });
    }
  });
  
  // Get conversation practice for a user
  app.get("/api/users/:id/conversation-practice", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const practice = await storage.getUserConversationPracticeByUserId(id);
      return res.json(practice);
    } catch (error) {
      console.error('Get user conversation practice error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation practice" });
    }
  });
  
  // Get user conversation practice for a specific scenario
  app.get("/api/users/:userId/conversations/:scenarioId/practice", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const scenarioId = parseInt(req.params.scenarioId);
      
      if (isNaN(userId) || isNaN(scenarioId)) {
        return res.status(400).json({ error: "Invalid user ID or scenario ID" });
      }
      
      const practice = await storage.getUserConversationPracticeByScenarioId(userId, scenarioId);
      
      if (!practice) {
        return res.status(404).json({ error: "Conversation practice not found" });
      }
      
      return res.json(practice);
    } catch (error) {
      console.error('Get user conversation practice error:', error);
      return res.status(500).json({ error: "Failed to fetch conversation practice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
