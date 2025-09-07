document.addEventListener('DOMContentLoaded', () => {
    const exercisePlayer = document.getElementById('exercise-player');
    const playerTitle = document.getElementById('player-title');
    const playerVisualizer = document.getElementById('player-visualizer');
    const playerText = document.getElementById('player-text');
    const playerTimer = document.getElementById('player-timer');
    const playerInstructions = document.getElementById('player-instructions');
    const closePlayerBtn = document.getElementById('close-player-btn');

    const exercises = {
        breathing: {
            title: '4-7-8 Breathing',
            instructions: 'Inhale for 4s, hold for 7s, exhale for 8s.',
            phases: ['Breathe In', 'Hold', 'Breathe Out'],
            durations: [4, 7, 8]
        },
        bodyscan: {
            title: 'Body Scan Meditation',
            instructions: 'Bring gentle awareness to each part of your body, from your toes to your head.'
        },
        mindfulbreathing: {
            title: 'Mindful Breathing',
            instructions: 'Focus on the natural rhythm of your breath without trying to change it.'
        },
        gratitude: {
            title: 'Gratitude Meditation',
            instructions: 'Focus on things you are grateful for and allow the positive feelings to fill you.'
        }
    };

    let selectedDuration = 60; // Default duration
    let timerInterval = null;
    let breathingPhase = 0;
    let breathingPhaseTimer = null;

    const durationBtns = document.querySelectorAll('.duration-btn');
    if (durationBtns && durationBtns.length) {
        durationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedDuration = parseInt(btn.dataset.duration);
                // Optional: Add a visual indicator for selected duration
                document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('ring-2', 'ring-purple-400'));
                btn.classList.add('ring-2', 'ring-purple-400');
            });
        });
    }

    const startBtns = document.querySelectorAll('.start-exercise-btn');
    if (startBtns && startBtns.length) {
        startBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const exercise = btn.dataset.exercise;
                startExercise(exercise, selectedDuration);
            });
        });
    }

    function startExercise(exerciseKey, duration) {
        const exerciseData = exercises[exerciseKey];
        openPlayer(exerciseData, duration);
    }

    function openPlayer(exerciseData, duration) {
    if (playerTitle) playerTitle.textContent = exerciseData.title;
    if (playerInstructions) playerInstructions.textContent = exerciseData.instructions;
    if (exercisePlayer) exercisePlayer.classList.remove('hidden');

        if (exerciseData.phases) {
            if (playerVisualizer) {
                playerVisualizer.style.display = 'flex';
                runBreathingCycle(exerciseData.phases, exerciseData.durations);
            }
        } else {
            playerVisualizer.style.display = 'none';
        }

    startTimer(duration);
    }

    function startTimer(duration) {
        let timeLeft = duration;
        updateTimerDisplay(timeLeft);

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);
            if (timeLeft <= 0) {
                closePlayer();
            }
        }, 1000);
    }

    function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    if (playerTimer) playerTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function runBreathingCycle(phases, durations) {
        breathingPhase = 0;
        const nextPhase = () => {
                if (playerText) playerText.textContent = phases[breathingPhase];
            const phaseDuration = durations[breathingPhase] * 1000;

                if (breathingPhase === 0) { // Inhale
                    if (playerVisualizer) playerVisualizer.style.transform = 'scale(1.2)';
                } else if (breathingPhase === 2) { // Exhale
                    if (playerVisualizer) playerVisualizer.style.transform = 'scale(1.0)';
                }

            breathingPhase = (breathingPhase + 1) % phases.length;
            breathingPhaseTimer = setTimeout(nextPhase, phaseDuration);
        };
        nextPhase();
    }

    function closePlayer() {
        clearInterval(timerInterval);
        clearTimeout(breathingPhaseTimer);
        timerInterval = null;
        breathingPhaseTimer = null;
        if (exercisePlayer) exercisePlayer.classList.add('hidden');
    }

    if (closePlayerBtn) closePlayerBtn.addEventListener('click', closePlayer);
});