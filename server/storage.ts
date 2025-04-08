import {
  users, type User, type InsertUser,
  lessons, type Lesson, type InsertLesson,
  vocabulary, type Vocabulary, type InsertVocabulary,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  quizOptions, type QuizOption, type InsertQuizOption,
  userProgress, type UserProgress, type InsertUserProgress
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lessons: Map<number, Lesson>;
  private vocabularies: Map<number, Vocabulary>;
  private quizQuestions: Map<number, QuizQuestion>;
  private quizOptions: Map<number, QuizOption>;
  private userProgress: Map<number, UserProgress>;
  
  private currentUserId: number;
  private currentLessonId: number;
  private currentVocabularyId: number;
  private currentQuizQuestionId: number;
  private currentQuizOptionId: number;
  private currentUserProgressId: number;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.vocabularies = new Map();
    this.quizQuestions = new Map();
    this.quizOptions = new Map();
    this.userProgress = new Map();
    
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentVocabularyId = 1;
    this.currentQuizQuestionId = 1;
    this.currentQuizOptionId = 1;
    this.currentUserProgressId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, level: 1, xp: 0 };
    this.users.set(id, user);
    return user;
  }
  
  // Lesson operations
  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }
  
  async updateLessonStatus(id: number, status: string): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    const updatedLesson = { ...lesson, status };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }
  
  // Vocabulary operations
  async getVocabularyByLessonId(lessonId: number): Promise<Vocabulary[]> {
    return Array.from(this.vocabularies.values())
      .filter(vocab => vocab.lessonId === lessonId);
  }
  
  async getVocabulary(id: number): Promise<Vocabulary | undefined> {
    return this.vocabularies.get(id);
  }
  
  async createVocabulary(insertVocabulary: InsertVocabulary): Promise<Vocabulary> {
    const id = this.currentVocabularyId++;
    const vocabulary: Vocabulary = { ...insertVocabulary, id };
    this.vocabularies.set(id, vocabulary);
    return vocabulary;
  }
  
  // Quiz operations
  async getQuizQuestionsByLessonId(lessonId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.lessonId === lessonId);
  }
  
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    return this.quizQuestions.get(id);
  }
  
  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.currentQuizQuestionId++;
    const question: QuizQuestion = { ...insertQuestion, id };
    this.quizQuestions.set(id, question);
    return question;
  }
  
  async getQuizOptionsByQuestionId(questionId: number): Promise<QuizOption[]> {
    return Array.from(this.quizOptions.values())
      .filter(option => option.questionId === questionId);
  }
  
  async createQuizOption(insertOption: InsertQuizOption): Promise<QuizOption> {
    const id = this.currentQuizOptionId++;
    const option: QuizOption = { ...insertOption, id };
    this.quizOptions.set(id, option);
    return option;
  }
  
  // Progress operations
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }
  
  async getUserProgressByLessonId(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId && progress.lessonId === lessonId);
  }
  
  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentUserProgressId++;
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgress.set(id, progress);
    return progress;
  }
  
  async updateUserProgress(id: number, partialProgress: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progress = this.userProgress.get(id);
    if (!progress) return undefined;
    
    const updatedProgress = { ...progress, ...partialProgress };
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  async calculateUserProgressPercentage(userId: number): Promise<number> {
    const totalLessons = this.lessons.size;
    if (totalLessons === 0) return 0;
    
    const completedLessons = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId && progress.completed)
      .length;
    
    return Math.round((completedLessons / totalLessons) * 100);
  }
  
  // Helper method to initialize sample data
  private initializeSampleData() {
    // Create a demo user
    const user: User = {
      id: this.currentUserId++,
      username: "demo",
      password: "demo123",
      displayName: "Maria",
      level: 3,
      xp: 250
    };
    this.users.set(user.id, user);
    
    // Create lessons
    const basicGreetings: Lesson = {
      id: this.currentLessonId++,
      title: "Basic Greetings",
      description: "Learn essential greetings to start conversations in Portuguese.",
      imageUrl: "",
      duration: 10,
      order: 1,
      wordCount: 6,
      status: "in_progress"
    };
    this.lessons.set(basicGreetings.id, basicGreetings);
    
    const orderingFood: Lesson = {
      id: this.currentLessonId++,
      title: "Ordering Food",
      description: "Learn vocabulary for restaurants and cafes",
      imageUrl: "",
      duration: 15,
      order: 2,
      wordCount: 15,
      status: "available"
    };
    this.lessons.set(orderingFood.id, orderingFood);
    
    const gettingAround: Lesson = {
      id: this.currentLessonId++,
      title: "Getting Around",
      description: "Transportation and directions vocabulary",
      imageUrl: "",
      duration: 12,
      order: 3,
      wordCount: 12,
      status: "available"
    };
    this.lessons.set(gettingAround.id, gettingAround);
    
    const shopping: Lesson = {
      id: this.currentLessonId++,
      title: "Shopping",
      description: "Essential vocabulary for shopping",
      imageUrl: "",
      duration: 15,
      order: 4,
      wordCount: 18,
      status: "available"
    };
    this.lessons.set(shopping.id, shopping);
    
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
    
    greetingsVocabulary.forEach(vocab => {
      const vocabulary: Vocabulary = {
        id: this.currentVocabularyId++,
        lessonId: basicGreetings.id,
        portuguese: vocab.portuguese,
        english: vocab.english,
        imageUrl: "",
        audioUrl: `/api/audio/${vocab.portuguese.toLowerCase().replace(/ /g, '_')}`,
        pronunciation: vocab.pronunciation,
        usage: vocab.usage
      };
      this.vocabularies.set(vocabulary.id, vocabulary);
    });
    
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
    
    greetingsQuizQuestions.forEach(q => {
      const question: QuizQuestion = {
        id: this.currentQuizQuestionId++,
        lessonId: basicGreetings.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      };
      this.quizQuestions.set(question.id, question);
      
      // Create options for each question
      q.options.forEach(opt => {
        const option: QuizOption = {
          id: this.currentQuizOptionId++,
          questionId: question.id,
          option: opt,
          isCorrect: opt === q.correctAnswer
        };
        this.quizOptions.set(option.id, option);
      });
    });
    
    // Create user progress
    const progress: UserProgress = {
      id: this.currentUserProgressId++,
      userId: user.id,
      lessonId: basicGreetings.id,
      completed: false,
      score: null,
      completedAt: null
    };
    this.userProgress.set(progress.id, progress);
  }
}

export const storage = new MemStorage();
