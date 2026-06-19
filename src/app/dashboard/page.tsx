'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../AuthProvider';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';

interface Activity {
  id: string;
  userId: string;
  type: 'exercise' | 'work' | 'wellness' | 'mood';
  date: Timestamp;
  data: any;
  createdAt: Timestamp;
}

interface DashboardStats {
  todayMood: number;
  todayExercise: number;
  todaySleep: number;
  todayStress: number;
  weeklyExercise: number;
  weeklySleep: number;
  moodTrends: Array<{ date: string; mood: number }>;
  healthScore: number;
}

// Custom Dialog Component
const CustomDialog = ({ isOpen, onClose, title, message, type = 'info', onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'confirm';
  onConfirm?: () => void;
}) => {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'confirm': return '❓';
      default: return 'ℹ️';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success': return 'from-green-500 to-green-600';
      case 'error': return 'from-red-500 to-red-600';
      case 'confirm': return 'from-purple-500 to-blue-500';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-2xl p-6 max-w-md w-mx-4 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-xl'}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">{getIcon()}</div>
          <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {message}
          </p>
          <div className="flex gap-3 justify-center">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-lg text-white bg-gradient-to-r ${getButtonColor()} hover:shadow-lg transition-all`}
                >
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg text-white bg-gradient-to-r ${getButtonColor()} hover:shadow-lg transition-all`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Activity {
  id: string;
  userId: string;
  type: 'exercise' | 'work' | 'wellness' | 'mood';
  date: Timestamp;
  data: any;
  createdAt: Timestamp;
}

interface DashboardStats {
  todayMood: number;
  todayExercise: number;
  todaySleep: number;
  todayStress: number;
  weeklyExercise: number;
  weeklySleep: number;
  moodTrends: Array<{ date: string; mood: number }>;
  healthScore: number;
}

const DashboardPage = () => {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  
  // All useState hooks must be declared before any conditional returns
  const [stats, setStats] = useState<DashboardStats>({
    todayMood: 0,
    todayExercise: 0,
    todaySleep: 0,
    todayStress: 0,
    weeklyExercise: 0,
    weeklySleep: 0,
    moodTrends: [],
    healthScore: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [moodNote, setMoodNote] = useState<string>('');
  const [isLoggingMood, setIsLoggingMood] = useState(false);
  
  // Custom dialog state
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'error' | 'confirm',
    onConfirm: undefined as (() => void) | undefined
  });

  // Custom goals state
  const [weeklyGoals, setWeeklyGoals] = useState({
    exercise: 150, // Default WHO recommendation
    sleep: 56 // Default 8hrs * 7 days
  });
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  const [tempGoals, setTempGoals] = useState({ exercise: 150, sleep: 56 });

  // Load user activities - must be before any conditional returns
  useEffect(() => {
    if (!user) return;

    // Simple query without date range and orderBy to avoid index requirements
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      

      // Filter and sort client-side to avoid index requirements
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivities = activitiesData
        .filter(activity => activity.date.toDate() >= sevenDaysAgo)
        .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
      
      setActivities(recentActivities);
      calculateStats(recentActivities);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const calculateStats = (activities: Activity[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's stats
    const todayActivities = activities.filter(
      activity => activity.date.toDate().toDateString() === today.toDateString()
    );

    let todayMood = 0;
    let todayExercise = 0;
    let todaySleep = 0;
    let todayStress = 0;

    // Sort activities by creation time to get the most recent mood
    const sortedTodayActivities = todayActivities.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      }
      return 0;
    });

    console.log('Sorted today activities:', sortedTodayActivities);

    sortedTodayActivities.forEach(activity => {
      console.log('Processing activity:', activity.type, activity.data, activity.date.toDate().toDateString());
      switch (activity.type) {
        case 'wellness':
          // Only update mood if we haven't found a more recent mood entry
          if (todayMood === 0) {
            todayMood = activity.data.mood || 0;
            console.log('Updated mood from wellness:', todayMood);
          }
          todaySleep = activity.data.sleepHours || 0;
          break;
        case 'mood':
          // Only update mood if we haven't found a more recent mood entry
          if (todayMood === 0) {
            todayMood = activity.data.mood || 0;
            console.log('Updated mood from mood activity:', todayMood);
          }
          break;
        case 'exercise':
          todayExercise += activity.data.duration || 0;
          break;
        case 'work':
          todayStress = activity.data.stressLevel || 0;
          break;
      }
    });

    console.log('Today mood calculated:', todayMood);

    // Weekly stats
    let weeklyExercise = 0;
    let weeklySleep = 0;
    const moodTrends: Array<{ date: string; mood: number }> = [];

    // Group activities by date for trends
    const activityByDate = activities.reduce((acc, activity) => {
      const dateStr = activity.date.toDate().toDateString();
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);

    Object.entries(activityByDate).forEach(([dateStr, dayActivities]) => {
      let dailyMood = 0;
      let dailySleep = 0;
      let dailyExercise = 0;

      // Sort activities by creation time to get the most recent mood
      const sortedDayActivities = dayActivities.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        }
        return 0;
      });

      let moodFound = false;

      console.log(`Processing date ${dateStr}, activities:`, sortedDayActivities);

      sortedDayActivities.forEach(activity => {
        switch (activity.type) {
          case 'wellness':
            // Only update mood if we haven't found a more recent mood entry
            if (!moodFound && activity.data.mood && activity.data.mood > 0) {
              dailyMood = activity.data.mood;
              moodFound = true;
              console.log(`Found mood ${dailyMood} for date ${dateStr} from wellness`);
            }
            dailySleep += activity.data.sleepHours || 0;
            break;
          case 'mood':
            // Only update mood if we haven't found a more recent mood entry
            if (!moodFound && activity.data.mood && activity.data.mood > 0) {
              dailyMood = activity.data.mood;
              moodFound = true;
              console.log(`Found mood ${dailyMood} for date ${dateStr} from mood activity`);
            }
            break;
          case 'exercise':
            dailyExercise += activity.data.duration || 0;
            break;
        }
      });

      weeklyExercise += dailyExercise;
      weeklySleep += dailySleep;

      if (dailyMood > 0) {
        console.log(`Adding mood trend: ${dateStr} -> ${dailyMood}`);
        moodTrends.push({
          date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mood: dailyMood
        });
      }
    });

    // Sort mood trends by date (most recent first)
    moodTrends.sort((a, b) => {
      const dateA = new Date(a.date + ', 2025');
      const dateB = new Date(b.date + ', 2025');
      return dateB.getTime() - dateA.getTime();
    });

    console.log('Final mood trends:', moodTrends);
    console.log('Final today mood:', todayMood);

    // Calculate health score based on various factors
    const exerciseScore = Math.min((weeklyExercise / weeklyGoals.exercise) * 100, 100);
    const sleepScore = Math.min((weeklySleep / weeklyGoals.sleep) * 100, 100);
    const moodScore = todayMood * 20; // Scale mood to 0-100
    const stressScore = Math.max(100 - (todayStress * 20), 0); // Lower stress = higher score

    const healthScore = Math.round((exerciseScore + sleepScore + moodScore + stressScore) / 4);

    const finalStats = {
      todayMood,
      todayExercise,
      todaySleep,
      todayStress,
      weeklyExercise,
      weeklySleep,
      moodTrends: moodTrends.slice(-7).reverse(), // Last 7 days
      healthScore,
      weeklyGoals,
      insights: []
    };

    console.log('Setting final stats:', finalStats);

    setStats(finalStats);
  };

  const _generateInsights = (data: Omit<DashboardStats, 'moodTrends'>) => {
    const insights: string[] = [];

    if (data.weeklyExercise >= 150) {
      insights.push("Great job! You've met your weekly exercise goal. Keep up the excellent work!");
    } else if (data.weeklyExercise >= 100) {
      insights.push("You're doing well with exercise! Try to add a few more minutes to reach your weekly goal.");
    } else {
      insights.push("Consider adding more physical activity to your routine. Even 10 minutes a day makes a difference!");
    }

    if (data.weeklySleep >= 49) { // 7 hours average
      insights.push("Your sleep schedule has been consistent. Quality sleep is crucial for mental health!");
    } else {
      insights.push("Try to prioritize sleep. Aim for 7-8 hours per night for optimal wellness.");
    }

    if (data.todayMood >= 4) {
      insights.push("Your mood has been positive! Celebrate these good moments and reflect on what contributed to them.");
    } else if (data.todayMood === 3) {
      insights.push("Your mood is neutral today. Consider activities that usually boost your spirits.");
    } else if (data.todayMood > 0) {
      insights.push("If you're feeling down, remember that it's okay. Consider reaching out to friends or engaging in self-care activities.");
    }

    if (data.todayStress >= 4) {
      insights.push("Your stress levels seem high today. Try some breathing exercises or meditation to help you relax.");
    } else if (data.todayStress <= 2) {
      insights.push("Great stress management! Whatever you're doing to stay calm is working well.");
    }

    if (data.healthScore >= 80) {
      insights.push("Excellent overall wellness! You're doing a fantastic job maintaining your health.");
    } else if (data.healthScore >= 60) {
      insights.push("Good wellness progress! Focus on the areas where you can improve most.");
    } else {
      insights.push("Your wellness journey is just beginning. Small, consistent changes will make a big impact!");
    }

    setInsights(insights.slice(0, 3)); // Show top 3 insights
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['❓', '😢', '😞', '😐', '😊', '😄'];
    return emojis[mood] || '😐';
  };

  const getStressLevel = (stress: number) => {
    const levels = ['None', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return levels[stress] || 'None';
  };

  const getStressColor = (stress: number) => {
    if (stress <= 2) return 'text-green-400';
    if (stress === 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Dialog helper functions
  const showDialog = (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm' = 'info', onConfirm?: () => void) => {
    setDialog({ isOpen: true, title, message, type, onConfirm });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const logMood = async () => {
    if (!user || selectedMood === 0) {
      showDialog('Mood Required', 'Please select a mood to log', 'error');
      return;
    }

    setIsLoggingMood(true);
    try {
      await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        type: 'mood',
        date: Timestamp.fromDate(new Date()),
        data: {
          mood: selectedMood,
          note: moodNote
        },
        createdAt: serverTimestamp()
      });

      setSelectedMood(0);
      setMoodNote('');
      console.log('Mood logged successfully with value:', selectedMood);
      showDialog('Success!', `Your ${getMoodText(selectedMood).toLowerCase()} mood has been logged successfully!`, 'success');
    } catch (error) {
      console.error('Error logging mood:', error);
      showDialog('Error', 'Failed to log mood. Please try again.', 'error');
    }
    setIsLoggingMood(false);
  };

  const getMoodText = (mood: number) => {
    const moodTexts = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
    return moodTexts[mood] || 'Unknown';
  };

  const getMoodColor = (mood: number) => {
    const colors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-green-400'];
    return colors[mood] || 'text-gray-400';
  };

  // Goal setting functions
  const saveGoals = () => {
    setWeeklyGoals(tempGoals);
    setShowGoalSetting(false);
    showDialog('Goals Updated!', `New goals set: Exercise ${tempGoals.exercise} min/week, Sleep ${tempGoals.sleep} hrs/week`, 'success');
  };

  const resetGoals = () => {
    const defaultGoals = { exercise: 150, sleep: 56 };
    setTempGoals(defaultGoals);
    setWeeklyGoals(defaultGoals);
    setShowGoalSetting(false);
    showDialog('Goals Reset', 'Goals have been reset to WHO recommended values', 'info');
  };

  if (!user) {
    return (
      <div className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Please Log In</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>You need to be logged in to view your dashboard.</p>
        </div>
      </div>
    );
  }
  
  return (
    <section id="dashboard" className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-8">
          <h2 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Wellness Dashboard</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Track your mental health journey with comprehensive insights</p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            🎯 Log your mood here and track exercise/wellness activities on the Activities page.
          </p>
        </div>

        {/* Quick Mood Logger */}
        <div className={`rounded-3xl p-6 mb-8 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-800/50 to-blue-800/50 border border-gray-700' : 'bg-gradient-to-r from-purple-50 to-blue-50 border shadow-lg'}`}>
          <h3 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quick Mood Check-in</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>How are you feeling right now?</p>
              <div className="flex space-x-3 mb-4">
                {[1, 2, 3, 4, 5].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`text-4xl p-2 rounded-lg transition-all hover:scale-110 ${
                      selectedMood === mood 
                        ? theme === 'dark' ? 'bg-purple-600 shadow-lg' : 'bg-purple-100 shadow-md'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {getMoodEmoji(mood)}
                  </button>
                ))}
              </div>
              {selectedMood > 0 && (
                <p className={`text-sm font-medium ${getMoodColor(selectedMood)}`}>
                  {getMoodText(selectedMood)}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Optional note (What&apos;s affecting your mood?)
              </label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="E.g., had a great meeting, feeling stressed about deadlines..."
                className={`w-full px-3 py-2 border rounded-lg resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                rows={3}
              />
              <button
                onClick={logMood}
                disabled={selectedMood === 0 || isLoggingMood}
                className="mt-3 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoggingMood ? 'Logging...' : 'Log Mood'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Summary */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl border'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Today&apos;s Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Mood</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xl">{getMoodEmoji(stats.todayMood)}</span>
                  <span className={`text-xs ${getMoodColor(stats.todayMood)}`}>
                    {stats.todayMood > 0 ? getMoodText(stats.todayMood) : 'Not logged'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Exercise</span>
                <span className="text-green-400 font-semibold text-sm">
                  {stats.todayExercise > 0 ? `${stats.todayExercise} min` : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Sleep</span>
                <span className="text-blue-400 font-semibold text-sm">
                  {stats.todaySleep > 0 ? `${stats.todaySleep} hrs` : 'Not logged'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Stress</span>
                <span className={`font-semibold text-sm ${getStressColor(stats.todayStress)}`}>
                  {getStressLevel(stats.todayStress)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Progress - Enhanced */}
          <div className={`lg:col-span-2 rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl border'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weekly Progress</h3>
              <button
                onClick={() => {
                  setTempGoals(weeklyGoals);
                  setShowGoalSetting(true);
                }}
                className="text-purple-400 hover:text-purple-600 text-sm font-medium"
              >
                ⚙️ Customize Goals
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Exercise Goal</span>
                  <span className="text-green-400 font-semibold text-sm">{stats.weeklyExercise}/{weeklyGoals.exercise} min</span>
                </div>
                <div className={`w-full rounded-full h-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-gradient-to-r from-green-400 to-teal-500 h-3 rounded-full transition-all duration-500" 
                    style={{width: `${Math.min((stats.weeklyExercise / weeklyGoals.exercise) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((stats.weeklyExercise / weeklyGoals.exercise) * 100)}% complete
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Sleep Goal</span>
                  <span className="text-blue-400 font-semibold text-sm">{stats.weeklySleep.toFixed(1)}/{weeklyGoals.sleep} hrs</span>
                </div>
                <div className={`w-full rounded-full h-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500" 
                    style={{width: `${Math.min((stats.weeklySleep / weeklyGoals.sleep) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((stats.weeklySleep / weeklyGoals.sleep) * 100)}% complete
                </p>
              </div>
              <div className="md:col-span-2 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Weekly Mood Average</span>
                  <span className="text-purple-400 font-semibold text-sm">
                    {stats.moodTrends.length > 0 
                      ? `${(stats.moodTrends.reduce((sum, trend) => sum + trend.mood, 0) / stats.moodTrends.length).toFixed(1)}/5`
                      : 'No data'
                    }
                  </span>
                </div>
                <div className={`w-full rounded-full h-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500" 
                    style={{
                      width: stats.moodTrends.length > 0 
                        ? `${((stats.moodTrends.reduce((sum, trend) => sum + trend.mood, 0) / stats.moodTrends.length) / 5) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl border'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Health Score</h3>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    fill="transparent" 
                    className={`${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}
                  />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeLinecap="round" 
                    className="text-purple-500 transition-all duration-1000" 
                    strokeDasharray="251.33" 
                    strokeDashoffset={251.33 - (251.33 * stats.healthScore) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.healthScore}
                  </span>
                </div>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Overall Wellness</p>
              <p className={`text-xs font-medium ${
                stats.healthScore >= 80 ? 'text-green-400' :
                stats.healthScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats.healthScore >= 80 ? 'Excellent' :
                 stats.healthScore >= 60 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Mood Trends */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl border'}`}>
            <h3 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mood Trends (Last 7 Days)</h3>
            {stats.moodTrends.length > 0 ? (
              <div className="space-y-4">
                {stats.moodTrends.slice(-7).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {trend.date}
                      </span>
                      <span className="text-xl">{getMoodEmoji(trend.mood)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${getMoodColor(trend.mood)}`}>
                        {getMoodText(trend.mood)}
                      </span>
                      <div className={`w-20 h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{width: `${(trend.mood / 5) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-sm">
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Weekly Average:</span>
                    <span className={`font-semibold ${getMoodColor(Math.round(stats.moodTrends.reduce((sum, trend) => sum + trend.mood, 0) / stats.moodTrends.length))}`}>
                      {getMoodText(Math.round(stats.moodTrends.reduce((sum, trend) => sum + trend.mood, 0) / stats.moodTrends.length))}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📈</div>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Start logging your mood to see trends and patterns over time.
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Use the mood check-in above to get started!
                </p>
              </div>
            )}
          </div>
          
          {/* Activity Statistics */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl border'}`}>
            <h3 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Overview</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🏃</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Exercise</span>
                  </div>
                  <p className="text-xl font-bold text-green-400">{stats.weeklyExercise}</p>
                  <p className="text-xs text-gray-500">minutes this week</p>
                </div>
                <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">😴</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Sleep</span>
                  </div>
                  <p className="text-xl font-bold text-blue-400">{stats.weeklySleep.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">hours this week</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📝</span>
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Activities Logged</span>
                  </div>
                  <span className="text-purple-400 font-semibold">{activities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Goals Achieved</span>
                  </div>
                  <span className="text-yellow-400 font-semibold">
                    {(stats.weeklyExercise >= 150 ? 1 : 0) + (stats.weeklySleep >= 56 ? 1 : 0)}/2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">�</span>
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Streak Days</span>
                  </div>
                  <span className="text-orange-400 font-semibold">
                    {Math.min(activities.length, 7)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl border'}`}>
          <h3 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Health Insights</h3>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`rounded-xl p-4 border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30' 
                      : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        {insight}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`rounded-xl p-4 border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Start logging your activities to receive personalized AI insights about your wellness journey!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goal Setting Modal */}
        {showGoalSetting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-2xl p-6 max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-xl'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🎯 Customize Your Weekly Goals
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Exercise Goal (minutes per week)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="500"
                    value={tempGoals.exercise}
                    onChange={(e) => setTempGoals({...tempGoals, exercise: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">WHO recommends 150 minutes/week</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sleep Goal (hours per week)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="70"
                    value={tempGoals.sleep}
                    onChange={(e) => setTempGoals({...tempGoals, sleep: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 56 hours/week (8 hours/day)</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGoalSetting(false)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={resetGoals}
                  className="px-4 py-2 rounded-lg border border-yellow-500 text-yellow-500 hover:bg-yellow-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={saveGoals}
                  className="flex-1 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all"
                >
                  Save Goals
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Dialog */}
        <CustomDialog
          isOpen={dialog.isOpen}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          onConfirm={dialog.onConfirm}
        />
      </div>
    </section>
  );
};

export default DashboardPage;