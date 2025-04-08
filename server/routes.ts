import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
