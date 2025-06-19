import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { supabase, getCurrentUser } from './lib/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === 'SIGNED_IN') {
          setShowAuthModal(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400 mx-auto mb-4"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-blue-400 opacity-20 mx-auto"></div>
            </div>
            <p className="text-blue-200 text-lg">Loading your therapy companion...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Router>
      <Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              color: '#e2e8f0',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage onGetStarted={handleGetStarted} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}
      </Layout>
    </Router>
  );
}

export default App;