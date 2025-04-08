import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

// Lesson model
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  duration: integer("duration").notNull(), // in minutes
  order: integer("order").notNull(),
  wordCount: integer("word_count").notNull(),
  status: text("status").notNull().default("locked"), // locked, available, in_progress, completed
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

// Vocabulary model
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  portuguese: text("portuguese").notNull(),
  english: text("english").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  pronunciation: text("pronunciation"),
  usage: text("usage"),
});

export const insertVocabularySchema = createInsertSchema(vocabulary).omit({
  id: true,
});

// Quiz questions model
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

// Quiz options model
export const quizOptions = pgTable("quiz_options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  option: text("option").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

export const insertQuizOptionSchema = createInsertSchema(quizOptions).omit({
  id: true,
});

// User progress model
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
  completedAt: text("completed_at"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Vocabulary = typeof vocabulary.$inferSelect;
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

export type QuizOption = typeof quizOptions.$inferSelect;
export type InsertQuizOption = z.infer<typeof insertQuizOptionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
