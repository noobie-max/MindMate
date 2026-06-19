
'use client';

import React from 'react';
import { useTheme } from '../ThemeProvider';

const FeaturesPage = () => {
  const { theme } = useTheme();
  
  return (
    <section id="features" className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Powerful Features</h2>
          <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive mental wellness tools designed to support your journey to better mental health
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Feature 1 */}
          <div className={`rounded-3xl p-8 fade-in ${theme === 'dark' ? 'dark-glass' : 'bg-white shadow-xl border'}`}>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-2xl mr-4">
                🔐
              </div>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Secure Authentication</h3>
            </div>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Two-factor authentication with email OTP, secure password storage, and GDPR-compliant data handling.</p>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>• Email OTP verification</li>
              <li>• Encrypted password storage</li>
              <li>• Session management</li>
            </ul>
          </div>
          
          {/* Feature 2 */}
          <div className={`rounded-3xl p-8 fade-in ${theme === 'dark' ? 'dark-glass' : 'bg-white shadow-xl border'}`}>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-2xl mr-4">
                💬
              </div>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Advanced AI Chatbot</h3>
            </div>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Intelligent conversations with context awareness, emotion detection, and personalized therapeutic responses.</p>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>• Context-aware conversations</li>
              <li>• Emotion analysis</li>
              <li>• Therapeutic techniques</li>
            </ul>
          </div>
          
          {/* Feature 3 */}
          <div className={`rounded-3xl p-8 fade-in ${theme === 'dark' ? 'dark-glass' : 'bg-white shadow-xl border'}`}>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-teal-500 flex items-center justify-center text-2xl mr-4">
                🏃
              </div>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Tracking</h3>
            </div>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Comprehensive tracking of exercise, work habits, sleep patterns, and wellness activities.</p>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>• Exercise logging</li>
              <li>• Work productivity tracking</li>
              <li>• Sleep analysis</li>
            </ul>
          </div>
          
          {/* Feature 4 */}
          <div className={`rounded-3xl p-8 fade-in ${theme === 'dark' ? 'dark-glass' : 'bg-white shadow-xl border'}`}>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-2xl mr-4">
                📊
              </div>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Health Analytics</h3>
            </div>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>AI-powered insights analyzing your activities, mood patterns, and providing personalized recommendations.</p>
            <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>• Pattern recognition</li>
              <li>• Health correlations</li>
              <li>• Predictive insights</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesPage;
