import { db } from './server/db';
import { conversationScenarios, conversationDialogues, userConversationPractice, users } from './shared/schema';

async function main() {
  try {
    // Check for existing user
    const [user] = await db.select().from(users).where(users => users.username === 'demo').limit(1);
    
    if (!user) {
      console.error('Demo user not found');
      return;
    }

    // Add Business Meeting scenario
    const [businessMeetingScenario] = await db.insert(conversationScenarios).values({
      lessonId: 20, // Work & Professional Settings
      title: "Business Meeting",
      description: "Practice participating in a business meeting in Portuguese",
      context: "You're attending a team meeting at a Brazilian company. Practice discussing projects and deadlines with colleagues.",
      imageUrl: "",
      difficulty: "intermediate",
      category: "professional"
    }).returning();
    
    console.log("Created Business Meeting scenario:", businessMeetingScenario);
    
    // Add conversation dialogue for Business Meeting
    const businessMeetingDialogues = [
      {
        speakerRole: "native_speaker",
        portuguese: "Bom dia a todos. Vamos começar a reunião. Primeiro, vamos falar sobre o projeto atual.",
        english: "Good morning everyone. Let's start the meeting. First, let's talk about the current project.",
        order: 1,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Bom dia. Tenho uma atualização sobre o projeto. Estamos progredindo bem, mas precisamos de mais tempo para a fase de testes.",
        english: "Good morning. I have an update about the project. We're progressing well, but we need more time for the testing phase.",
        order: 2,
        hints: JSON.stringify(["Give a project update", "Mention you need more time", "Talk about testing"]),
        acceptedResponses: JSON.stringify(["Bom dia", "Atualização", "Projeto", "Precisamos de mais tempo", "Fase de testes"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Entendo. Quanto tempo a mais você precisa para completar os testes?",
        english: "I understand. How much more time do you need to complete the tests?",
        order: 3,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Acredito que precisamos de mais duas semanas para garantir a qualidade do produto final.",
        english: "I believe we need two more weeks to ensure the quality of the final product.",
        order: 4,
        hints: JSON.stringify(["Specify how much time", "Mention quality", "Be professional"]),
        acceptedResponses: JSON.stringify(["Duas semanas", "Mais duas semanas", "Garantir a qualidade", "Produto final"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Certo. E como está o orçamento do projeto? Ainda estamos dentro do planejado?",
        english: "Okay. And how is the project budget? Are we still within what was planned?",
        order: 5,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Sim, estamos dentro do orçamento. Não prevejo custos adicionais para a extensão do prazo de testes.",
        english: "Yes, we are within budget. I don't foresee additional costs for extending the testing deadline.",
        order: 6,
        hints: JSON.stringify(["Mention budget status", "Talk about costs", "Be reassuring"]),
        acceptedResponses: JSON.stringify(["Sim", "Dentro do orçamento", "Não prevejo custos adicionais", "Extensão do prazo"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Excelente. Vamos agendar uma nova reunião para a próxima semana para revisar o progresso?",
        english: "Excellent. Shall we schedule a new meeting for next week to review progress?",
        order: 7,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Sim, podemos agendar para quarta-feira às 10h. Até lá, terei mais dados sobre os testes.",
        english: "Yes, we can schedule it for Wednesday at 10am. By then, I'll have more data on the testing.",
        order: 8,
        hints: JSON.stringify(["Agree to meeting", "Suggest time", "Mention you'll have updates"]),
        acceptedResponses: JSON.stringify(["Sim", "Quarta-feira", "10h", "Mais dados", "Testes"])
      }
    ];
    
    for (const dialogue of businessMeetingDialogues) {
      await db.insert(conversationDialogues).values({
        scenarioId: businessMeetingScenario.id,
        speakerRole: dialogue.speakerRole,
        portuguese: dialogue.portuguese,
        english: dialogue.english,
        audioUrl: dialogue.speakerRole === "native_speaker" ? `/api/audio/${dialogue.portuguese.toLowerCase().replace(/ /g, '_')}` : null,
        order: dialogue.order,
        hints: dialogue.hints,
        acceptedResponses: dialogue.acceptedResponses
      });
    }
    
    console.log("Added dialogues for Business Meeting scenario");
    
    // Add Job Interview scenario
    const [jobInterviewScenario] = await db.insert(conversationScenarios).values({
      lessonId: 22, // Advanced Conversations
      title: "Job Interview",
      description: "Practice for a job interview in Portuguese",
      context: "You have an interview for a position at a Brazilian tech company. Practice answering common interview questions in Portuguese.",
      imageUrl: "",
      difficulty: "advanced",
      category: "professional"
    }).returning();
    
    console.log("Created Job Interview scenario:", jobInterviewScenario);
    
    // Add conversation dialogue for Job Interview
    const jobInterviewDialogues = [
      {
        speakerRole: "native_speaker",
        portuguese: "Bom dia! Obrigado por vir à entrevista hoje. Você poderia se apresentar e falar um pouco sobre sua experiência?",
        english: "Good morning! Thank you for coming to the interview today. Could you introduce yourself and tell me a bit about your experience?",
        order: 1,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Bom dia! Meu nome é [seu nome] e tenho experiência de cinco anos como desenvolvedor de software. Já trabalhei em várias empresas de tecnologia e tenho habilidades em JavaScript, Python e desenvolvimento web.",
        english: "Good morning! My name is [your name] and I have five years of experience as a software developer. I've worked at several tech companies and have skills in JavaScript, Python, and web development.",
        order: 2,
        hints: JSON.stringify(["Introduce yourself", "Mention your work experience", "Talk about your skills"]),
        acceptedResponses: JSON.stringify(["Bom dia", "Meu nome é", "Tenho experiência", "Trabalhei em", "habilidades em"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Excelente. E por que você está interessado em trabalhar na nossa empresa?",
        english: "Excellent. And why are you interested in working at our company?",
        order: 3,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Estou interessado na sua empresa porque admiro os produtos inovadores que vocês desenvolvem e gostaria de fazer parte de uma equipe dinâmica que está criando soluções tecnológicas importantes.",
        english: "I'm interested in your company because I admire the innovative products you develop and would like to be part of a dynamic team that is creating important technological solutions.",
        order: 4,
        hints: JSON.stringify(["Explain why you're interested", "Mention their products", "Talk about the team"]),
        acceptedResponses: JSON.stringify(["Estou interessado", "Admiro", "Produtos inovadores", "Fazer parte", "Equipe dinâmica"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Ótimo. Como você lidaria com prazos apertados e múltiplos projetos ao mesmo tempo?",
        english: "Great. How would you handle tight deadlines and multiple projects at the same time?",
        order: 5,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Para lidar com prazos apertados, eu priorizo tarefas, organizo meu tempo eficientemente e me comunico regularmente com a equipe. Também uso ferramentas de gerenciamento de projetos para manter tudo organizado.",
        english: "To handle tight deadlines, I prioritize tasks, organize my time efficiently, and communicate regularly with the team. I also use project management tools to keep everything organized.",
        order: 6,
        hints: JSON.stringify(["Talk about prioritizing tasks", "Mention time management", "Discuss communication"]),
        acceptedResponses: JSON.stringify(["Priorizo tarefas", "Organizo meu tempo", "Me comunico", "Gerenciamento de projetos"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Você tem alguma experiência com trabalho remoto ou em equipes internacionais?",
        english: "Do you have any experience working remotely or with international teams?",
        order: 7,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Sim, tenho experiência trabalhando remotamente nos últimos dois anos e colaborei com equipes em diferentes fusos horários. Aprendi a ser flexível com horários de reuniões e a manter uma comunicação clara via ferramentas digitais.",
        english: "Yes, I have experience working remotely for the last two years and I've collaborated with teams in different time zones. I've learned to be flexible with meeting times and maintain clear communication via digital tools.",
        order: 8,
        hints: JSON.stringify(["Mention remote work experience", "Talk about international collaboration", "Discuss communication tools"]),
        acceptedResponses: JSON.stringify(["Sim tenho experiência", "Trabalhando remotamente", "Diferentes fusos horários", "Flexível", "Comunicação clara"])
      },
      {
        speakerRole: "native_speaker",
        portuguese: "Quais são suas expectativas salariais e quando você poderia começar?",
        english: "What are your salary expectations and when could you start?",
        order: 9,
        hints: JSON.stringify([]),
        acceptedResponses: JSON.stringify([])
      },
      {
        speakerRole: "user",
        portuguese: "Minhas expectativas salariais estão alinhadas com o mercado para minha experiência, mas estou aberto a negociações. Poderia começar a trabalhar em duas semanas, após finalizar meus compromissos atuais.",
        english: "My salary expectations are in line with the market for my experience, but I'm open to negotiation. I could start working in two weeks, after finalizing my current commitments.",
        order: 10,
        hints: JSON.stringify(["Discuss salary expectations", "Mention when you can start", "Be professional"]),
        acceptedResponses: JSON.stringify(["Expectativas salariais", "Alinhadas com o mercado", "Aberto a negociações", "Começar em duas semanas"])
      }
    ];
    
    for (const dialogue of jobInterviewDialogues) {
      await db.insert(conversationDialogues).values({
        scenarioId: jobInterviewScenario.id,
        speakerRole: dialogue.speakerRole,
        portuguese: dialogue.portuguese,
        english: dialogue.english,
        audioUrl: dialogue.speakerRole === "native_speaker" ? `/api/audio/${dialogue.portuguese.toLowerCase().replace(/ /g, '_')}` : null,
        order: dialogue.order,
        hints: dialogue.hints,
        acceptedResponses: dialogue.acceptedResponses
      });
    }
    
    console.log("Added dialogues for Job Interview scenario");
    
    // Add user conversation practice records
    await db.insert(userConversationPractice).values({
      userId: user.id,
      scenarioId: businessMeetingScenario.id,
      completed: false,
      accuracy: null,
      completedAt: null
    });
    
    await db.insert(userConversationPractice).values({
      userId: user.id,
      scenarioId: jobInterviewScenario.id,
      completed: false,
      accuracy: null,
      completedAt: null
    });
    
    console.log("Added user conversation practice records");
    console.log("Successfully added new conversation scenarios!");
  } catch (error) {
    console.error("Error adding scenarios:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });