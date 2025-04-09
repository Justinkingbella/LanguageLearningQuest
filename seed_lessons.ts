
import { db } from './server/db';
import { lessons, vocabulary, quizQuestions, quizOptions, conversationScenarios, conversationDialogues } from './shared/schema';

async function main() {
  try {
    // Add Basic Greetings lesson
    const [basicGreetings] = await db.insert(lessons).values({
      title: "Basic Greetings",
      description: "Learn essential Portuguese greetings and introductions",
      imageUrl: "",
      duration: 15,
      order: 1,
      wordCount: 12,
      status: "available"
    }).returning();

    // Add Common Phrases lesson
    const [commonPhrases] = await db.insert(lessons).values({
      title: "Common Phrases",
      description: "Essential everyday Portuguese expressions",
      imageUrl: "",
      duration: 20,
      order: 2,
      wordCount: 15,
      status: "available"
    }).returning();

    // Add Restaurant Conversations lesson
    const [restaurantLesson] = await db.insert(lessons).values({
      title: "Restaurant Conversations",
      description: "Learn how to order food and interact at restaurants",
      imageUrl: "",
      duration: 25,
      order: 3,
      wordCount: 20,
      status: "available"
    }).returning();

    // Add vocabulary for Basic Greetings
    const greetingsVocab = [
      {
        lessonId: basicGreetings.id,
        portuguese: "Bom dia",
        english: "Good morning",
        pronunciation: "bohn DEE-ah",
        usage: "Morning greeting"
      },
      {
        lessonId: basicGreetings.id,
        portuguese: "Boa tarde",
        english: "Good afternoon",
        pronunciation: "BOH-ah TAR-jay",
        usage: "Afternoon greeting"
      }
    ];

    for (const vocab of greetingsVocab) {
      await db.insert(vocabulary).values(vocab);
    }

    // Add conversation scenarios
    const [cafeScenario] = await db.insert(conversationScenarios).values({
      lessonId: basicGreetings.id,
      title: "At the Café",
      description: "Practice ordering at a café",
      context: "You're at a café and want to order coffee",
      imageUrl: "",
      difficulty: "beginner",
      category: "dining"
    }).returning();

    // Add dialogues
    const cafeDialogues = [
      {
        scenarioId: cafeScenario.id,
        speakerRole: "native_speaker",
        portuguese: "Bom dia! O que você gostaria?",
        english: "Good morning! What would you like?",
        order: 1,
        hints: JSON.stringify(["Greet back", "Order coffee"]),
        acceptedResponses: JSON.stringify(["Bom dia", "Um café, por favor"])
      },
      {
        scenarioId: cafeScenario.id,
        speakerRole: "user",
        portuguese: "Bom dia! Um café, por favor.",
        english: "Good morning! A coffee, please.",
        order: 2,
        hints: JSON.stringify(["Say good morning", "Order politely"]),
        acceptedResponses: JSON.stringify(["Bom dia", "Café por favor"])
      }
    ];

    for (const dialogue of cafeDialogues) {
      await db.insert(conversationDialogues).values(dialogue);
    }

    console.log("Successfully added lessons and conversations!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
