import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Stars } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-40"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.5, 0.5, 1],
              opacity: [0.4, 0.8, 0.2, 0.4],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            style={{
              left: `${5 + i * 4.5}%`,
              top: `${10 + (i * 3) % 80}%`,
            }}
          />
        ))}

        {/* Glowing Orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.6, 0.2, 0.3],
              x: [0, 50, -30, 0],
              y: [0, -30, 20, 0],
            }}
            transition={{
              duration: 12 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2,
            }}
          />
        ))}

        {/* Animated Stars */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-blue-300/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            <Stars className="w-3 h-3" />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="bg-slate-900/80 backdrop-blur-xl border-b border-blue-800/50 shadow-2xl relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Heart className="w-8 h-8 text-blue-400" fill="currentColor" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </motion.div>
              </div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  TherapyAI
                </motion.h1>
                <p className="text-xs text-blue-300/80">Built with ❤️ using Bolt.new</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg border border-blue-400/30"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(147, 51, 234, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Hackathon Edition
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/90 backdrop-blur-xl text-blue-100 py-8 mt-16 border-t border-blue-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p 
            className="text-blue-300/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            © 2025 TherapyAI - Revolutionizing Mental Health Support | Built with ❤️ using Bolt.new
          </motion.p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;