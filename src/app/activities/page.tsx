'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../AuthProvider';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp, deleteDoc, doc } from 'firebase/firestore';

interface Activity {
  id: string;
  userId: string;
  type: 'exercise' | 'work' | 'wellness' | 'mood';
  date: Timestamp;
  data: any;
  createdAt: Timestamp;
}

const ActivitiesPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Exercise form states
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseIntensity, setExerciseIntensity] = useState('');

  // Work form states
  const [workHours, setWorkHours] = useState('');
  const [workStress, setWorkStress] = useState('');
  const [workProductivity, setWorkProductivity] = useState('');

  // Wellness form states
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [moodRating, setMoodRating] = useState('');

  // Load activities for current user
  useEffect(() => {
    if (!user) return;

    // Simple query without orderBy to avoid index requirements
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      
      // Filter to show only today's activities (excluding mood-only activities) and sort client-side
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActivities = activitiesData
        .filter(activity => {
          const activityDate = activity.date.toDate();
          activityDate.setHours(0, 0, 0, 0);
          // Exclude mood-only activities from the activities page
          return activityDate.getTime() === today.getTime() && activity.type !== 'mood';
        })
        .sort((a, b) => b.createdAt?.toDate()?.getTime() - a.createdAt?.toDate()?.getTime());
      
      setActivities(todayActivities);
    });

    return () => unsubscribe();
  }, [user]);

  const logExercise = async () => {
    if (!user || !exerciseType || !exerciseDuration || !exerciseIntensity) {
      alert('Please fill in all exercise fields');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        type: 'exercise',
        date: Timestamp.fromDate(new Date()),
        data: {
          exerciseType,
          duration: parseInt(exerciseDuration),
          intensity: parseInt(exerciseIntensity)
        },
        createdAt: serverTimestamp()
      });

      // Reset form
      setExerciseType('');
      setExerciseDuration('');
      setExerciseIntensity('');
      
      alert('Exercise logged successfully!');
    } catch (error) {
      console.error('Error logging exercise:', error);
      alert('Failed to log exercise');
    }
    setIsLoading(false);
  };

  const logWork = async () => {
    if (!user || !workHours || !workStress || !workProductivity) {
      alert('Please fill in all work fields');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        type: 'work',
        date: Timestamp.fromDate(new Date()),
        data: {
          hours: parseFloat(workHours),
          stressLevel: parseInt(workStress),
          productivity: parseInt(workProductivity)
        },
        createdAt: serverTimestamp()
      });

      // Reset form
      setWorkHours('');
      setWorkStress('');
      setWorkProductivity('');
      
      alert('Work day logged successfully!');
    } catch (error) {
      console.error('Error logging work:', error);
      alert('Failed to log work day');
    }
    setIsLoading(false);
  };

  const logWellness = async () => {
    if (!user || !sleepHours || !sleepQuality || !moodRating) {
      alert('Please fill in all wellness fields');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'activities'), {
        userId: user.uid,
        type: 'wellness',
        date: Timestamp.fromDate(new Date()),
        data: {
          sleepHours: parseFloat(sleepHours),
          sleepQuality: parseInt(sleepQuality),
          mood: parseInt(moodRating)
        },
        createdAt: serverTimestamp()
      });

      // Reset form
      setSleepHours('');
      setSleepQuality('');
      setMoodRating('');
      
      alert('Wellness data logged successfully!');
    } catch (error) {
      console.error('Error logging wellness:', error);
      alert('Failed to log wellness data');
    }
    setIsLoading(false);
  };

  const formatActivityTime = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return 'Unknown time';
    }
    return timestamp.toDate().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exercise': return '🏃';
      case 'work': return '💼';
      case 'wellness': return '😴';
      default: return '📝';
    }
  };

  const getStressLevel = (level: number) => {
    const levels = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Very High'];
    return levels[level] || 'Unknown';
  };

  const getProductivityLevel = (level: number) => {
    const levels = ['', 'Very Low', 'Low', 'Average', 'High', 'Very High'];
    return levels[level] || 'Unknown';
  };

  const getSleepQuality = (quality: number) => {
    const qualities = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return qualities[quality] || 'Unknown';
  };

  const getMoodText = (mood: number) => {
    const moods = ['', 'Very Sad 😢', 'Sad 😞', 'Neutral 😐', 'Happy 😊', 'Very Happy 😄'];
    return moods[mood] || 'Unknown';
  };

  const deleteActivity = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'activities', activityId));
      console.log('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity');
    }
  };

  const clearAllActivities = async () => {
    if (!window.confirm('Are you sure you want to delete ALL activities? This action cannot be undone.')) {
      return;
    }

    try {
      const deletePromises = activities.map(activity => 
        deleteDoc(doc(db, 'activities', activity.id))
      );
      await Promise.all(deletePromises);
      console.log('All activities deleted successfully');
    } catch (error) {
      console.error('Error deleting activities:', error);
      alert('Failed to delete all activities');
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Please Log In</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>You need to be logged in to track activities.</p>
        </div>
      </div>
    );
  }
  return (
    <section id="activities" className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-8">
          <h2 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Activity Tracker</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Log and monitor your daily activities for better health insights</p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            💡 Mood tracking is available on the Dashboard. This page focuses on exercise, work, and wellness activities.
          </p>
        </div>

        {/* Activity Input Forms */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Exercise Tracker */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-lg'}`}>
            <h3 className={`text-2xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className="mr-3">🏃</span>Exercise
            </h3>
            <div className="space-y-4">
              <select 
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Exercise</option>
                <option value="running">Running</option>
                <option value="walking">Walking</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="yoga">Yoga</option>
                <option value="weightlifting">Weight Lifting</option>
                <option value="cardio">Cardio</option>
              </select>
              <input 
                type="number" 
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
                placeholder="Duration (minutes)" 
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <input 
                type="number" 
                value={exerciseIntensity}
                onChange={(e) => setExerciseIntensity(e.target.value)}
                placeholder="Intensity (1-10)" 
                min="1" 
                max="10" 
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button 
                onClick={logExercise}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Logging...' : 'Log Exercise'}
              </button>
            </div>
          </div>

          {/* Work Tracker */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-lg'}`}>
            <h3 className={`text-2xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className="mr-3">💼</span>Work
            </h3>
            <div className="space-y-4">
              <input 
                type="number" 
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="Hours worked" 
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <select 
                value={workStress}
                onChange={(e) => setWorkStress(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Stress Level</option>
                <option value="1">Very Low</option>
                <option value="2">Low</option>
                <option value="3">Moderate</option>
                <option value="4">High</option>
                <option value="5">Very High</option>
              </select>
              <select 
                value={workProductivity}
                onChange={(e) => setWorkProductivity(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Productivity</option>
                <option value="1">Very Low</option>
                <option value="2">Low</option>
                <option value="3">Average</option>
                <option value="4">High</option>
                <option value="5">Very High</option>
              </select>
              <button 
                onClick={logWork}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Logging...' : 'Log Work Day'}
              </button>
            </div>
          </div>

          {/* Sleep & Wellness */}
          <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-lg'}`}>
            <h3 className={`text-2xl font-semibold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className="mr-3">😴</span>Sleep & Wellness
            </h3>
            <div className="space-y-4">
              <input 
                type="number" 
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="Sleep hours" 
                step="0.5" 
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <select 
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Sleep Quality</option>
                <option value="1">Poor</option>
                <option value="2">Fair</option>
                <option value="3">Good</option>
                <option value="4">Very Good</option>
                <option value="5">Excellent</option>
              </select>
              <select 
                value={moodRating}
                onChange={(e) => setMoodRating(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Overall Mood</option>
                <option value="1">Very Sad 😢</option>
                <option value="2">Sad 😞</option>
                <option value="3">Neutral 😐</option>
                <option value="4">Happy 😊</option>
                <option value="5">Very Happy 😄</option>
              </select>
              <button 
                onClick={logWellness}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? 'Logging...' : 'Log Wellness'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-lg'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Today&apos;s Activities</h3>
            {activities.length > 0 && (
              <button 
                onClick={clearAllActivities}
                className="text-red-400 hover:text-red-600 font-medium text-sm"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No activities logged today. Start tracking your wellness journey!
                </p>
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`group p-4 rounded-xl border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                      <div>
                        <h4 className={`font-semibold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {activity.type}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatActivityTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {activity.type === 'exercise' && (
                          <div>
                            <p><strong>Type:</strong> {activity.data.exerciseType}</p>
                            <p><strong>Duration:</strong> {activity.data.duration} mins</p>
                            <p><strong>Intensity:</strong> {activity.data.intensity}/10</p>
                          </div>
                        )}
                        {activity.type === 'work' && (
                          <div>
                            <p><strong>Hours:</strong> {activity.data.hours}</p>
                            <p><strong>Stress:</strong> {getStressLevel(activity.data.stressLevel)}</p>
                            <p><strong>Productivity:</strong> {getProductivityLevel(activity.data.productivity)}</p>
                          </div>
                        )}
                        {activity.type === 'wellness' && (
                          <div>
                            <p><strong>Sleep:</strong> {activity.data.sleepHours} hours</p>
                            <p><strong>Quality:</strong> {getSleepQuality(activity.data.sleepQuality)}</p>
                            <p><strong>Mood:</strong> {getMoodText(activity.data.mood)}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Delete activity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesPage;