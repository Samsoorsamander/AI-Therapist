import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";
import { signUp, signIn, createPatientProfile } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; // Import from react-router-dom

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const navigate = useNavigate(); // Using react-router's navigate
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await signUp(
          formData.email,
          formData.password,
          {
            name: formData.name,
            age: parseInt(formData.age) || null,
          }
        );

        if (error) throw error;

        if (data.user) {
          await createPatientProfile(data.user.id, {
            email: formData.email,
            name: formData.name,
            age: parseInt(formData.age) || null,
          });

          toast.success("Welcome to TherapyAI! Your journey begins now.");
          localStorage.setItem("user", JSON.stringify(data.user));
          onClose();
          navigate("/dashboard"); // Using react-router's navigate
          if (onAuthSuccess) onAuthSuccess();
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) throw error;

        toast.success("Welcome back! Ready to continue your journey?");
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        onClose();
        navigate("/dashboard"); // Using react-router's navigate
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-blue-400/30 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
            <motion.div
              className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.h2
                  className="text-2xl font-bold text-blue-100 flex items-center"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-6 h-6 mr-2 text-cyan-400" />
                  {isSignUp ? "Join TherapyAI" : "Welcome Back"}
                </motion.h2>
                <motion.button
                  onClick={onClose}
                  className="text-blue-300 hover:text-blue-100 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-xl text-blue-100 placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                      required
                    />
                  </motion.div>
                )}

                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <input
                      type="number"
                      name="age"
                      placeholder="Age (optional)"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-xl text-blue-100 placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                    />
                  </motion.div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-blue-400/30 rounded-xl text-blue-100 placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-blue-400/30 rounded-xl text-blue-100 placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 40px rgba(147, 51, 234, 0.4)",
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  {loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                  <span className="relative">
                    {loading
                      ? "Processing..."
                      : isSignUp
                      ? "Start Your Journey"
                      : "Continue Journey"}
                  </span>
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-blue-300 mb-2">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </p>
                <motion.button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
