import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  TrendingUp,
  Calendar,
  Plus,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { MoodEntry } from "../types";
import { saveMoodEntry, supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface MoodTrackerProps {
  moodEntries: MoodEntry[];
  setMoodEntries: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
  setCurrentMood: React.Dispatch<React.SetStateAction<number>>;
  user: any; // Add user prop
}

const MoodTracker: React.FC<MoodTrackerProps> = ({
  moodEntries,
  setMoodEntries,
  setCurrentMood,
  user, // Destructure user prop
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [newEntry, setNewEntry] = useState({
    mood_score: 5,
    energy_level: 5,
    anxiety_level: 5,
    notes: "",
  });

  const moodEmojis = [
    "😭",
    "😢",
    "😞",
    "😐",
    "🙂",
    "😊",
    "😄",
    "😁",
    "😃",
    "🤩",
  ];
  const moodLabels = [
    "Terrible",
    "Very Bad",
    "Bad",
    "Poor",
    "Okay",
    "Good",
    "Very Good",
    "Great",
    "Excellent",
    "Amazing",
  ];

  const energyEmojis = ["🔋", "🪫", "⚡", "💪", "🚀"];
  const anxietyColors = [
    "bg-green-400",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-red-400",
    "bg-red-600",
  ];

  const handleSubmitEntry = async () => {
    if (!user) {
      toast.error("Please sign in to save mood entries");
      return;
    }

    try {
      // First ensure patient profile exists
      const { error: profileError } = await supabase.from("patients").upsert(
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || "User",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) throw profileError;

      // Then save mood entry
      const { data: savedEntry, error } = await saveMoodEntry({
        patient_id: user.id,
        ...newEntry,
      });

      if (error) throw error;

      setMoodEntries((prev) => [savedEntry[0], ...prev]);
      setCurrentMood(newEntry.mood_score);
      setNewEntry({
        mood_score: 5,
        energy_level: 5,
        anxiety_level: 5,
        notes: "",
      });
      setIsLogging(false);

      toast.success("Mood entry saved successfully!");
    } catch (error) {
      console.error("Failed to save mood entry:", error);
      toast.error(`Failed to save mood entry: ${error.message}`);
    }
  };

  const getAverageMood = () => {
    if (moodEntries.length === 0) return 0;
    return (
      moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) /
      moodEntries.length
    );
  };

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return 0;
    const recent = moodEntries.slice(0, 3);
    const older = moodEntries.slice(3, 6);

    const recentAvg =
      recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, entry) => sum + entry.mood_score, 0) / older.length
        : recentAvg;

    return recentAvg - olderAvg;
  };

  const trend = getMoodTrend();

  return (
    <div className="space-y-6">
      {/* Mood Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-400 to-red-400 p-6 rounded-2xl text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8" />
            <span className="text-2xl">
              {moodEntries.length > 0
                ? moodEmojis[Math.round(getAverageMood()) - 1]
                : "😊"}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Average Mood</h3>
          <p className="text-2xl font-bold">{getAverageMood().toFixed(1)}/10</p>
          <p className="text-sm opacity-90">
            {moodLabels[Math.round(getAverageMood()) - 1] || "No data"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl text-white ${
            trend > 0
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : trend < 0
              ? "bg-gradient-to-br from-yellow-400 to-orange-500"
              : "bg-gradient-to-br from-blue-400 to-blue-600"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <span className="text-2xl">
              {trend > 0 ? "📈" : trend < 0 ? "📉" : "➖"}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Trend</h3>
          <p className="text-2xl font-bold">
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}
          </p>
          <p className="text-sm opacity-90">
            {trend > 0 ? "Improving" : trend < 0 ? "Declining" : "Stable"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-400 to-indigo-600 p-6 rounded-2xl text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" />
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Entries</h3>
          <p className="text-2xl font-bold">{moodEntries.length}</p>
          <p className="text-sm opacity-90">Total logged</p>
        </motion.div>
      </div>

      {/* Quick Mood Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Log Your Mood</h2>
          <motion.button
            onClick={() => setIsLogging(!isLogging)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            {isLogging ? "Cancel" : "Add Entry"}
          </motion.button>
        </div>

        {isLogging ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Mood Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling? ({newEntry.mood_score}/10)
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">
                  {moodEmojis[newEntry.mood_score - 1]}
                </span>
                <span className="text-lg font-medium text-gray-700">
                  {moodLabels[newEntry.mood_score - 1]}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={newEntry.mood_score}
                onChange={(e) =>
                  setNewEntry((prev) => ({
                    ...prev,
                    mood_score: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Energy Level ({newEntry.energy_level}/10)
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">⚡</span>
                <span className="text-lg font-medium text-gray-700">
                  {newEntry.energy_level <= 2
                    ? "Very Low"
                    : newEntry.energy_level <= 4
                    ? "Low"
                    : newEntry.energy_level <= 6
                    ? "Medium"
                    : newEntry.energy_level <= 8
                    ? "High"
                    : "Very High"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={newEntry.energy_level}
                onChange={(e) =>
                  setNewEntry((prev) => ({
                    ...prev,
                    energy_level: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Anxiety Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Anxiety Level ({newEntry.anxiety_level}/10)
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">😰</span>
                <span className="text-lg font-medium text-gray-700">
                  {newEntry.anxiety_level <= 2
                    ? "Very Low"
                    : newEntry.anxiety_level <= 4
                    ? "Low"
                    : newEntry.anxiety_level <= 6
                    ? "Medium"
                    : newEntry.anxiety_level <= 8
                    ? "High"
                    : "Very High"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={newEntry.anxiety_level}
                onChange={(e) =>
                  setNewEntry((prev) => ({
                    ...prev,
                    anxiety_level: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={newEntry.notes}
                onChange={(e) =>
                  setNewEntry((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="What's on your mind? Any specific triggers or positive moments?"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleSubmitEntry}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save Entry
              </motion.button>
              <motion.button
                onClick={() => setIsLogging(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.button
              onClick={() => {
                setNewEntry((prev) => ({ ...prev, mood_score: 3 }));
                setIsLogging(true);
              }}
              className="p-4 bg-red-50 hover:bg-red-100 rounded-xl text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Frown className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-700">Not Great</p>
            </motion.button>

            <motion.button
              onClick={() => {
                setNewEntry((prev) => ({ ...prev, mood_score: 5 }));
                setIsLogging(true);
              }}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Meh className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-yellow-700">Okay</p>
            </motion.button>

            <motion.button
              onClick={() => {
                setNewEntry((prev) => ({ ...prev, mood_score: 8 }));
                setIsLogging(true);
              }}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-center transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Smile className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700">Great</p>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Recent Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Entries</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {moodEntries.slice(0, 5).map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {moodEmojis[entry.mood_score - 1]}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {moodLabels[entry.mood_score - 1]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()} at{" "}
                      {new Date(entry.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Mood: {entry.mood_score}/10
                  </p>
                  <p className="text-sm text-gray-600">
                    Energy: {entry.energy_level}/10
                  </p>
                  <p className="text-sm text-gray-600">
                    Anxiety: {entry.anxiety_level}/10
                  </p>
                </div>
              </div>

              {entry.notes && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                  "{entry.notes}"
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {moodEntries.length === 0 && (
          <div className="p-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No mood entries yet
            </h3>
            <p className="text-gray-600">
              Start tracking your mood to see patterns and progress over time.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MoodTracker;
