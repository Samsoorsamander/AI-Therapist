import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { MoodEntry, Task } from '../types';

interface ProgressAnalyticsProps {
  moodEntries: MoodEntry[];
  tasks: Task[];
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ moodEntries, tasks }) => {
  // Prepare mood trend data
  const moodTrendData = moodEntries
    .slice(0, 30)
    .reverse()
    .map((entry, index) => ({
      day: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood_score,
      energy: entry.energy_level,
      anxiety: entry.anxiety_level,
    }));

  // Prepare task completion data
  const tasksByCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = { total: 0, completed: 0 };
    }
    acc[task.category].total++;
    if (task.completed) {
      acc[task.category].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const categoryData = Object.entries(tasksByCategory).map(([category, data]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    completed: data.completed,
    total: data.total,
    percentage: Math.round((data.completed / data.total) * 100),
  }));

  // Weekly progress data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayTasks = tasks.filter(task => {
      if (!task.completed_at) return false;
      const taskDate = new Date(task.completed_at);
      return taskDate.toDateString() === date.toDateString();
    });
    
    const dayMoods = moodEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate.toDateString() === date.toDateString();
    });

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: dayTasks.length,
      avgMood: dayMoods.length > 0 ? dayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / dayMoods.length : 0,
    };
  }).reverse();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasActivity = moodEntries.some(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate.toDateString() === checkDate.toDateString();
      }) || tasks.some(task => {
        if (!task.completed_at) return false;
        const taskDate = new Date(task.completed_at);
        return taskDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  const totalSessions = moodEntries.length + tasks.filter(t => t.completed).length;
  const averageMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Current Streak',
            value: `${currentStreak} days`,
            icon: Award,
            color: 'from-yellow-400 to-orange-500',
            description: 'Days with activity',
          },
          {
            title: 'Total Sessions',
            value: totalSessions,
            icon: Calendar,
            color: 'from-blue-400 to-blue-600',
            description: 'Mood entries + tasks',
          },
          {
            title: 'Average Mood',
            value: `${averageMood.toFixed(1)}/10`,
            icon: TrendingUp,
            color: 'from-green-400 to-green-600',
            description: 'Overall rating',
          },
          {
            title: 'Completion Rate',
            value: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%`,
            icon: Target,
            color: 'from-purple-400 to-purple-600',
            description: 'Tasks completed',
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${metric.color} p-6 rounded-2xl text-white`}
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="w-8 h-8" />
              <div className="text-right">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-sm opacity-90">{metric.description}</p>
              </div>
            </div>
            <h3 className="font-semibold">{metric.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Mood Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Mood Trends Over Time</h2>
        {moodTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[1, 10]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Mood"
              />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Energy"
              />
              <Line 
                type="monotone" 
                dataKey="anxiety" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Anxiety"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-300 flex items-center justify-center text-gray-500">
            <p>No mood data available yet. Start tracking to see your progress!</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" name="Tasks Completed" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Task Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Task Categories</h2>
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-500">
                      {category.completed}/{category.total} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ delay: 0.1 * index, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <p>No task data available yet.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white"
      >
        <h2 className="text-xl font-bold mb-4">Insights & Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">🎯 Your Progress</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• You've maintained a {currentStreak}-day activity streak!</li>
              <li>• Your average mood score is {averageMood.toFixed(1)}/10</li>
              <li>• You've completed {tasks.filter(t => t.completed).length} therapeutic tasks</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">💡 Recommendations</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Keep up your daily check-ins for better insights</li>
              <li>• Focus on {categoryData.length > 0 ? categoryData.reduce((min, cat) => cat.percentage < min.percentage ? cat : min).category.toLowerCase() : 'mindfulness'} tasks</li>
              <li>• Consider voice sessions when mood is below 5</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressAnalytics;