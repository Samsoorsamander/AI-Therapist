import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Trophy, Target, Heart, Zap, Crown, Medal, Gift } from 'lucide-react';
import { Task, MoodEntry } from '../types';
import toast from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'tasks' | 'mood' | 'streak' | 'milestone';
}

interface AchievementSystemProps {
  tasks: Task[];
  moodEntries: MoodEntry[];
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  tasks, 
  moodEntries, 
  achievements, 
  setAchievements 
}) => {
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const achievementTemplates: Achievement[] = [
    {
      id: 'first-task',
      title: 'First Steps',
      description: 'Complete your first therapeutic task',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      category: 'tasks'
    },
    {
      id: 'task-master',
      title: 'Task Master',
      description: 'Complete 10 therapeutic tasks',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      category: 'tasks'
    },
    {
      id: 'mood-tracker',
      title: 'Mood Tracker',
      description: 'Log your mood for 7 consecutive days',
      icon: Heart,
      color: 'from-pink-500 to-red-500',
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      category: 'streak'
    },
    {
      id: 'positive-vibes',
      title: 'Positive Vibes',
      description: 'Maintain an average mood of 7+ for a week',
      icon: Star,
      color: 'from-purple-500 to-indigo-500',
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      category: 'mood'
    },
    {
      id: 'wellness-warrior',
      title: 'Wellness Warrior',
      description: 'Complete 25 therapeutic tasks',
      icon: Crown,
      color: 'from-blue-500 to-cyan-500',
      unlocked: false,
      progress: 0,
      maxProgress: 25,
      category: 'tasks'
    },
    {
      id: 'mindful-master',
      title: 'Mindful Master',
      description: 'Complete 5 mindfulness tasks',
      icon: Zap,
      color: 'from-teal-500 to-green-500',
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      category: 'tasks'
    },
    {
      id: 'consistency-champion',
      title: 'Consistency Champion',
      description: 'Use the app for 30 consecutive days',
      icon: Medal,
      color: 'from-orange-500 to-red-500',
      unlocked: false,
      progress: 0,
      maxProgress: 30,
      category: 'streak'
    },
    {
      id: 'mood-milestone',
      title: 'Mood Milestone',
      description: 'Log 50 mood entries',
      icon: Gift,
      color: 'from-indigo-500 to-purple-500',
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      category: 'mood'
    }
  ];

  useEffect(() => {
    if (achievements.length === 0) {
      setAchievements(achievementTemplates);
    }
  }, []);

  useEffect(() => {
    updateAchievements();
  }, [tasks, moodEntries]);

  const updateAchievements = () => {
    const completedTasks = tasks.filter(task => task.completed);
    const mindfulnessTasks = completedTasks.filter(task => task.category === 'mindfulness');
    
    const updatedAchievements = achievements.map(achievement => {
      let newProgress = achievement.progress;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case 'first-task':
          newProgress = Math.min(completedTasks.length, 1);
          break;
        case 'task-master':
          newProgress = Math.min(completedTasks.length, 10);
          break;
        case 'wellness-warrior':
          newProgress = Math.min(completedTasks.length, 25);
          break;
        case 'mindful-master':
          newProgress = Math.min(mindfulnessTasks.length, 5);
          break;
        case 'mood-tracker':
          newProgress = Math.min(getMoodStreak(), 7);
          break;
        case 'positive-vibes':
          newProgress = Math.min(getPositiveMoodDays(), 7);
          break;
        case 'consistency-champion':
          newProgress = Math.min(getUsageStreak(), 30);
          break;
        case 'mood-milestone':
          newProgress = Math.min(moodEntries.length, 50);
          break;
      }

      if (newProgress >= achievement.maxProgress && !unlocked) {
        unlocked = true;
        if (!newlyUnlocked.find(a => a.id === achievement.id)) {
          setNewlyUnlocked(prev => [...prev, { ...achievement, unlocked: true, progress: newProgress }]);
          toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`);
        }
      }

      return { ...achievement, progress: newProgress, unlocked };
    });

    setAchievements(updatedAchievements);
  };

  const getMoodStreak = () => {
    // Calculate consecutive days with mood entries
    const sortedEntries = moodEntries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = sortedEntries.some(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getPositiveMoodDays = () => {
    const recentEntries = moodEntries
      .filter(entry => {
        const entryDate = new Date(entry.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      })
      .filter(entry => entry.mood_score >= 7);
    
    return recentEntries.length;
  };

  const getUsageStreak = () => {
    // Simplified calculation - in real app, track daily usage
    return Math.min(moodEntries.length + tasks.filter(t => t.completed).length, 30);
  };

  const categories = [
    { id: 'all', label: 'All Achievements', icon: Award },
    { id: 'tasks', label: 'Task Achievements', icon: Target },
    { id: 'mood', label: 'Mood Achievements', icon: Heart },
    { id: 'streak', label: 'Streak Achievements', icon: Zap },
    { id: 'milestone', label: 'Milestones', icon: Trophy },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-600/80 to-orange-600/80 backdrop-blur-xl p-6 rounded-2xl text-white border border-yellow-400/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Trophy className="w-7 h-7 mr-2" />
              Your Achievements
            </h2>
            <p className="opacity-90">
              {unlockedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round((unlockedCount / totalCount) * 100)}%</div>
            <div className="text-sm opacity-90">Complete</div>
          </div>
        </div>
        
        <div className="bg-white/20 rounded-full h-3">
          <motion.div
            className="bg-white rounded-full h-3"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center space-x-2 ${
              selectedCategory === category.id
                ? 'bg-blue-500/80 text-white border border-blue-400/50'
                : 'bg-slate-700/50 text-blue-300 hover:bg-slate-600/50 border border-slate-600/50'
            } backdrop-blur-sm transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border backdrop-blur-sm overflow-hidden group ${
                achievement.unlocked
                  ? 'bg-slate-800/50 border-yellow-400/50 shadow-lg shadow-yellow-400/20'
                  : 'bg-slate-800/30 border-slate-600/50'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -5,
              }}
            >
              {/* Background Effect */}
              {achievement.unlocked && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-10`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    achievement.unlocked
                      ? `bg-gradient-to-r ${achievement.color}`
                      : 'bg-slate-700/50'
                  }`}
                  animate={achievement.unlocked ? {
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: achievement.unlocked ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <achievement.icon 
                    className={`w-6 h-6 ${
                      achievement.unlocked ? 'text-white' : 'text-slate-400'
                    }`} 
                  />
                </motion.div>

                {/* Content */}
                <h3 className={`text-lg font-semibold mb-2 ${
                  achievement.unlocked ? 'text-yellow-300' : 'text-slate-400'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  achievement.unlocked ? 'text-blue-200' : 'text-slate-500'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className={achievement.unlocked ? 'text-blue-300' : 'text-slate-500'}>
                      Progress
                    </span>
                    <span className={achievement.unlocked ? 'text-blue-300' : 'text-slate-500'}>
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        achievement.unlocked
                          ? `bg-gradient-to-r ${achievement.color}`
                          : 'bg-slate-600'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%` 
                      }}
                      transition={{ delay: index * 0.1, duration: 1 }}
                    />
                  </div>
                </div>

                {/* Unlock Status */}
                {achievement.unlocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Newly Unlocked Achievements */}
      <AnimatePresence>
        {newlyUnlocked.map((achievement) => (
          <motion.div
            key={`popup-${achievement.id}`}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl text-white shadow-2xl z-50 max-w-sm"
            onAnimationComplete={() => {
              setTimeout(() => {
                setNewlyUnlocked(prev => prev.filter(a => a.id !== achievement.id));
              }, 3000);
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold">Achievement Unlocked!</h4>
                <p className="text-sm opacity-90">{achievement.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem;