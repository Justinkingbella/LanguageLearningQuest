
import { db } from './server/db';
import { lessons, vocabulary, quizQuestions, quizOptions } from './shared/schema';

async function main() {
  try {
    // Basic Level Lessons
    const [alphabet] = await db.insert(lessons).values({
      title: "The Portuguese Alphabet",
      description: "Learn letters, pronunciation, and basic sounds",
      imageUrl: "/lessons/alphabet.png",
      duration: 20,
      order: 1,
      wordCount: 26,
      status: "available"
    }).returning();

    const [numbers] = await db.insert(lessons).values({
      title: "Numbers & Dates",
      description: "Master numbers, dates, and time expressions",
      imageUrl: "/lessons/numbers.png",
      duration: 25,
      order: 2,
      wordCount: 50,
      status: "available"
    }).returning();

    const [basicGrammar] = await db.insert(lessons).values({
      title: "Basic Grammar",
      description: "Essential grammar concepts for beginners",
      imageUrl: "/lessons/grammar.png",
      duration: 30,
      order: 3,
      wordCount: 40,
      status: "available"
    }).returning();

    // Beginner Level Lessons
    const [introductions] = await db.insert(lessons).values({
      title: "Introducing Yourself",
      description: "Learn to introduce yourself and greet others",
      imageUrl: "/lessons/intro.png",
      duration: 20,
      order: 4,
      wordCount: 30,
      status: "available"
    }).returning();

    const [family] = await db.insert(lessons).values({
      title: "Family & Relationships",
      description: "Vocabulary for family members and relationships",
      imageUrl: "/lessons/family.png",
      duration: 25,
      order: 5,
      wordCount: 35,
      status: "available"
    }).returning();

    const [hobbies] = await db.insert(lessons).values({
      title: "Hobbies & Interests",
      description: "Express your interests and activities",
      imageUrl: "/lessons/hobbies.png",
      duration: 25,
      order: 6,
      wordCount: 40,
      status: "locked"
    }).returning();

    // Intermediate Level Lessons
    const [descriptions] = await db.insert(lessons).values({
      title: "Describing People & Places",
      description: "Learn to describe appearances and locations",
      imageUrl: "/lessons/descriptions.png",
      duration: 30,
      order: 7,
      wordCount: 45,
      status: "locked"
    }).returning();

    const [weather] = await db.insert(lessons).values({
      title: "Weather & Seasons",
      description: "Discuss weather and seasonal activities",
      imageUrl: "/lessons/weather.png",
      duration: 25,
      order: 8,
      wordCount: 35,
      status: "locked"
    }).returning();

    const [health] = await db.insert(lessons).values({
      title: "Health & Wellness",
      description: "Vocabulary for health and medical situations",
      imageUrl: "/lessons/health.png",
      duration: 30,
      order: 9,
      wordCount: 50,
      status: "locked"
    }).returning();

    const [shopping] = await db.insert(lessons).values({
      title: "Shopping",
      description: "Essential shopping and commerce vocabulary",
      imageUrl: "/lessons/shopping.png",
      duration: 25,
      order: 10,
      wordCount: 40,
      status: "locked"
    }).returning();

    const [housing] = await db.insert(lessons).values({
      title: "Home & Housing",
      description: "Vocabulary for home and accommodation",
      imageUrl: "/lessons/housing.png",
      duration: 30,
      order: 11,
      wordCount: 45,
      status: "locked"
    }).returning();

    // Advanced Level Lessons
    const [banking] = await db.insert(lessons).values({
      title: "Money & Banking",
      description: "Financial vocabulary and transactions",
      imageUrl: "/lessons/banking.png",
      duration: 35,
      order: 12,
      wordCount: 50,
      status: "locked"
    }).returning();

    const [travel] = await db.insert(lessons).values({
      title: "Travel & Accommodations",
      description: "Essential travel vocabulary and phrases",
      imageUrl: "/lessons/travel.png",
      duration: 35,
      order: 13,
      wordCount: 55,
      status: "locked"
    }).returning();

    const [countries] = await db.insert(lessons).values({
      title: "Portuguese-Speaking Countries",
      description: "Culture and customs of Lusophone nations",
      imageUrl: "/lessons/countries.png",
      duration: 40,
      order: 14,
      wordCount: 60,
      status: "locked"
    }).returning();

    const [music] = await db.insert(lessons).values({
      title: "Music & Festivals",
      description: "Cultural celebrations and musical terms",
      imageUrl: "/lessons/music.png",
      duration: 35,
      order: 15,
      wordCount: 45,
      status: "locked"
    }).returning();

    const [food] = await db.insert(lessons).values({
      title: "Traditional Food & Drinks",
      description: "Culinary vocabulary and dining customs",
      imageUrl: "/lessons/food.png",
      duration: 30,
      order: 16,
      wordCount: 50,
      status: "locked"
    }).returning();

    const [work] = await db.insert(lessons).values({
      title: "Work & Professional Settings",
      description: "Business and workplace communication",
      imageUrl: "/lessons/work.png",
      duration: 40,
      order: 17,
      wordCount: 60,
      status: "locked"
    }).returning();

    const [opinions] = await db.insert(lessons).values({
      title: "Expressing Opinions",
      description: "Advanced conversation and debate skills",
      imageUrl: "/lessons/opinions.png",
      duration: 35,
      order: 18,
      wordCount: 45,
      status: "locked"
    }).returning();

    // Expert Level Lessons
    const [advancedConv] = await db.insert(lessons).values({
      title: "Advanced Conversations",
      description: "Complex dialogues and discussions",
      imageUrl: "/lessons/advanced.png",
      duration: 45,
      order: 19,
      wordCount: 70,
      status: "locked"
    }).returning();

    const [formalWriting] = await db.insert(lessons).values({
      title: "Formal Reading & Writing",
      description: "Academic and professional writing skills",
      imageUrl: "/lessons/formal.png",
      duration: 50,
      order: 20,
      wordCount: 80,
      status: "locked"
    }).returning();

    const [idioms] = await db.insert(lessons).values({
      title: "Idioms & Slang",
      description: "Colloquial expressions and casual speech",
      imageUrl: "/lessons/idioms.png",
      duration: 40,
      order: 21,
      wordCount: 65,
      status: "locked"
    }).returning();

    console.log("Successfully added all lessons!");
  } catch (error) {
    console.error("Error seeding lessons:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
