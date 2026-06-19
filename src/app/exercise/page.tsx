'use client';

import React, { useState } from 'react';
import { useTheme } from '../ThemeProvider';

interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  durations: number[];
  color: string;
}

const ExercisePage = () => {
  const { theme } = useTheme();
  const [selectedDuration, setSelectedDuration] = useState<{[key: string]: number}>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const exercises: Exercise[] = [
    {
      id: 'breathing-478',
      name: '4-7-8 Breathing',
      description: 'A calming breath pattern to reduce anxiety and promote relaxation.',
      instructions: [
        'Inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts'
      ],
      durations: [1, 3, 5, 10],
      color: 'purple'
    },
    {
      id: 'body-scan',
      name: 'Body Scan Meditation',
      description: 'Progressive relaxation focusing on different parts of your body.',
      instructions: [
        'Lie down or sit comfortably',
        'Start at the top of your head and slowly scan down to your toes',
        'Notice any sensations without judgment'
      ],
      durations: [5, 10, 15, 20],
      color: 'blue'
    },
    {
      id: 'mindful-breathing',
      name: 'Mindful Breathing',
      description: 'Simple awareness of your natural breath rhythm.',
      instructions: [
        'Focus on your natural breathing',
        'Notice the breath entering and leaving your body',
        'Gently bring your attention back when your mind wanders'
      ],
      durations: [3, 5, 10, 15],
      color: 'teal'
    },
    {
      id: 'gratitude',
      name: 'Gratitude Meditation',
      description: 'Cultivate appreciation and positive emotions.',
      instructions: [
        'Think of three things you\'re grateful for',
        'Focus on the feeling of appreciation for those things',
        'Allow the positive feelings to fill your body'
      ],
      durations: [5, 10, 15],
      color: 'pink'
    }
  ];

  const startExercise = (exerciseId: string) => {
    const duration = selectedDuration[exerciseId];
    if (!duration) {
      alert('Please select a duration first');
      return;
    }

    setActiveExercise(exerciseId);
    setTimeRemaining(duration * 60); // Convert minutes to seconds
    setIsRunning(true);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setActiveExercise(null);
          alert('Exercise completed! Great job! 🎉');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setActiveExercise(null);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClasses = (color: string, variant: 'button' | 'bg' | 'hover' = 'button') => {
    const colorMap = {
      purple: {
        button: 'bg-purple-500 hover:bg-purple-600',
        bg: 'bg-purple-500',
        hover: 'hover:bg-purple-600'
      },
      blue: {
        button: 'bg-blue-500 hover:bg-blue-600',
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600'
      },
      teal: {
        button: 'bg-teal-500 hover:bg-teal-600',
        bg: 'bg-teal-500',
        hover: 'hover:bg-teal-600'
      },
      pink: {
        button: 'bg-pink-500 hover:bg-pink-600',
        bg: 'bg-pink-500',
        hover: 'hover:bg-pink-600'
      }
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.purple[variant];
  };
  return (
    <section id="exercise" className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mindful Exercises</h2>
          <p className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Take a moment to relax and recenter yourself with these guided exercises.
          </p>
        </div>

        {/* Timer Popup Modal */}
        {activeExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-2xl p-8 max-w-md w-full mx-4 text-center ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border shadow-xl'}`}>
              <div className="mb-6">
                <h3 className={`text-2xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {exercises.find(e => e.id === activeExercise)?.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Focus on your breathing and stay present
                </p>
              </div>
              
              {/* Circular Timer */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className={`${theme === 'dark' ? 'text-gray-700' : 'text-gray-200'}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    className="text-green-500 transition-all duration-1000"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * timeRemaining) / (selectedDuration[activeExercise] * 60)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {exercises.find(e => e.id === activeExercise)?.instructions.map((instruction, index) => (
                    <p key={index} className="flex items-center justify-center">
                      <span className="mr-2">•</span>
                      {instruction}
                    </p>
                  ))}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={stopExercise}
                  className="px-6 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Stop Exercise
                </button>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${
                    isRunning 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {exercises.map((exercise) => (
            <div 
              key={exercise.id}
              className={`rounded-3xl p-8 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border shadow-lg'
              } ${activeExercise === exercise.id ? 'ring-2 ring-green-500' : ''}`}
            >
              <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {exercise.name}
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {exercise.description}
              </p>
              
              <div className="mb-4">
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Duration:
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {exercise.durations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration({...selectedDuration, [exercise.id]: duration})}
                      className={`px-4 py-2 rounded-full text-white transition-colors ${
                        selectedDuration[exercise.id] === duration
                          ? getColorClasses(exercise.color, 'bg')
                          : `${getColorClasses(exercise.color, 'button')} opacity-70`
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  What you&apos;ll do:
                </span>
                <ul className={`list-disc list-inside mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => startExercise(exercise.id)}
                disabled={isRunning && activeExercise !== exercise.id}
                className={`w-full px-6 py-3 rounded-full font-semibold transition-all ${
                  activeExercise === exercise.id
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } ${
                  isRunning && activeExercise !== exercise.id
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {activeExercise === exercise.id ? 'Running...' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExercisePage;