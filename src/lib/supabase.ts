import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with your actual environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://wvjytppdpnpnusmydepw.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2anl0cHBkcG5wbnVzbXlkZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjg3OTAsImV4cCI6MjA2NTUwNDc5MH0.MHvJ6SQ8uZkYBPTs11LNHOPVPooLTD12HLFUYekD6QQ";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if Supabase is properly configured (now checks for actual values)
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url" &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== "your_supabase_anon_key"
  );
};

// Authentication functions (unchanged but now using your real keys)
export const signUp = async (
  email: string,
  password: string,
  userData: any
) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { message: "Supabase not configured" };
  }

  const { error } = await supabase.auth.signOut();
  return error;
};

// Database operations (unchanged but now using your real keys)
export const createPatientProfile = async (
  userId: string,
  profileData: any
) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase.from("patients").insert([
    {
      id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
    },
  ]);
  return { data, error };
};

export const saveSession = async (sessionData: any) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase.from("sessions").insert([sessionData]);
  return { data, error };
};

export const saveMoodEntry = async (moodData: any) => {
  try {
    // First check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", moodData.patient_id)
      .single();

    if (patientError || !patient) {
      throw new Error("Patient not found");
    }

    // Then insert the mood entry
    const { data, error } = await supabase
      .from("mood_entries")
      .insert([moodData])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving mood entry:", error);
    throw error;
  }
};

export const saveTask = async (taskData: any) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase.from("tasks").insert([taskData]);
  return { data, error };
};

export const updateTask = async (taskId: string, updates: any) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);
  return { data, error };
};

export const getUserTasks = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("patient_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getUserMoodEntries = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("patient_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getUserSessions = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: { message: "Supabase not configured" } };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("patient_id", userId)
    .order("started_at", { ascending: false });
  return { data, error };
};
