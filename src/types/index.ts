export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  created_at: string;
  last_session: string | null;
  total_sessions: number;
  current_mood: number;
  progress_score: number;
}

export interface Session {
  id: string;
  patient_id: string;
  started_at: string;
  ended_at: string | null;
  duration: number;
  mood_before: number;
  mood_after: number | null;
  notes: string;
  ai_insights: string;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  is_ai: boolean;
  timestamp: string;
  voice_data?: string;
}

export interface Task {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'journaling' | 'exercise' | 'social';
  due_date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  goals: string[];
  duration_weeks: number;
  created_at: string;
  status: 'active' | 'completed' | 'paused';
}