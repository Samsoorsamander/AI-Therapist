// Enhanced AI Service with multiple model support and advanced features
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Multiple AI model endpoints for redundancy
const AI_ENDPOINTS = {
  huggingface: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
  huggingface_alt: "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
  openai: "https://api.openai.com/v1/chat/completions"
};

interface AIResponse {
  message: string;
  emotion: 'empathetic' | 'encouraging' | 'curious' | 'supportive' | 'celebratory' | 'calming';
  followUpQuestions?: string[];
  recommendations?: string[];
  confidence?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const therapistPrompts = {
  system: `You are Dr. Sarah, a compassionate and experienced AI therapist with expertise in cognitive behavioral therapy, mindfulness, and emotional wellness. Your responses should be:

- Warm, empathetic, and professionally supportive
- Tailored to the user's emotional state and needs
- Include practical coping strategies when appropriate
- Ask thoughtful follow-up questions to encourage reflection
- Maintain appropriate therapeutic boundaries
- Use person-first language and avoid medical diagnoses
- Encourage professional help when needed

Always respond with genuine care and understanding, as if you're speaking to a close friend who trusts you with their deepest concerns.`,
  
  empathetic: [
    "I can really hear the pain in your words, and I want you to know that what you're feeling is completely valid. It takes tremendous courage to share something so personal.",
    "Your feelings matter deeply, and I'm honored that you've trusted me with them. Many people struggle with similar experiences, and you're not alone in this journey.",
    "I can sense how difficult this must be for you right now. Please know that I'm here to support you through this, and there's no judgment here - only understanding and care."
  ],
  
  encouraging: [
    "I'm genuinely impressed by your strength in reaching out and working on yourself. That takes real courage, and it shows how committed you are to your wellbeing.",
    "Every step you're taking, no matter how small it might seem, is meaningful progress. You're building resilience and self-awareness that will serve you well.",
    "You have more inner strength than you might realize right now. I've seen how you've handled challenges before, and I believe in your ability to navigate this too."
  ],
  
  curious: [
    "I'm curious to learn more about your experience. Can you help me understand what this feels like for you day to day?",
    "That's really insightful. I wonder if you've noticed any patterns in when these feelings tend to be stronger or lighter?",
    "Thank you for sharing that with me. I'm wondering what your inner voice tells you during these moments?"
  ],
  
  supportive: [
    "You're doing incredibly important work by being here and engaging in this process. Healing takes time, and you're exactly where you need to be right now.",
    "I want you to know that it's completely okay to have difficult days. Healing isn't linear, and every emotion you're experiencing is part of your journey.",
    "Your willingness to explore these feelings and work on yourself shows real wisdom and self-compassion. That's something to be proud of."
  ],

  celebratory: [
    "This is such wonderful progress! I can hear the positive changes in how you're approaching this situation. You should feel proud of how far you've come.",
    "What an amazing breakthrough! It sounds like you're really connecting with your inner wisdom and strength. This is exactly the kind of growth that leads to lasting change.",
    "I'm so excited to hear about this positive shift! You're developing such valuable skills and insights that will continue to serve you well."
  ],

  calming: [
    "Let's take a moment to breathe together. You're safe right now, and we can work through this step by step. There's no rush - we have all the time you need.",
    "I can sense you might be feeling overwhelmed, and that's completely understandable. Let's ground ourselves in this moment and remember that you have the strength to handle this.",
    "It's okay to feel anxious or uncertain. These feelings are temporary, and we can find ways to help you feel more centered and peaceful."
  ]
};

const advancedRecommendations = {
  anxiety: [
    "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
    "Practice box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4",
    "Use progressive muscle relaxation starting from your toes and working up",
    "Create a 'worry window' - set aside 15 minutes daily to process anxious thoughts",
    "Try the STOP technique: Stop, Take a breath, Observe your thoughts, Proceed mindfully"
  ],
  depression: [
    "Start with one small, achievable task each day to build momentum",
    "Practice gratitude by writing down 3 specific things you're thankful for",
    "Engage in gentle movement like a 10-minute walk or stretching",
    "Connect with one person today, even if it's just a text message",
    "Create a self-care routine with activities that bring you comfort"
  ],
  stress: [
    "Practice the 'RAIN' technique: Recognize, Allow, Investigate, Non-attachment",
    "Try time-blocking to create structure and reduce overwhelm",
    "Use the Pomodoro technique: 25 minutes focused work, 5-minute break",
    "Practice saying 'no' to non-essential commitments this week",
    "Create a calming bedtime routine to improve sleep quality"
  ],
  general: [
    "Keep a mood journal to identify patterns and triggers",
    "Practice mindful eating by focusing on taste, texture, and gratitude",
    "Try a new creative activity like drawing, writing, or music",
    "Spend time in nature, even if it's just sitting by a window",
    "Practice loving-kindness meditation for yourself and others"
  ]
};

export const generateAIResponse = async (userMessage: string, conversationHistory: string[] = []): Promise<AIResponse> => {
  try {
    // Analyze user input for emotional context
    const emotionalContext = analyzeEmotionalContext(userMessage);
    const sentiment = analyzeSentiment(userMessage);
    
    // Try OpenAI first if available
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key') {
      try {
        const response = await callOpenAI(userMessage, conversationHistory, emotionalContext);
        return response;
      } catch (error) {
        console.log('OpenAI failed, trying Hugging Face...');
      }
    }

    // Try Hugging Face models
    if (HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY !== 'your_huggingface_api_key') {
      try {
        const response = await callHuggingFace(userMessage, conversationHistory, emotionalContext);
        return response;
      } catch (error) {
        console.log('Hugging Face failed, using local responses...');
      }
    }

    // Fallback to enhanced local responses
    return generateEnhancedLocalResponse(userMessage, emotionalContext, sentiment);
  } catch (error) {
    console.error('AI Service Error:', error);
    return generateEnhancedLocalResponse(userMessage, 'supportive', 'neutral');
  }
};

const callOpenAI = async (userMessage: string, history: string[], context: string): Promise<AIResponse> => {
  const messages = [
    { role: "system", content: therapistPrompts.system },
    ...history.map((msg, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: msg
    })),
    { role: "user", content: userMessage }
  ];

  const response = await fetch(AI_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    }),
  });

  if (!response.ok) throw new Error('OpenAI API failed');

  const data = await response.json();
  const aiMessage = data.choices[0]?.message?.content || "I'm here to listen and support you.";

  return {
    message: aiMessage,
    emotion: determineEmotion(userMessage, context),
    followUpQuestions: generateContextualQuestions(userMessage, context),
    recommendations: generateContextualRecommendations(userMessage, context),
    confidence: 0.9,
    sentiment: analyzeSentiment(userMessage)
  };
};

const callHuggingFace = async (userMessage: string, history: string[], context: string): Promise<AIResponse> => {
  const response = await fetch(AI_ENDPOINTS.huggingface, {
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      inputs: {
        past_user_inputs: history.filter((_, i) => i % 2 === 0),
        generated_responses: history.filter((_, i) => i % 2 === 1),
        text: userMessage
      },
      parameters: {
        max_length: 150,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.2
      }
    }),
  });

  if (!response.ok) throw new Error('Hugging Face API failed');

  const result = await response.json();
  const aiMessage = result.generated_text || result.response || "I understand you're going through something difficult. Can you tell me more about how you're feeling?";

  return {
    message: aiMessage,
    emotion: determineEmotion(userMessage, context),
    followUpQuestions: generateContextualQuestions(userMessage, context),
    recommendations: generateContextualRecommendations(userMessage, context),
    confidence: 0.8,
    sentiment: analyzeSentiment(userMessage)
  };
};

const generateEnhancedLocalResponse = (userMessage: string, context: string, sentiment: string): AIResponse => {
  const emotion = determineEmotion(userMessage, context);
  const responsePool = therapistPrompts[emotion] || therapistPrompts.supportive;
  
  // Select response based on context and sentiment
  let selectedResponse;
  if (sentiment === 'positive' && emotion !== 'celebratory') {
    selectedResponse = therapistPrompts.encouraging[Math.floor(Math.random() * therapistPrompts.encouraging.length)];
  } else {
    selectedResponse = responsePool[Math.floor(Math.random() * responsePool.length)];
  }

  return {
    message: selectedResponse,
    emotion,
    followUpQuestions: generateContextualQuestions(userMessage, context),
    recommendations: generateContextualRecommendations(userMessage, context),
    confidence: 0.7,
    sentiment: sentiment as any
  };
};

const analyzeEmotionalContext = (message: string): string => {
  const keywords = message.toLowerCase();
  
  if (keywords.includes('panic') || keywords.includes('overwhelmed') || keywords.includes('can\'t breathe')) {
    return 'crisis';
  }
  if (keywords.includes('better') || keywords.includes('good') || keywords.includes('progress') || keywords.includes('happy')) {
    return 'positive';
  }
  if (keywords.includes('anxious') || keywords.includes('worried') || keywords.includes('nervous')) {
    return 'anxiety';
  }
  if (keywords.includes('sad') || keywords.includes('depressed') || keywords.includes('hopeless')) {
    return 'depression';
  }
  if (keywords.includes('angry') || keywords.includes('frustrated') || keywords.includes('mad')) {
    return 'anger';
  }
  if (keywords.includes('stressed') || keywords.includes('pressure') || keywords.includes('busy')) {
    return 'stress';
  }
  
  return 'general';
};

const analyzeSentiment = (message: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['good', 'better', 'happy', 'great', 'wonderful', 'amazing', 'progress', 'improvement'];
  const negativeWords = ['bad', 'worse', 'sad', 'terrible', 'awful', 'horrible', 'difficult', 'struggling'];
  
  const words = message.toLowerCase().split(' ');
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

const determineEmotion = (message: string, context: string): AIResponse['emotion'] => {
  if (context === 'crisis') return 'calming';
  if (context === 'positive') return 'celebratory';
  if (context === 'anxiety') return 'calming';
  if (context === 'depression') return 'empathetic';
  if (context === 'anger') return 'supportive';
  
  const keywords = message.toLowerCase();
  if (keywords.includes('better') || keywords.includes('progress')) return 'encouraging';
  if (keywords.includes('sad') || keywords.includes('hurt')) return 'empathetic';
  if (keywords.includes('why') || keywords.includes('how') || keywords.includes('what')) return 'curious';
  
  return 'supportive';
};

const generateContextualQuestions = (message: string, context: string): string[] => {
  const questionSets = {
    anxiety: [
      "What physical sensations do you notice when you feel anxious?",
      "Are there specific situations that tend to trigger these feelings?",
      "What has helped you feel calmer in the past?"
    ],
    depression: [
      "How has your energy level been lately?",
      "What activities used to bring you joy?",
      "How are you taking care of your basic needs like sleep and nutrition?"
    ],
    stress: [
      "What's feeling most overwhelming right now?",
      "How are you currently managing your daily responsibilities?",
      "What would help you feel more in control?"
    ],
    positive: [
      "What do you think contributed to this positive change?",
      "How can we build on this progress?",
      "What would you like to focus on next?"
    ],
    general: [
      "How has this been affecting your daily life?",
      "What support do you have available to you?",
      "What would feeling better look like for you?"
    ]
  };
  
  const questions = questionSets[context as keyof typeof questionSets] || questionSets.general;
  return questions.sort(() => 0.5 - Math.random()).slice(0, 2);
};

const generateContextualRecommendations = (message: string, context: string): string[] => {
  const recommendations = advancedRecommendations[context as keyof typeof advancedRecommendations] || advancedRecommendations.general;
  return recommendations.sort(() => 0.5 - Math.random()).slice(0, 3);
};

// Enhanced therapy task generation with personalization
export const generateTherapyTasks = (mood: number, goals: string[] = [], userPreferences: any = {}): any[] => {
  const allTasks = [
    {
      title: "Morning Gratitude Practice",
      description: "Write down 3 specific things you're grateful for and why they matter to you",
      category: "mindfulness",
      difficulty: "easy",
      estimated_duration: 5,
      benefits: ["Improves mood", "Increases positivity", "Builds resilience"]
    },
    {
      title: "Breathing Exercise",
      description: "Practice 4-7-8 breathing technique for anxiety relief and relaxation",
      category: "mindfulness",
      difficulty: "easy",
      estimated_duration: 10,
      benefits: ["Reduces anxiety", "Improves focus", "Calms nervous system"]
    },
    {
      title: "Nature Walk",
      description: "Take a mindful 20-minute walk outdoors, focusing on your senses",
      category: "exercise",
      difficulty: "easy",
      estimated_duration: 20,
      benefits: ["Boosts mood", "Increases energy", "Reduces stress"]
    },
    {
      title: "Emotion Journaling",
      description: "Write about your emotions today and what might have triggered them",
      category: "journaling",
      difficulty: "medium",
      estimated_duration: 15,
      benefits: ["Increases self-awareness", "Processes emotions", "Identifies patterns"]
    },
    {
      title: "Progressive Muscle Relaxation",
      description: "Practice tensing and relaxing muscle groups for deep physical relaxation",
      category: "mindfulness",
      difficulty: "medium",
      estimated_duration: 25,
      benefits: ["Reduces physical tension", "Improves sleep", "Decreases anxiety"]
    },
    {
      title: "Social Connection",
      description: "Reach out to a friend or family member for meaningful conversation",
      category: "social",
      difficulty: "medium",
      estimated_duration: 30,
      benefits: ["Builds support network", "Reduces isolation", "Improves mood"]
    },
    {
      title: "Self-Compassion Exercise",
      description: "Practice speaking to yourself with the same kindness you'd show a good friend",
      category: "self-care",
      difficulty: "medium",
      estimated_duration: 10,
      benefits: ["Reduces self-criticism", "Builds resilience", "Improves self-esteem"]
    },
    {
      title: "Mindful Eating",
      description: "Eat one meal today slowly and mindfully, focusing on taste and texture",
      category: "mindfulness",
      difficulty: "easy",
      estimated_duration: 20,
      benefits: ["Improves digestion", "Increases mindfulness", "Enhances enjoyment"]
    }
  ];

  // Filter and prioritize tasks based on mood and preferences
  let selectedTasks = allTasks;
  
  if (mood < 5) {
    // Prioritize gentle, mood-boosting activities
    selectedTasks = allTasks.filter(task => 
      task.category === 'mindfulness' || 
      task.category === 'self-care' || 
      task.difficulty === 'easy'
    );
  } else if (mood > 7) {
    // Include more challenging or social activities
    selectedTasks = allTasks.filter(task => 
      task.difficulty === 'medium' || 
      task.category === 'social' || 
      task.category === 'exercise'
    );
  }

  return selectedTasks.slice(0, 4).map(task => ({
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    due_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};