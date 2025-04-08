import {
  users, type User, type InsertUser,
  lessons, type Lesson, type InsertLesson,
  vocabulary, type Vocabulary, type InsertVocabulary,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  quizOptions, type QuizOption, type InsertQuizOption,
  userProgress, type UserProgress, type InsertUserProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lesson operations
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLessonStatus(id: number, status: string): Promise<Lesson | undefined>;
  
  // Vocabulary operations
  getVocabularyByLessonId(lessonId: number): Promise<Vocabulary[]>;
  getVocabulary(id: number): Promise<Vocabulary | undefined>;
  createVocabulary(vocabulary: InsertVocabulary): Promise<Vocabulary>;
  
  // Quiz operations
  getQuizQuestionsByLessonId(lessonId: number): Promise<QuizQuestion[]>;
  getQuizQuestion(id: number): Promise<QuizQuestion | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  getQuizOptionsByQuestionId(questionId: number): Promise<QuizOption[]>;
  createQuizOption(option: InsertQuizOption): Promise<QuizOption>;
  
  // Progress operations
  getUserProgressByUserId(userId: number): Promise<UserProgress[]>;
  getUserProgressByLessonId(userId: number, lessonId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, progress: Partial<UserProgress>): Promise<UserProgress | undefined>;
  calculateUserProgressPercentage(userId: number): Promise<number>;
  
  // Database initialization
  seedDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Lesson operations
  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.order);
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values(insertLesson).returning();
    return lesson;
  }
  
  async updateLessonStatus(id: number, status: string): Promise<Lesson | undefined> {
    const [lesson] = await db.update(lessons)
      .set({ status })
      .where(eq(lessons.id, id))
      .returning();
    return lesson;
  }
  
  // Vocabulary operations
  async getVocabularyByLessonId(lessonId: number): Promise<Vocabulary[]> {
    return await db.select().from(vocabulary).where(eq(vocabulary.lessonId, lessonId));
  }
  
  async getVocabulary(id: number): Promise<Vocabulary | undefined> {
    const [vocab] = await db.select().from(vocabulary).where(eq(vocabulary.id, id));
    return vocab;
  }
  
  async createVocabulary(insertVocabulary: InsertVocabulary): Promise<Vocabulary> {
    const [vocab] = await db.insert(vocabulary).values(insertVocabulary).returning();
    return vocab;
  }
  
  // Quiz operations
  async getQuizQuestionsByLessonId(lessonId: number): Promise<QuizQuestion[]> {
    return await db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, lessonId));
  }
  
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    const [question] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id));
    return question;
  }
  
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const [question] = await db.insert(quizQuestions).values(insertQuestion).returning();
    return question;
  }
  
  async getQuizOptionsByQuestionId(questionId: number): Promise<QuizOption[]> {
    return await db.select().from(quizOptions).where(eq(quizOptions.questionId, questionId));
  }
  
  async createQuizOption(insertOption: InsertQuizOption): Promise<QuizOption> {
    const [option] = await db.insert(quizOptions).values(insertOption).returning();
    return option;
  }
  
  // Progress operations
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }
  
  async getUserProgressByLessonId(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.lessonId, lessonId)
      ));
    return progress;
  }
  
  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }
  
  async updateUserProgress(id: number, partialProgress: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [progress] = await db.update(userProgress)
      .set(partialProgress)
      .where(eq(userProgress.id, id))
      .returning();
    return progress;
  }
  
  async calculateUserProgressPercentage(userId: number): Promise<number> {
    const allLessons = await this.getLessons();
    const userProgressItems = await this.getUserProgressByUserId(userId);
    
    const completedLessons = userProgressItems.filter(progress => progress.completed).length;
    const totalLessons = allLessons.length;
    
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  }
  
  // Seed database with initial data
  async seedDatabase(): Promise<void> {
    // Check if we already have users
    const existingUsers = await db.select({ count: users.id }).from(users);
    if (existingUsers.length > 0 && existingUsers[0].count > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
    // Create a demo user
    const [user] = await db.insert(users).values({
      username: "demo",
      password: "demo123",
      displayName: "Maria",
      level: 3,
      xp: 250
    }).returning();
    
    // Create lessons
    const [basicGreetings] = await db.insert(lessons).values({
      title: "Basic Greetings",
      description: "Learn essential greetings to start conversations in Portuguese.",
      imageUrl: "",
      duration: 10,
      order: 1,
      wordCount: 6,
      status: "in_progress"
    }).returning();
    
    const [orderingFood] = await db.insert(lessons).values({
      title: "Ordering Food",
      description: "Learn vocabulary for restaurants and cafes",
      imageUrl: "",
      duration: 15,
      order: 2,
      wordCount: 15,
      status: "available"
    }).returning();
    
    const [gettingAround] = await db.insert(lessons).values({
      title: "Getting Around",
      description: "Transportation and directions vocabulary",
      imageUrl: "",
      duration: 12,
      order: 3,
      wordCount: 12,
      status: "available"
    }).returning();
    
    const [shopping] = await db.insert(lessons).values({
      title: "Shopping",
      description: "Essential vocabulary for shopping",
      imageUrl: "",
      duration: 15,
      order: 4,
      wordCount: 18,
      status: "available"
    }).returning();
    
    // Create vocabulary for Basic Greetings
    const greetingsVocabulary = [
      {
        portuguese: "Olá",
        english: "Hello",
        pronunciation: "oh-LAH",
        usage: "Greeting used any time of day"
      },
      {
        portuguese: "Bom dia",
        english: "Good morning",
        pronunciation: "bohn DEE-ah",
        usage: "Morning greeting until noon"
      },
      {
        portuguese: "Boa tarde",
        english: "Good afternoon",
        pronunciation: "BOH-ah TAR-jay",
        usage: "Afternoon greeting until sunset"
      },
      {
        portuguese: "Boa noite",
        english: "Good night",
        pronunciation: "BOH-ah NOY-chay",
        usage: "Evening greeting and farewell"
      },
      {
        portuguese: "Como vai?",
        english: "How are you?",
        pronunciation: "KOH-moh vye",
        usage: "Casual greeting"
      },
      {
        portuguese: "Tchau",
        english: "Goodbye",
        pronunciation: "chow",
        usage: "Casual goodbye"
      }
    ];
    
    for (const vocab of greetingsVocabulary) {
      await db.insert(vocabulary).values({
        lessonId: basicGreetings.id,
        portuguese: vocab.portuguese,
        english: vocab.english,
        imageUrl: "",
        audioUrl: `/api/audio/${vocab.portuguese.toLowerCase().replace(/ /g, '_')}`,
        pronunciation: vocab.pronunciation,
        usage: vocab.usage
      });
    }
    
    // Create quiz questions for Basic Greetings
    const greetingsQuizQuestions = [
      {
        question: "What does 'Olá' mean?",
        correctAnswer: "Hello",
        explanation: "'Olá' is a generic greeting used at any time of day in Portuguese.",
        options: ["Hello", "Goodbye", "Thank you", "Please"]
      },
      {
        question: "What does 'Bom dia' mean?",
        correctAnswer: "Good morning",
        explanation: "'Bom dia' means 'Good morning' and is used until noon.",
        options: ["Good morning", "Good afternoon", "Good evening", "Good night"]
      },
      {
        question: "What does 'Boa tarde' mean?",
        correctAnswer: "Good afternoon",
        explanation: "'Boa tarde' means 'Good afternoon' and is used from noon until sunset.",
        options: ["Good morning", "Good afternoon", "Good evening", "Good night"]
      },
      {
        question: "What does 'Boa noite' mean?",
        correctAnswer: "Good night",
        explanation: "'Boa noite' means 'Good night' and can be used as both a greeting and farewell at night.",
        options: ["Good night", "Good evening", "Good afternoon", "Goodbye"]
      },
      {
        question: "What does 'Como vai?' mean?",
        correctAnswer: "How are you?",
        explanation: "'Como vai?' is a casual way to ask 'How are you?' in Portuguese.",
        options: ["How are you?", "What's your name?", "Where are you going?", "How old are you?"]
      }
    ];
    
    for (const q of greetingsQuizQuestions) {
      const [question] = await db.insert(quizQuestions).values({
        lessonId: basicGreetings.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }).returning();
      
      // Create options for each question
      for (const opt of q.options) {
        await db.insert(quizOptions).values({
          questionId: question.id,
          option: opt,
          isCorrect: opt === q.correctAnswer
        });
      }
    }
    
    // Create user progress
    await db.insert(userProgress).values({
      userId: user.id,
      lessonId: basicGreetings.id,
      completed: false,
      score: null,
      completedAt: null
    });
    
    console.log("Database seeded successfully");
  }
}

export const storage = new DatabaseStorage();
