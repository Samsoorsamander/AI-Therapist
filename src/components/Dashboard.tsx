import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  MessageCircle,
  CheckCircle,
  Calendar,
  Mic,
  Brain,
  TrendingUp,
  Heart,
  Award,
  Zap,
  Target,
} from "lucide-react";
import Confetti from "react-confetti";
import ChatInterface from "./ChatInterface";
import TaskManager from "./TaskManager";
import MoodTracker from "./MoodTracker";
import VoiceInterface from "./VoiceInterface";
import ProgressAnalytics from "./ProgressAnalytics";
import AchievementSystem from "./AchievementSystem";
import { Task, MoodEntry } from "../types";
import { generateTherapyTasks } from "../lib/aiTherapist";
import {
  getUserTasks,
  getUserMoodEntries,
  getCurrentUser,
} from "../lib/supabase";
import toast from "react-hot-toast";

interface DashboardProps {
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSignOut }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState(7);
  const [user, setUser] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load user tasks
        const { data: userTasks } = await getUserTasks(currentUser.id);
        if (userTasks) {
          setTasks(userTasks);
        } else {
          // Generate initial tasks if none exist
          const initialTasks = generateTherapyTasks(currentMood).map(
            (task) => ({
              ...task,
              id: Math.random().toString(36).substr(2, 9),
              patient_id: currentUser.id,
              completed: false,
              created_at: new Date().toISOString(),
            })
          );
          setTasks(initialTasks);
        }

        // Load mood entries
        const { data: userMoodEntries } = await getUserMoodEntries(
          currentUser.id
        );
        if (userMoodEntries) {
          setMoodEntries(userMoodEntries);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load your data");
    }
  };

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    toast.success("🎉 Amazing progress! Keep it up!");
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "chat",
      label: "AI Therapist",
      icon: MessageCircle,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "voice",
      label: "Voice Session",
      icon: Mic,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "tasks",
      label: "My Tasks",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "mood",
      label: "Mood Tracker",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "analytics",
      label: "Progress",
      icon: TrendingUp,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Award,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const completedTasks = tasks.filter((task) => task.completed).length;
  const averageMood =
    moodEntries.length > 0
      ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) /
        moodEntries.length
      : 0;

  const stats = [
    {
      label: "Current Mood",
      value: currentMood,
      max: 10,
      icon: Heart,
      color: "from-pink-500 to-red-500",
      description: "How you feel today",
    },
    {
      label: "Tasks Completed",
      value: completedTasks,
      max: tasks.length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      description: "Therapeutic activities",
    },
    {
      label: "Weekly Average",
      value: Math.round(averageMood * 10) / 10,
      max: 10,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      description: "Mood trend this week",
    },
    {
      label: "Sessions This Week",
      value: 5,
      max: 7,
      icon: Brain,
      color: "from-purple-500 to-indigo-500",
      description: "AI therapy sessions",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          colors={["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"]}
        />
      )}

      {/* Welcome Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <motion.h1
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              Welcome back, {user?.user_metadata?.name || "Friend"}
            </motion.h1>
            <motion.p
              className="text-blue-300 mt-1 text-lg"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              How are you feeling today? ✨
            </motion.p>
          </div>
          <motion.button
            onClick={onSignOut}
            className="px-6 py-2 text-blue-300 hover:text-blue-100 transition-colors backdrop-blur-sm bg-slate-800/30 rounded-xl border border-blue-400/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Out
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {activeTab === "overview" && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-blue-400/20 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)",
              }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-blue-300">{stat.label}</p>
                    <motion.p
                      className="text-3xl font-bold text-blue-100 mt-1"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {stat.value}/{stat.max}
                    </motion.p>
                    <p className="text-xs text-blue-400 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>

                <div className="bg-slate-700/50 rounded-full h-3 mb-2">
                  <motion.div
                    className={`h-3 rounded-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                    transition={{
                      delay: index * 0.1 + 0.5,
                      duration: 1,
                      ease: "easeOut",
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-blue-400">
                  <span>Progress</span>
                  <span>{Math.round((stat.value / stat.max) * 100)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl mb-8 border border-blue-400/20">
        <div className="border-b border-blue-400/20">
          <nav className="flex space-x-2 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? "border-cyan-400 text-cyan-300"
                    : "border-transparent text-blue-300 hover:text-blue-100 hover:border-blue-400/50"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-10 rounded-t-lg`}
                    layoutId="activeTab"
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  />
                )}
                <motion.div
                  animate={{
                    rotate: activeTab === tab.id ? [0, 360] : 0,
                  }}
                  transition={{
                    duration: activeTab === tab.id ? 2 : 0,
                    ease: "easeInOut",
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                </motion.div>
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    className="bg-gradient-to-br from-blue-900/30 to-green-900/30 p-6 rounded-xl backdrop-blur-sm border border-blue-400/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold text-blue-100 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          icon: "🌟",
                          text: "Completed breathing exercise",
                          color: "text-green-400",
                        },
                        {
                          icon: "💬",
                          text: "Had a 15-minute chat session",
                          color: "text-blue-400",
                        },
                        {
                          icon: "📊",
                          text: "Updated mood tracking",
                          color: "text-purple-400",
                        },
                        {
                          icon: "🎯",
                          text: "Set new wellness goals",
                          color: "text-orange-400",
                        },
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="text-lg">{activity.icon}</span>
                          <span className={`text-sm ${activity.color}`}>
                            {activity.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl backdrop-blur-sm border border-purple-400/20"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-pink-400" />
                      Upcoming Tasks
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task) => !task.completed)
                        .slice(0, 4)
                        .map((task, index) => (
                          <motion.div
                            key={task.id}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Calendar className="w-4 h-4 text-pink-400" />
                            <span className="text-sm text-purple-200">
                              {task.title}
                            </span>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "chat" && <ChatInterface />}
              {activeTab === "voice" && <VoiceInterface />}
              {activeTab === "tasks" && (
                <TaskManager
                  tasks={tasks}
                  setTasks={setTasks}
                  onTaskComplete={triggerCelebration}
                />
              )}
              {activeTab === "mood" && (
                <MoodTracker
                  moodEntries={moodEntries}
                  setMoodEntries={setMoodEntries}
                  setCurrentMood={setCurrentMood}
                  user={user}
                />
              )}
              {activeTab === "analytics" && (
                <ProgressAnalytics moodEntries={moodEntries} tasks={tasks} />
              )}
              {activeTab === "achievements" && (
                <AchievementSystem
                  tasks={tasks}
                  moodEntries={moodEntries}
                  achievements={achievements}
                  setAchievements={setAchievements}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
