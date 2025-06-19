import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader } from 'lucide-react';
import { generateAIResponse } from '../lib/aiTherapist';
import { AIResponse } from '../types';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: AIResponse['emotion'];
  recommendations?: string[];
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI therapy assistant. I'm here to listen and support you. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date(),
      emotion: 'supportive',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage, messages.map(m => m.content));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.message,
        sender: 'ai',
        timestamp: new Date(),
        emotion: aiResponse.emotion,
        recommendations: aiResponse.recommendations,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your message right now. Could you please try again?",
        sender: 'ai',
        timestamp: new Date(),
        emotion: 'supportive',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionColor = (emotion: AIResponse['emotion']) => {
    switch (emotion) {
      case 'empathetic': return 'from-purple-500 to-pink-500';
      case 'encouraging': return 'from-green-500 to-blue-500';
      case 'curious': return 'from-yellow-500 to-orange-500';
      case 'supportive': return 'from-blue-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-500' 
                      : `bg-gradient-to-r ${getEmotionColor(message.emotion!)}`
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {message.recommendations && message.recommendations.length > 0 && (
                    <motion.div 
                      className="mt-3 pt-3 border-t border-gray-200"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-xs font-medium text-gray-600 mb-2">Suggestions:</p>
                      <ul className="space-y-1">
                        {message.recommendations.map((rec, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-1">
                  <Loader className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;