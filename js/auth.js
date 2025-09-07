let isSignupMode = false;

function toggleAuthMode() {
    isSignupMode = !isSignupMode;
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchBtn = document.getElementById('auth-switch-btn');

    if (isSignupMode) {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        authTitle.textContent = 'Join MindMate';
        authSubtitle.textContent = 'Create your account to start your wellness journey';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchBtn.textContent = 'Sign in';
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to continue your wellness journey';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchBtn.textContent = 'Sign up';
    }
}

function signUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Use Firebase Auth to create user
    FirebaseApp.onReady(async () => {
        try {
            const userCredential = await FirebaseApp.auth.createUserWithEmailAndPassword(email, password);
            // Save display name
            await userCredential.user.updateProfile({ displayName: name });

            // Mirror into local app state for compatibility
            const userData = { name, email, uid: userCredential.user.uid, joinDate: new Date().toISOString() };
            isLoggedIn = true;
            currentUser = userData;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(userData));

            alert('Account created successfully! Welcome to MindMate');
            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error('SignUp error', err);
            alert(err.message || 'Sign up failed');
        }
    });
}

function signIn() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    FirebaseApp.onReady(async () => {
        try {
            const userCredential = await FirebaseApp.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            const userData = { name: user.displayName || '', email: user.email, uid: user.uid };
            isLoggedIn = true;
            currentUser = userData;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(userData));
            alert('Login successful! Welcome back to MindMate');
            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error('SignIn error', err);
            alert(err.message || 'Sign in failed');
        }
    });
}

// Keep local UI in sync with Firebase Auth state
FirebaseApp.onReady(() => {
    FirebaseApp.auth.onAuthStateChanged(user => {
        if (user) {
            const userData = { name: user.displayName || '', email: user.email, uid: user.uid };
            isLoggedIn = true;
            currentUser = userData;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(userData));
            // Update UI if available
            try { updateUIForLoggedInUser(); } catch (e) {}
        } else {
            isLoggedIn = false;
            currentUser = null;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            try { updateUIForLoggedOutUser(); } catch (e) {}
        }
    });
});