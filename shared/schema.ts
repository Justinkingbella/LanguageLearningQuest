import { pgTable, text, serial, integer, boolean, primaryKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
});

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  conversationPractice: many(userConversationPractice),
}));

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

export const lessonsRelations = relations(lessons, ({ many }) => ({
  vocabulary: many(vocabulary),
  quizQuestions: many(quizQuestions),
  userProgress: many(userProgress),
  conversationScenarios: many(conversationScenarios),
}));

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

// Vocabulary model
export const vocabulary = pgTable("vocabulary", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  portuguese: text("portuguese").notNull(),
  english: text("english").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  pronunciation: text("pronunciation"),
  usage: text("usage"),
});

export const vocabularyRelations = relations(vocabulary, ({ one }) => ({
  lesson: one(lessons, {
    fields: [vocabulary.lessonId],
    references: [lessons.id],
  }),
}));

export const insertVocabularySchema = createInsertSchema(vocabulary).omit({
  id: true,
});

// Quiz questions model
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
});

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [quizQuestions.lessonId],
    references: [lessons.id],
  }),
  options: many(quizOptions),
}));

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

// Quiz options model
export const quizOptions = pgTable("quiz_options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  option: text("option").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

export const quizOptionsRelations = relations(quizOptions, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizOptions.questionId],
    references: [quizQuestions.id],
  }),
}));

export const insertQuizOptionSchema = createInsertSchema(quizOptions).omit({
  id: true,
});

// User progress model
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
  completedAt: text("completed_at"),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

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

// Conversation scenarios model
export const conversationScenarios = pgTable("conversation_scenarios", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  context: text("context").notNull(),
  imageUrl: text("image_url"),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  category: text("category").notNull(), // greetings, restaurant, shopping, etc.
});

export const conversationScenariosRelations = relations(conversationScenarios, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [conversationScenarios.lessonId],
    references: [lessons.id],
  }),
  dialogues: many(conversationDialogues),
}));

export const insertConversationScenarioSchema = createInsertSchema(conversationScenarios).omit({
  id: true,
});

// Conversation dialogues model
export const conversationDialogues = pgTable("conversation_dialogues", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull().references(() => conversationScenarios.id, { onDelete: "cascade" }),
  speakerRole: text("speaker_role").notNull(), // user, native_speaker
  portuguese: text("portuguese").notNull(),
  english: text("english").notNull(),
  audioUrl: text("audio_url"),
  order: integer("order").notNull(),
  hints: jsonb("hints"), // JSON array of hint strings
  acceptedResponses: jsonb("accepted_responses"), // JSON array of alternative acceptable responses
});

export const conversationDialoguesRelations = relations(conversationDialogues, ({ one }) => ({
  scenario: one(conversationScenarios, {
    fields: [conversationDialogues.scenarioId],
    references: [conversationScenarios.id],
  }),
}));

export const insertConversationDialogueSchema = createInsertSchema(conversationDialogues).omit({
  id: true,
});

// User conversation practice model
export const userConversationPractice = pgTable("user_conversation_practice", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scenarioId: integer("scenario_id").notNull().references(() => conversationScenarios.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  accuracy: integer("accuracy"), // percentage of correct responses
  completedAt: text("completed_at"),
});

export const userConversationPracticeRelations = relations(userConversationPractice, ({ one }) => ({
  user: one(users, {
    fields: [userConversationPractice.userId],
    references: [users.id],
  }),
  scenario: one(conversationScenarios, {
    fields: [userConversationPractice.scenarioId],
    references: [conversationScenarios.id],
  }),
}));

export const insertUserConversationPracticeSchema = createInsertSchema(userConversationPractice).omit({
  id: true,
});

// Type definitions
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type ConversationScenario = typeof conversationScenarios.$inferSelect;
export type InsertConversationScenario = z.infer<typeof insertConversationScenarioSchema>;

export type ConversationDialogue = typeof conversationDialogues.$inferSelect;
export type InsertConversationDialogue = z.infer<typeof insertConversationDialogueSchema>;

export type UserConversationPractice = typeof userConversationPractice.$inferSelect;
export type InsertUserConversationPractice = z.infer<typeof insertUserConversationPracticeSchema>;
