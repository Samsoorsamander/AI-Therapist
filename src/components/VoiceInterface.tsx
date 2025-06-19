import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, AlertCircle, X, Zap, Brain } from 'lucide-react';
import { generateAIResponse } from '../lib/aiService';
import { saveSession } from '../lib/supabase';

const VoiceInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize session
    setSessionId(`session_${Date.now()}`);

    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          setErrorMessage('');
          handleVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            setErrorMessage('No speech detected. Please check that your microphone is connected, unmuted, and that your browser has permission to access it. Try speaking closer to the microphone.');
            break;
          case 'audio-capture':
            setErrorMessage('Microphone access failed. Please check your microphone connection and browser permissions.');
            break;
          case 'not-allowed':
            setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings and try again.');
            break;
          case 'network':
            setErrorMessage('Network error occurred. Please check your internet connection and try again.');
            break;
          default:
            setErrorMessage(`Speech recognition error: ${event.error}. Please try again.`);
        }
      };

      setIsConnected(true);
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceInput = async (input: string) => {
    setIsProcessing(true);
    setIsListening(false);
    
    try {
      // Add user input to conversation history
      const newHistory = [...conversationHistory, input];
      
      // Generate AI response using the AI service
      const aiResponse = await generateAIResponse(input, conversationHistory);
      
      // Add AI response to conversation history
      setConversationHistory([...newHistory, aiResponse.message]);
      setCurrentResponse(aiResponse.message);
      
      // Save session data to Supabase
      try {
        await saveSession({
          id: `${sessionId}_${Date.now()}`,
          patient_id: 'current_user', // Replace with actual user ID
          started_at: new Date().toISOString(),
          user_input: input,
          ai_response: aiResponse.message,
          emotion: aiResponse.emotion,
          recommendations: aiResponse.recommendations,
        });
      } catch (dbError) {
        console.error('Failed to save session:', dbError);
      }
      
      // Speak the response if audio is enabled
      if (isAudioEnabled && synthRef.current) {
        speakResponse(aiResponse.message);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorResponse = "I apologize, but I'm having trouble processing your message right now. Could you please try again?";
      setCurrentResponse(errorResponse);
      
      if (isAudioEnabled && synthRef.current) {
        speakResponse(errorResponse);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript('');
      setErrorMessage('');
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const dismissError = () => {
    setErrorMessage('');
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 mb-4">Voice recognition is not supported in your browser.</p>
          <p className="text-sm text-red-400/80">Please try using Chrome, Safari, or Edge for the best experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mb-6 bg-red-900/50 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-200 text-sm leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={dismissError}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Visualization */}
      <div className="text-center mb-8">
        <motion.div
          className={`mx-auto w-40 h-40 rounded-full flex items-center justify-center relative ${
            isListening 
              ? 'bg-gradient-to-r from-red-500/80 to-pink-500/80' 
              : isProcessing
              ? 'bg-gradient-to-r from-purple-500/80 to-indigo-500/80'
              : 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80'
          } backdrop-blur-sm border-2 ${
            isListening 
              ? 'border-red-400/50' 
              : isProcessing
              ? 'border-purple-400/50'
              : 'border-blue-400/50'
          }`}
          animate={{
            scale: isListening ? [1, 1.1, 1] : isProcessing ? [1, 1.05, 1] : 1,
            boxShadow: isListening 
              ? [
                  "0 0 30px rgba(239, 68, 68, 0.4)",
                  "0 0 60px rgba(236, 72, 153, 0.6)",
                  "0 0 30px rgba(239, 68, 68, 0.4)",
                ]
              : isProcessing
              ? [
                  "0 0 30px rgba(147, 51, 234, 0.4)",
                  "0 0 60px rgba(99, 102, 241, 0.6)",
                  "0 0 30px rgba(147, 51, 234, 0.4)",
                ]
              : [
                  "0 0 30px rgba(59, 130, 246, 0.4)",
                  "0 0 60px rgba(6, 182, 212, 0.6)",
                  "0 0 30px rgba(59, 130, 246, 0.4)",
                ],
          }}
          transition={{
            scale: {
              duration: isListening ? 1 : isProcessing ? 2 : 1,
              repeat: (isListening || isProcessing) ? Infinity : 0,
            },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {/* Animated rings */}
          {(isListening || isProcessing) && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute inset-0 rounded-full border-2 ${
                    isListening ? 'border-red-400/30' : 'border-purple-400/30'
                  }`}
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.8, 0.4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
          
          <motion.div
            className="w-28 h-28 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"
            animate={{
              scale: isListening ? [1, 0.9, 1] : isProcessing ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: isListening ? 0.8 : 1.5,
              repeat: (isListening || isProcessing) ? Infinity : 0,
            }}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-10 h-10 text-purple-400" />
              </motion.div>
            ) : isListening ? (
              <Mic className="w-10 h-10 text-red-400" />
            ) : (
              <MicOff className="w-10 h-10 text-blue-400" />
            )}
          </motion.div>
        </motion.div>

        <motion.h2 
          className="text-2xl font-bold text-blue-100 mt-6 mb-2"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Voice Therapy Session
        </motion.h2>
        <p className="text-blue-300">
          {isProcessing 
            ? 'AI is thinking... Please wait' 
            : isListening 
            ? 'Listening... Speak naturally' 
            : 'Click the button below to start talking'
          }
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-8">
        <motion.button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`px-8 py-4 rounded-2xl font-semibold text-white backdrop-blur-sm border ${
            isListening 
              ? 'bg-gradient-to-r from-red-500/80 to-pink-500/80 border-red-400/50' 
              : 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 border-blue-400/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: isProcessing ? 1 : 0.95 }}
          animate={{
            boxShadow: isListening 
              ? [
                  "0 0 20px rgba(239, 68, 68, 0.3)",
                  "0 0 40px rgba(236, 72, 153, 0.4)",
                  "0 0 20px rgba(239, 68, 68, 0.3)",
                ]
              : [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(147, 51, 234, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 inline mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 inline mr-2" />
              Start Listening
            </>
          )}
        </motion.button>

        <motion.button
          onClick={toggleAudio}
          className={`px-6 py-4 rounded-2xl font-semibold backdrop-blur-sm border ${
            isAudioEnabled 
              ? 'bg-green-500/80 text-white border-green-400/50' 
              : 'bg-slate-700/80 text-slate-300 border-slate-600/50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAudioEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </motion.button>

        <AnimatePresence>
          {isPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={stopSpeaking}
              className="px-6 py-4 rounded-2xl font-semibold bg-orange-500/80 text-white backdrop-blur-sm border border-orange-400/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pause className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-900/50 backdrop-blur-sm p-6 rounded-2xl mb-6 border border-blue-400/30"
          >
            <h3 className="text-lg font-semibold text-blue-100 mb-2">You said:</h3>
            <p className="text-blue-200 italic">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response */}
      <AnimatePresence>
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-purple-400/30"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-purple-200 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Therapist Response:
              </h3>
              {isPlaying && (
                <div className="flex items-center text-purple-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                  </motion.div>
                  <span className="text-sm">Speaking...</span>
                </div>
              )}
            </div>
            <p className="text-blue-100 leading-relaxed mb-4">{currentResponse}</p>
            
            {!isPlaying && isAudioEnabled && (
              <motion.button
                onClick={() => speakResponse(currentResponse)}
                className="px-4 py-2 bg-purple-500/80 text-white rounded-lg text-sm font-medium backdrop-blur-sm border border-purple-400/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Volume2 className="w-4 h-4 inline mr-1" />
                Hear Again
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Tips */}
      <motion.div 
        className="mt-8 bg-slate-800/30 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-lg font-semibold text-blue-100 mb-3 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Voice Session Tips:
        </h3>
        <ul className="space-y-2 text-sm text-blue-300">
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Speak clearly and at a natural pace</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Find a quiet environment for best results</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Take your time - there's no rush</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Toggle audio response on/off as needed</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Ensure your microphone is connected and browser permissions are granted</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default VoiceInterface;