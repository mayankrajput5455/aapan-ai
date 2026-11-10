import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { SidebarProvider } from './context/SidebarContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MusicToLyricsPage from './pages/MusicToLyricsPage';
import musicStageBg from './assets/music-stage-bg.jpg';

// Protected Route Guard: Redirects to /login if user is not authenticated
function ProtectedRoute({ children, message = 'कृपया इस सुविधा का उपयोग करने के लिए पहले लॉगिन करें।' }) {
  const { isAuthenticated, loading } = useAuth();
  const location = window.location.pathname;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-amber-400 font-bold">
        लोड हो रहा है...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: message
        }}
        replace
      />
    );
  }

  return children;
}

// Guest / Public Only Route Guard: Landing page and auth pages are only visible to non-logged-in users
function PublicOnlyRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-amber-400 font-bold">
        लोड हो रहा है...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

function HotkeyListener({ children }) {
  const { triggerAudioGuide, startListening, isListening, stopListening, toggleMute } = useVoice();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening((text) => {
            console.log('Spoken:', text);
          });
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        triggerAudioGuide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, triggerAudioGuide, toggleMute]);

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <VoiceProvider>
          <SidebarProvider>
            <HotkeyListener>
              <div className="flex flex-col min-h-screen bg-transparent text-white relative isolate">
                {/* Global Cinematic Dark Ambient Music Stage Background - Consistent Everywhere */}
                <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none select-none">
                  <img
                    src={musicStageBg}
                    alt="Cinematic Dark Music Concert Stage"
                    className="w-full h-full object-cover object-center scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/60"></div>
                  <div className="absolute inset-0 bg-radial-at-c from-rose-500/10 via-transparent to-black/80"></div>
                </div>

                <Sidebar />
                <Navbar />
                <main className="flex-grow">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PublicOnlyRoute>
                        <LandingPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicOnlyRoute>
                        <SignupPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute message="कृपया अपना डैशबोर्ड व सहेजे गए गाने देखने के लिए पहले लॉगिन करें।">
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lyrics"
                    element={
                      <ProtectedRoute message="कृपया संगीत से बोल स्टूडियो का उपयोग करने के लिए पहले लॉगिन करें। (Please login to continue)">
                        <MusicToLyricsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/reader/*" element={<Navigate to="/lyrics" replace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </HotkeyListener>
        </SidebarProvider>
      </VoiceProvider>
    </AuthProvider>
  </Router>
);
}
