
'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

const HomePage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} id="body">
      {/* Home Section */}
      <section id="home" className={`min-h-screen pt-16 ${theme === 'dark' ? 'dark-gradient' : 'light-gradient'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center fade-in">
            <div className="floating-animation mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 flex items-center justify-center text-6xl pulse-glow">
                🧠
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Welcome to MindMate
            </h1>
            
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Your AI-powered mental wellness companion. Get personalized support, track your mood, practice mindfulness, and build healthier habits - all in a secure, empathetic environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105">
                Start Your Journey
              </Link>
              <Link href="/features" className="border-2 border-purple-400 text-purple-400 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-400 hover:text-white transition-all">
                Learn More
              </Link>
            </div>
            
            {/* Feature Cards Preview */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className={`feature-card rounded-2xl p-6 text-center transition-all hover:transform hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border shadow-lg'
              }`}>
                <div className="text-4xl mb-4">💬</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Chatbot</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Empathetic conversations with advanced AI</p>
              </div>
              <div className={`feature-card rounded-2xl p-6 text-center transition-all hover:transform hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border shadow-lg'
              }`}>
                <div className="text-4xl mb-4">📊</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Tracking</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Monitor your wellness journey with detailed insights</p>
              </div>
              <div className={`feature-card rounded-2xl p-6 text-center transition-all hover:transform hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border shadow-lg'
              }`}>
                <div className="text-4xl mb-4">🧘</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mindfulness</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Guided meditation and breathing exercises</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
