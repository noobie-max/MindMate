// Safely derive storage key even if currentUser is undefined
const ACTIVITIES_USER_EMAIL = (typeof currentUser !== 'undefined' && currentUser && currentUser.email) ? currentUser.email : 'guest';
let userActivities = JSON.parse(localStorage.getItem(`userActivities_${ACTIVITIES_USER_EMAIL}`)) || [];

document.addEventListener('DOMContentLoaded', function() {
    updateRecentActivities();
});

function logExercise() {
    const type = document.getElementById('exercise-type').value;
    const duration = document.getElementById('exercise-duration').value;
    const intensity = document.getElementById('exercise-intensity').value;

    if (!type || !duration || !intensity) {
        alert('Please fill in all exercise fields');
        return;
    }

    const activity = {
        id: Date.now(),
        type: 'exercise',
        data: {
            exerciseType: type,
            duration: parseInt(duration),
            intensity: parseInt(intensity)
        },
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
    };

    userActivities.push(activity);
    saveUserData();
    updateRecentActivities();

    // Clear form
    document.getElementById('exercise-type').value = '';
    document.getElementById('exercise-duration').value = '';
    document.getElementById('exercise-intensity').value = '';

    alert('Exercise logged successfully!');
}

function logWork() {
    const hours = document.getElementById('work-hours').value;
    const stress = document.getElementById('work-stress').value;
    const productivity = document.getElementById('work-productivity').value;

    if (!hours || !stress || !productivity) {
        alert('Please fill in all work fields');
        return;
    }

    const activity = {
        id: Date.now(),
        type: 'work',
        data: {
            hours: parseFloat(hours),
            stress: parseInt(stress),
            productivity: parseInt(productivity)
        },
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
    };

    userActivities.push(activity);
    saveUserData();
    updateRecentActivities();

    // Clear form
    document.getElementById('work-hours').value = '';
    document.getElementById('work-stress').value = '';
    document.getElementById('work-productivity').value = '';

    alert('Work day logged successfully!');
}

function logWellness() {
    const sleepHours = document.getElementById('sleep-hours').value;
    const sleepQuality = document.getElementById('sleep-quality').value;
    const mood = document.getElementById('mood-rating').value;

    if (!sleepHours || !sleepQuality || !mood) {
        alert('Please fill in all wellness fields');
        return;
    }

    const activity = {
        id: Date.now(),
        type: 'wellness',
        data: {
            sleepHours: parseFloat(sleepHours),
            sleepQuality: parseInt(sleepQuality),
            mood: parseInt(mood)
        },
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
    };

    userActivities.push(activity);
    saveUserData();
    updateRecentActivities();

    // Clear form
    document.getElementById('sleep-hours').value = '';
    document.getElementById('sleep-quality').value = '';
    document.getElementById('mood-rating').value = '';

    alert('Wellness data logged successfully!');
}

function updateRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    const today = new Date().toDateString();
    const todayActivities = userActivities.filter(activity => activity.date === today);

    if (todayActivities.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <div class="text-4xl mb-4">📝</div>
                <p>No activities logged today. Start tracking your wellness journey!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = todayActivities.map(activity => {
        let icon, title, details;
        
        switch(activity.type) {
            case 'exercise':
                icon = '🏃';
                title = `${activity.data.exerciseType.charAt(0).toUpperCase() + activity.data.exerciseType.slice(1)} Exercise`;
                details = `${activity.data.duration} min • Intensity: ${activity.data.intensity}/10`;
                break;
            case 'work':
                icon = '💼';
                title = 'Work Session';
                details = `${activity.data.hours} hrs • Stress: ${activity.data.stress}/5 • Productivity: ${activity.data.productivity}/5`;
                break;
            case 'wellness':
                icon = '😴';
                title = 'Wellness Check';
                details = `Sleep: ${activity.data.sleepHours} hrs • Quality: ${activity.data.sleepQuality}/5 • Mood: ${activity.data.mood}/5`;
                break;
        }

        return `
            <div class="activity-card flex items-center space-x-4 p-4 bg-gray-800 rounded-xl">
                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-xl">
                    ${icon}
                </div>
                <div class="flex-1">
                    <p class="text-white font-medium">${title}</p>
                    <p class="text-gray-400 text-sm">${details}</p>
                    <p class="text-gray-500 text-xs">${new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
            </div>
        `;
    }).join('');
}

function saveUserData() {
    const userKey = `userActivities_${ACTIVITIES_USER_EMAIL}`;
    localStorage.setItem(userKey, JSON.stringify(userActivities));
}
