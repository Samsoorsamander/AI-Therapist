import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, Mic, Calendar, BarChart3, Shield, Sparkles, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Therapy",
      description: "Advanced AI that understands and responds with empathy, just like a real therapist",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Mic,
      title: "Voice Conversations",
      description: "Speak naturally with our AI assistant using voice recognition technology",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Personalized Tasks",
      description: "Custom therapy tasks and schedules tailored to your specific needs",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visual analytics to monitor your mental health journey and improvements",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MessageCircle,
      title: "24/7 Support",
      description: "Always available when you need someone to talk to, day or night",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your conversations and data are encrypted and completely confidential",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-8"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 relative"
                style={{ 
                  background: "linear-gradient(45deg, #60A5FA, #34D399, #A78BFA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                Your AI Therapy
                <br />
                <motion.span
                  className="relative inline-block"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Companion
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                  </motion.div>
                </motion.span>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Experience personalized mental health support with our advanced AI therapist. 
              Get professional guidance, complete therapeutic tasks, and track your progress 
              in a safe, judgment-free environment.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg text-lg relative overflow-hidden group"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 20px 40px rgba(59,130,246,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 10px 30px rgba(59,130,246,0.3)",
                    "0 15px 40px rgba(147,51,234,0.4)",
                    "0 10px 30px rgba(59,130,246,0.3)",
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative flex items-center justify-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Your Journey
                </span>
              </motion.button>
              
              <motion.button
                className="px-8 py-4 border-2 border-blue-400/50 text-blue-200 font-semibold rounded-xl hover:border-blue-400 hover:text-blue-100 transition-colors text-lg backdrop-blur-sm bg-blue-900/20"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-blue-100 mb-4">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-blue-300 max-w-2xl mx-auto">
              Our AI-powered platform combines the best of technology and therapeutic practices
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-blue-800/30 group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)",
                }}
              >
                <motion.div 
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-blue-100 mb-3 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-blue-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-xl rounded-3xl p-12 text-white border border-blue-400/30 relative overflow-hidden"
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
              <motion.h2 
                className="text-4xl font-bold mb-6"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Ready to Transform Your Mental Health?
              </motion.h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands who have already started their journey to better mental health
              </p>
              <motion.button
                onClick={onGetStarted}
                className="px-12 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg shadow-lg relative overflow-hidden group"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 20px 40px rgba(255,255,255,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative">Begin Your Therapy Journey</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;