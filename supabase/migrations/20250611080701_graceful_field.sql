/*
  # Therapy AI Database Schema

  1. New Tables
    - `patients`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `age` (integer)
      - `created_at` (timestamp)
      - `last_session` (timestamp)
      - `total_sessions` (integer)
      - `current_mood` (integer)
      - `progress_score` (integer)

    - `sessions`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `started_at` (timestamp)
      - `ended_at` (timestamp)
      - `user_input` (text)
      - `ai_response` (text)
      - `emotion` (text)
      - `recommendations` (text array)
      - `mood_before` (integer)
      - `mood_after` (integer)

    - `mood_entries`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `mood_score` (integer)
      - `energy_level` (integer)
      - `anxiety_level` (integer)
      - `notes` (text)
      - `created_at` (timestamp)

    - `tasks`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text)
      - `estimated_duration` (integer)
      - `due_date` (timestamp)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer,
  created_at timestamptz DEFAULT now(),
  last_session timestamptz,
  total_sessions integer DEFAULT 0,
  current_mood integer DEFAULT 5,
  progress_score integer DEFAULT 0
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  user_input text,
  ai_response text,
  emotion text,
  recommendations text[],
  mood_before integer,
  mood_after integer
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level integer NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  anxiety_level integer NOT NULL CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_duration integer DEFAULT 15,
  due_date timestamptz,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
// Done

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Users can read own patient data"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own patient data"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own patient data"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for sessions table
CREATE POLICY "Users can read own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can insert own sessions"
  ON sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

-- Create policies for mood_entries table
CREATE POLICY "Users can read own mood entries"
  ON mood_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

-- Create policies for tasks table
CREATE POLICY "Users can read own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can insert own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_patient_id ON mood_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);