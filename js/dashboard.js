const DASH_USER_EMAIL = (typeof currentUser !== 'undefined' && currentUser && currentUser.email) ? currentUser.email : 'guest';
let userActivities = JSON.parse(localStorage.getItem(`userActivities_${DASH_USER_EMAIL}`)) || [];

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    initializeCharts();
    generateAIInsights();
});

function updateDashboard() {
    const today = new Date().toDateString();
    const todayActivities = userActivities.filter(activity => activity.date === today);
    
    // Update today's summary
    let todayMood = '😐';
    let todayExercise = 0;
    let todaySleep = 0;
    let todayStress = '-';

    todayActivities.forEach(activity => {
        switch(activity.type) {
            case 'exercise':
                todayExercise += activity.data.duration;
                break;
            case 'wellness':
                todaySleep = activity.data.sleepHours;
                const moodEmojis = ['😢', '😞', '😐', '😊', '😄'];
                todayMood = moodEmojis[activity.data.mood - 1] || '😐';
                break;
            case 'work':
                const stressLevels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
                todayStress = stressLevels[activity.data.stress - 1] || '-';
                break;
        }
    });

    const dMood = document.getElementById('today-mood'); if (dMood) dMood.textContent = todayMood;
    const dExercise = document.getElementById('today-exercise'); if (dExercise) dExercise.textContent = `${todayExercise} min`;
    const dSleep = document.getElementById('today-sleep'); if (dSleep) dSleep.textContent = `${todaySleep} hrs`;
    const dStress = document.getElementById('today-stress'); if (dStress) dStress.textContent = todayStress;

    // Update weekly progress
    const weekActivities = getWeekActivities();
    const weeklyExercise = weekActivities.reduce((total, activity) => {
        return activity.type === 'exercise' ? total + activity.data.duration : total;
    }, 0);
    const weeklySleep = weekActivities.reduce((total, activity) => {
        return activity.type === 'wellness' ? total + activity.data.sleepHours : total;
    }, 0);

    const exProg = document.getElementById('exercise-progress'); if (exProg) exProg.textContent = `${weeklyExercise}/150 min`;
    const slProg = document.getElementById('sleep-progress'); if (slProg) slProg.textContent = `${weeklySleep}/56 hrs`;
    
    const exercisePercent = Math.min((weeklyExercise / 150) * 100, 100);
    const sleepPercent = Math.min((weeklySleep / 56) * 100, 100);
    
    const exBar = document.getElementById('exercise-bar'); if (exBar) exBar.style.width = `${exercisePercent}%`;
    const slBar = document.getElementById('sleep-bar'); if (slBar) slBar.style.width = `${sleepPercent}%`;

    // Update health score
    const healthScore = calculateHealthScore();
    const hsEl = document.getElementById('health-score'); if (hsEl) hsEl.textContent = healthScore;
    updateHealthScoreRing(healthScore);
}

function calculateHealthScore() {
    const weekActivities = getWeekActivities();
    let score = 0;
    let factors = 0;

    // Exercise factor (0-30 points)
    const weeklyExercise = weekActivities.reduce((total, activity) => {
        return activity.type === 'exercise' ? total + activity.data.duration : total;
    }, 0);
    score += Math.min((weeklyExercise / 150) * 30, 30);
    factors++;

    // Sleep factor (0-25 points)
    const sleepActivities = weekActivities.filter(a => a.type === 'wellness');
    if (sleepActivities.length > 0) {
        const avgSleep = sleepActivities.reduce((total, activity) => total + activity.data.sleepHours, 0) / sleepActivities.length;
        score += Math.min((avgSleep / 8) * 25, 25);
        factors++;
    }

    // Mood factor (0-25 points)
    if (sleepActivities.length > 0) {
        const avgMood = sleepActivities.reduce((total, activity) => total + activity.data.mood, 0) / sleepActivities.length;
        score += (avgMood / 5) * 25;
        factors++;
    }

    // Work stress factor (0-20 points, inverted)
    const workActivities = weekActivities.filter(a => a.type === 'work');
    if (workActivities.length > 0) {
        const avgStress = workActivities.reduce((total, activity) => total + activity.data.stress, 0) / workActivities.length;
        score += (1 - (avgStress - 1) / 4) * 20;
        factors++;
    }

    return factors > 0 ? Math.round(score / factors * (100/25)) : 0;
}

function updateHealthScoreRing(score) {
    const ring = document.getElementById('health-score-ring');
    const circumference = 2 * Math.PI * 56;
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDashoffset = offset;
}

function getWeekActivities() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return userActivities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= oneWeekAgo;
    });
}

function generateAIInsights() {
    const insights = [];
    const weekActivities = getWeekActivities();
    
    // Exercise insights
    const exerciseActivities = weekActivities.filter(a => a.type === 'exercise');
    const totalExercise = exerciseActivities.reduce((total, activity) => total + activity.data.duration, 0);
    
    if (totalExercise >= 150) {
        insights.push({
            icon: '🎉',
            title: 'Exercise Goal Achieved!',
            message: `Congratulations! You've completed ${totalExercise} minutes of exercise this week, exceeding the recommended 150 minutes.`
        });
    } else if (totalExercise > 0) {
        insights.push({
            icon: '💪',
            title: 'Keep Moving!',
            message: `You've exercised for ${totalExercise} minutes this week. Try to add ${150 - totalExercise} more minutes to reach your weekly goal.`
        });
    }

    // Sleep insights
    const sleepActivities = weekActivities.filter(a => a.type === 'wellness');
    if (sleepActivities.length > 0) {
        const avgSleep = sleepActivities.reduce((total, activity) => total + activity.data.sleepHours, 0) / sleepActivities.length;
        if (avgSleep < 7) {
            insights.push({
                icon: '😴',
                title: 'Sleep More',
                message: `Your average sleep is ${avgSleep.toFixed(1)} hours. Try to get 7-9 hours for optimal mental health.`
            });
        } else {
            insights.push({
                icon: '✨',
                title: 'Great Sleep Habits!',
                message: `You're averaging ${avgSleep.toFixed(1)} hours of sleep. Keep up the good work!`
            });
        }
    }

    // Mood insights
    if (sleepActivities.length > 0) {
        const avgMood = sleepActivities.reduce((total, activity) => total + activity.data.mood, 0) / sleepActivities.length;
        if (avgMood >= 4) {
            insights.push({
                icon: '😊',
                title: 'Positive Mood Trend',
                message: 'Your mood has been consistently positive. Keep doing what makes you happy!'
            });
        } else if (avgMood <= 2) {
            insights.push({
                icon: '🤗',
                title: 'Mood Support',
                message: 'I notice your mood has been lower lately. Consider talking to someone or trying some mindfulness exercises.'
            });
        }
    }

    // Work-life balance insights
    const workActivities = weekActivities.filter(a => a.type === 'work');
    if (workActivities.length > 0) {
        const avgHours = workActivities.reduce((total, activity) => total + activity.data.hours, 0) / workActivities.length;
        const avgStress = workActivities.reduce((total, activity) => total + activity.data.stress, 0) / workActivities.length;
        
        if (avgHours > 9) {
            insights.push({
                icon: '⚖️',
                title: 'Work-Life Balance',
                message: `You're averaging ${avgHours.toFixed(1)} work hours daily. Consider setting boundaries for better work-life balance.`
            });
        }
        
        if (avgStress >= 4) {
            insights.push({
                icon: '🧘',
                title: 'Stress Management',
                message: 'Your work stress levels are high. Try some breathing exercises or short breaks during work.'
            });
        }
    }

    // Update insights display
    const container = document.getElementById('ai-insights');
    if (!container) return;
    if (insights.length === 0) {
        container.innerHTML = `
            <div class="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
                <div class="flex items-start space-x-3">
                    <div class="text-2xl">🧠</div>
                    <div>
                        <h4 class="text-white font-semibold mb-2">Keep Logging Activities</h4>
                        <p class="text-gray-300">Log more activities to receive personalized AI insights about your health patterns.</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = insights.map(insight => `
            <div class="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
                <div class="flex items-start space-x-3">
                    <div class="text-2xl">${insight.icon}</div>
                    <div>
                        <h4 class="text-white font-semibold mb-2">${insight.title}</h4>
                        <p class="text-gray-300">${insight.message}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function initializeCharts() {
    // Mood Chart
    const moodCtx = document.getElementById('moodChart');
    if (moodCtx) {
        const moodData = getLast7DaysMoodData();
        new Chart(moodCtx, {
            type: 'line',
            data: {
                labels: moodData.labels,
                datasets: [{
                    label: 'Mood',
                    data: moodData.data,
                    borderColor: 'rgb(147, 51, 234)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Activity Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        const activityData = getActivitySummary();
        new Chart(activityCtx, {
            type: 'doughnut',
            data: {
                labels: ['Exercise', 'Work', 'Sleep', 'Other'],
                datasets: [{
                    data: activityData,
                    backgroundColor: [
                        'rgb(34, 197, 94)',
                        'rgb(59, 130, 246)',
                        'rgb(147, 51, 234)',
                        'rgb(156, 163, 175)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }
}

function getLast7DaysMoodData() {
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayActivities = userActivities.filter(activity => 
            activity.date === dateString && activity.type === 'wellness'
        );
        
        if (dayActivities.length > 0) {
            const avgMood = dayActivities.reduce((total, activity) => total + activity.data.mood, 0) / dayActivities.length;
            data.push(avgMood);
        } else {
            data.push(null);
        }
    }
    
    return { labels, data };
}

function getActivitySummary() {
    const weekActivities = getWeekActivities();
    const exerciseTime = weekActivities.filter(a => a.type === 'exercise').reduce((total, a) => total + a.data.duration, 0);
    const workTime = weekActivities.filter(a => a.type === 'work').reduce((total, a) => total + a.data.hours, 0) * 60;
    const sleepTime = weekActivities.filter(a => a.type === 'wellness').reduce((total, a) => total + a.data.sleepHours, 0) * 60;
    
    return [exerciseTime, workTime, sleepTime, 100]; // Other activities placeholder
}
