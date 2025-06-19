import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Clock, Calendar, Plus, Filter, Star, Zap, Target } from 'lucide-react';
import { Task } from '../types';
import { updateTask } from '../lib/supabase';
import toast from 'react-hot-toast';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskComplete?: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, onTaskComplete }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Tasks', color: 'gray', icon: Target },
    { id: 'mindfulness', label: 'Mindfulness', color: 'purple', icon: Zap },
    { id: 'exercise', label: 'Exercise', color: 'green', icon: Zap },
    { id: 'journaling', label: 'Journaling', color: 'blue', icon: Zap },
    { id: 'social', label: 'Social', color: 'orange', icon: Zap },
    { id: 'self-care', label: 'Self Care', color: 'pink', icon: Zap },
  ];

  const difficulties = {
    easy: { label: 'Easy', color: 'green', icon: '●', points: 10 },
    medium: { label: 'Medium', color: 'yellow', icon: '●●', points: 20 },
    hard: { label: 'Hard', color: 'red', icon: '●●●', points: 30 },
  };

  const filteredTasks = tasks.filter(task => {
    const statusFilter = filter === 'all' || 
      (filter === 'completed' && task.completed) || 
      (filter === 'pending' && !task.completed);
    
    const categoryFilter = selectedCategory === 'all' || task.category === selectedCategory;
    
    return statusFilter && categoryFilter;
  });

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    const newCompleted = !wasCompleted;

    try {
      // Update in database
      await updateTask(taskId, { 
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null
      });

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : undefined }
          : t
      ));

      if (newCompleted && !wasCompleted) {
        const points = difficulties[task.difficulty as keyof typeof difficulties]?.points || 10;
        toast.success(`🎉 Task completed! +${points} points`);
        onTaskComplete?.();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getTaskProgress = () => {
    const completed = tasks.filter(task => task.completed).length;
    return tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  const getTotalPoints = () => {
    return tasks
      .filter(task => task.completed)
      .reduce((total, task) => {
        const points = difficulties[task.difficulty as keyof typeof difficulties]?.points || 10;
        return total + points;
      }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-xl p-6 rounded-2xl text-white border border-blue-400/30 relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
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
              <h2 className="text-2xl font-bold flex items-center">
                <Target className="w-7 h-7 mr-2" />
                Your Progress
              </h2>
              <p className="opacity-90">
                {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(getTaskProgress())}%</div>
              <div className="text-sm opacity-90">{getTotalPoints()} points earned</div>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-full h-3 mb-2">
            <motion.div
              className="bg-white rounded-full h-3"
              initial={{ width: 0 }}
              animate={{ width: `${getTaskProgress()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {['all', 'pending', 'completed'].map((filterOption) => (
            <motion.button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-4 py-2 rounded-xl font-medium text-sm backdrop-blur-sm border ${
                filter === filterOption
                  ? 'bg-blue-500/80 text-white border-blue-400/50'
                  : 'bg-slate-700/50 text-blue-300 hover:bg-slate-600/50 border-slate-600/50'
              } transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 backdrop-blur-sm border ${
                selectedCategory === category.id
                  ? `bg-${category.color}-500/80 text-white border-${category.color}-400/50`
                  : `bg-slate-700/50 text-${category.color}-300 hover:bg-slate-600/50 border-slate-600/50`
              } transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon className="w-3 h-3" />
              <span>{category.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 relative overflow-hidden group ${
                task.completed 
                  ? 'border-green-500 bg-green-900/20' 
                  : `border-${getCategoryColor(task.category)}-500`
              }`}
              whileHover={{ 
                scale: 1.01,
                y: -2,
                boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)"
              }}
            >
              {/* Animated background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${
                  task.completed 
                    ? 'from-green-500/10 to-emerald-500/10' 
                    : `from-${getCategoryColor(task.category)}-500/5 to-${getCategoryColor(task.category)}-600/5`
                } opacity-0 group-hover:opacity-100 transition-opacity`}
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative z-10 flex items-start space-x-4">
                <motion.button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="mt-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={task.completed ? {
                    rotate: [0, 360],
                  } : {}}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400 hover:text-blue-400 transition-colors" />
                  )}
                </motion.button>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg font-semibold ${
                      task.completed ? 'text-slate-400 line-through' : 'text-blue-100'
                    }`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border ${
                        task.completed
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : `bg-${getCategoryColor(task.category)}-500/20 text-${getCategoryColor(task.category)}-300 border-${getCategoryColor(task.category)}-500/30`
                      }`}>
                        {task.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-lg backdrop-blur-sm border ${
                        difficulties[task.difficulty as keyof typeof difficulties]?.color === 'green'
                          ? 'text-green-300 bg-green-500/20 border-green-500/30'
                          : difficulties[task.difficulty as keyof typeof difficulties]?.color === 'yellow'
                          ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30'
                          : 'text-red-300 bg-red-500/20 border-red-500/30'
                      }`}>
                        {difficulties[task.difficulty as keyof typeof difficulties]?.icon} 
                        {difficulties[task.difficulty as keyof typeof difficulties]?.points}pts
                      </span>
                    </div>
                  </div>

                  <p className={`text-blue-200 mb-3 ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-blue-300">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimated_duration} min</span>
                      </div>
                      
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {task.completed && task.completed_at && (
                      <motion.div 
                        className="text-green-400 text-xs flex items-center space-x-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Star className="w-3 h-3" fill="currentColor" />
                        <span>Completed {new Date(task.completed_at).toLocaleDateString()}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-slate-400 mb-4">
            <Star className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-blue-100 mb-2">No tasks found</h3>
          <p className="text-blue-300">
            {filter === 'completed' 
              ? "You haven't completed any tasks yet. Keep going!"
              : filter === 'pending'
              ? "Great job! No pending tasks."
              : "No tasks match your current filters."
            }
          </p>
        </motion.div>
      )}

      {/* Motivational Message */}
      {tasks.filter(t => t.completed).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/80 to-blue-500/80 backdrop-blur-xl p-6 rounded-2xl text-white text-center border border-green-400/30 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-green-400/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <div className="relative z-10">
            <motion.h3 
              className="text-xl font-bold mb-2 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="w-6 h-6 mr-2" />
              Amazing Progress! 🎉
            </motion.h3>
            <p className="opacity-90">
              You've completed {tasks.filter(t => t.completed).length} tasks and earned {getTotalPoints()} points! 
              Every small step counts towards your mental wellness journey.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TaskManager;