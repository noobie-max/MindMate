'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../AuthProvider';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where, deleteDoc, getDocs } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: any;
  sessionId: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: any;
}

const ChatPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions
  useEffect(() => {
    if (!user) return;

    const sessionsQuery = query(
      collection(db, 'chatSessions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      
      // Sort client-side to avoid index requirements
      const sortedSessions = sessionsData.sort((a, b) => {
        const aTime = a.updatedAt?.toDate()?.getTime() || 0;
        const bTime = b.updatedAt?.toDate()?.getTime() || 0;
        return bTime - aTime;
      });
      
      setSessions(sortedSessions);
      
      // If no current session, create or select the first one
      if (!currentSessionId && sessionsData.length > 0) {
        setCurrentSessionId(sessionsData[0].id);
      } else if (!currentSessionId && sessionsData.length === 0) {
        createNewSession();
      }
    });

    return () => unsubscribe();
  }, [user, currentSessionId]);

  // Load messages for current session
  useEffect(() => {
    if (!currentSessionId) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('sessionId', '==', currentSessionId)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Sort client-side to avoid index requirements
      const sortedMessages = messagesData.sort((a, b) => {
        const aTime = a.timestamp?.toDate()?.getTime() || 0;
        const bTime = b.timestamp?.toDate()?.getTime() || 0;
        return aTime - bTime;
      });
      
      setMessages(sortedMessages);
    });

    return () => unsubscribe();
  }, [currentSessionId]);

  const generateChatTitle = (userMessage: string) => {
    // Get current date for the title
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Extract first few words from the message (max 4 words)
    const words = userMessage.trim().split(' ').slice(0, 4);
    let title = words.join(' ');
    
    // Truncate if too long
    if (title.length > 25) {
      title = title.substring(0, 25) + '...';
    }
    
    // Combine with date
    return `${title} - ${dateStr}`;
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const sessionDoc = await addDoc(collection(db, 'chatSessions'), {
        userId: user.uid,
        title: 'New Chat',
        lastMessage: 'Chat started',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      setCurrentSessionId(sessionDoc.id);
      
      // Add welcome message
      await addDoc(collection(db, 'messages'), {
        sessionId: sessionDoc.id,
        text: "Hello! I'm MindMate, your AI wellness companion. I'm here to support your mental health journey. How are you feeling today?",
        sender: 'ai',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Get recent chat history for context
      const recentMessages = messages.slice(-6);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: recentMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback response
      return "I apologize, but I'm having trouble processing your message right now. However, I want you to know that I'm here to support you. Your feelings and experiences matter. Is there anything specific you'd like to talk about regarding your mental wellness?";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId || !user) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    try {
      // Check if this is the first user message in the session to rename it
      const isFirstMessage = messages.filter(m => m.sender === 'user').length === 0;
      
      // Add user message
      await addDoc(collection(db, 'messages'), {
        sessionId: currentSessionId,
        text: userMessage,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // Update session with last message and rename if it's the first user message
      const updateData: any = {
        lastMessage: userMessage,
        updatedAt: serverTimestamp()
      };
      
      if (isFirstMessage) {
        updateData.title = generateChatTitle(userMessage);
      }

      await updateDoc(doc(db, 'chatSessions', currentSessionId), updateData);

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage);

      // Add AI response
      setTimeout(async () => {
        await addDoc(collection(db, 'messages'), {
          sessionId: currentSessionId,
          text: aiResponse,
          sender: 'ai',
          timestamp: serverTimestamp()
        });

        await updateDoc(doc(db, 'chatSessions', currentSessionId), {
          lastMessage: aiResponse,
          updatedAt: serverTimestamp()
        });

        setIsLoading(false);
      }, 1000); // Simulate AI thinking time

    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const sendQuickResponse = async (message: string) => {
    if (!currentSessionId || !user) return;

    setIsLoading(true);

    try {
      // Check if this is the first user message in the session to rename it
      const isFirstMessage = messages.filter(m => m.sender === 'user').length === 0;
      
      // Add user message
      await addDoc(collection(db, 'messages'), {
        sessionId: currentSessionId,
        text: message,
        sender: 'user',
        timestamp: serverTimestamp()
      });

      // Update session with last message and rename if it's the first user message
      const updateData: any = {
        lastMessage: message,
        updatedAt: serverTimestamp()
      };
      
      if (isFirstMessage) {
        updateData.title = generateChatTitle(message);
      }

      await updateDoc(doc(db, 'chatSessions', currentSessionId), updateData);

      // Generate AI response
      const aiResponse = await generateAIResponse(message);

      // Add AI response
      setTimeout(async () => {
        await addDoc(collection(db, 'messages'), {
          sessionId: currentSessionId,
          text: aiResponse,
          sender: 'ai',
          timestamp: serverTimestamp()
        });

        await updateDoc(doc(db, 'chatSessions', currentSessionId), {
          lastMessage: aiResponse,
          updatedAt: serverTimestamp()
        });

        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending quick response:', error);
      setIsLoading(false);
    }
  };

  const deleteChat = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all messages in the session
      const messagesQuery = query(
        collection(db, 'messages'),
        where('sessionId', '==', sessionId)
      );
      
      const messageSnapshot = await onSnapshot(messagesQuery, async (snapshot) => {
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      });

      // Delete the session
      await deleteDoc(doc(db, 'chatSessions', sessionId));

      // If this was the current session, clear it
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }

    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  const clearAllChats = async () => {
    if (!confirm('Are you sure you want to delete ALL chats? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all user's sessions and their messages
      const deletePromises = [];
      
      for (const session of sessions) {
        // Delete the session document
        deletePromises.push(deleteDoc(doc(db, 'chatSessions', session.id)));
        
        // Delete all messages for this session
        const messagesQuery = query(
          collection(db, 'chatMessages'),
          where('sessionId', '==', session.id)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        messagesSnapshot.docs.forEach((messageDoc: any) => {
          deletePromises.push(deleteDoc(doc(db, 'chatMessages', messageDoc.id)));
        });
      }
      
      await Promise.all(deletePromises);
      
      // Clear current session and state
      setCurrentSessionId(null);
      setMessages([]);
      console.log('All chats cleared successfully');

    } catch (error) {
      console.error('Error clearing all chats:', error);
      alert('Failed to clear all chats');
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Please Log In</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>You need to be logged in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <section id="chat" className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex h-[700px] gap-4">
          {/* Sidebar for chat sessions */}
          <div className={`w-1/3 rounded-3xl p-6 flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border shadow-lg'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chat History</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={createNewSession}
                  className="text-purple-400 hover:text-purple-600 font-medium text-sm"
                >
                  New Chat
                </button>
                {sessions.length > 0 && (
                  <button 
                    onClick={clearAllChats}
                    className="text-red-400 hover:text-red-600 font-medium text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group p-3 rounded-lg transition-colors flex items-center justify-between ${
                    currentSessionId === session.id
                      ? 'bg-purple-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div 
                    onClick={() => setCurrentSessionId(session.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium text-sm truncate">{session.title}</div>
                    <div className="text-xs opacity-75 truncate">{session.lastMessage}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(session.id);
                    }}
                    className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`w-2/3 rounded-3xl flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border shadow-lg'}`}>
            {/* Chat Header */}
            <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  🧠
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>MindMate AI</h3>
                  <p className="text-green-400 text-sm">Online • Ready to help</p>
                </div>
              </div>
              <button className={`text-red-400 hover:text-red-600 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
                Clear Chat
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-purple-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Quick Response Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => sendQuickResponse("I feel stressed 😰")}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  I feel stressed 😰
                </button>
                <button
                  onClick={() => sendQuickResponse("Great day 😊")}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Great day 😊
                </button>
                <button
                  onClick={() => sendQuickResponse("Need motivation 💪")}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Need motivation 💪
                </button>
                <button
                  onClick={() => sendQuickResponse("Feeling anxious 😟")}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Feeling anxious 😟
                </button>
              </div>

              {/* Message Input */}
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Share how you're feeling..."
                  className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPage;