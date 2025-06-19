import { AIResponse } from '../types';

// Simulated AI therapist responses - in production, this would connect to OpenAI/Claude
const therapistPersonality = {
  empathetic: [
    "I can hear that this is really difficult for you. It takes courage to share these feelings.",
    "Your feelings are completely valid. Many people struggle with similar experiences.",
    "I'm here to support you through this. You're not alone in feeling this way.",
  ],
  encouraging: [
    "You've shown incredible strength by taking this step to seek help.",
    "Every small step forward is progress worth celebrating.",
    "You have more resilience than you realize. Let's build on that together.",
  ],
  curious: [
    "Can you tell me more about when you first noticed these feelings?",
    "What does a typical day look like for you when you're feeling this way?",
    "Have you noticed any patterns in what triggers these emotions?",
  ],
  supportive: [
    "You're doing important work by being here and engaging in this process.",
    "Healing isn't linear, and that's perfectly okay. We'll take this one day at a time.",
    "Your willingness to explore these feelings shows real commitment to your wellbeing.",
  ],
};

const followUpQuestions = [
  "How has this been affecting your daily life?",
  "When do you feel most/least anxious during the day?",
  "What coping strategies have you tried before?",
  "Who in your life provides the most support?",
  "What would feeling better look like to you?",
  "How long have you been experiencing these feelings?",
  "What activities used to bring you joy?",
  "How is your sleep and appetite lately?",
];

const recommendations = [
  "Practice deep breathing exercises for 5 minutes daily",
  "Keep a mood journal to track patterns",
  "Try progressive muscle relaxation before bed",
  "Schedule one pleasant activity each day",
  "Connect with a supportive friend or family member",
  "Take a short walk in nature when feeling overwhelmed",
  "Practice mindfulness meditation for 10 minutes",
  "Establish a consistent sleep routine",
];

export const generateAIResponse = async (userMessage: string, sessionHistory: string[] = []): Promise<AIResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Simple keyword-based response generation (in production, use proper AI)
  const keywords = userMessage.toLowerCase();
  let emotion: AIResponse['emotion'] = 'supportive';
  let responsePool = therapistPersonality.supportive;

  if (keywords.includes('sad') || keywords.includes('depressed') || keywords.includes('down')) {
    emotion = 'empathetic';
    responsePool = therapistPersonality.empathetic;
  } else if (keywords.includes('anxious') || keywords.includes('worried') || keywords.includes('stress')) {
    emotion = 'curious';
    responsePool = therapistPersonality.curious;
  } else if (keywords.includes('better') || keywords.includes('good') || keywords.includes('progress')) {
    emotion = 'encouraging';
    responsePool = therapistPersonality.encouraging;
  }

  const message = responsePool[Math.floor(Math.random() * responsePool.length)];
  const selectedQuestions = followUpQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  const selectedRecommendations = recommendations
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  return {
    message,
    emotion,
    followUpQuestions: selectedQuestions,
    recommendations: selectedRecommendations,
  };
};

export const generateTherapyTasks = (mood: number, goals: string[] = []): any[] => {
  const allTasks = [
    {
      title: "Morning Gratitude Practice",
      description: "Write down 3 things you're grateful for each morning",
      category: "mindfulness",
      difficulty: "easy",
      estimated_duration: 5,
    },
    {
      title: "Breathing Exercise",
      description: "Practice 4-7-8 breathing technique for anxiety relief",
      category: "mindfulness",
      difficulty: "easy",
      estimated_duration: 10,
    },
    {
      title: "Daily Walk",
      description: "Take a 15-minute walk in nature or around your neighborhood",
      category: "exercise",
      difficulty: "easy",
      estimated_duration: 15,
    },
    {
      title: "Emotion Journaling",
      description: "Write about your emotions and what triggered them today",
      category: "journaling",
      difficulty: "medium",
      estimated_duration: 20,
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Practice tensing and relaxing muscle groups for deep relaxation",
      category: "mindfulness",
      difficulty: "medium",
      estimated_duration: 25,
    },
    {
      title: "Social Connection",
      description: "Reach out to a friend or family member for meaningful conversation",
      category: "social",
      difficulty: "medium",
      estimated_duration: 30,
    },
  ];

  // Filter based on mood and goals
  return allTasks.slice(0, 4).map(task => ({
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    due_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};