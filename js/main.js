// Global variables
let isDarkMode = true;
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    if (isLoggedIn && currentUser) {
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    // Show user menu and hide get started button
    const um = document.getElementById('user-menu'); if (um) um.style.display = 'flex';
    const gs = document.getElementById('get-started-btn'); if (gs) gs.style.display = 'none';
    
    // Show protected navigation items
    const dn = document.getElementById('dashboard-nav'); if (dn) dn.style.display = 'block';
    const cn = document.getElementById('chat-nav'); if (cn) cn.style.display = 'block';
    const an = document.getElementById('activities-nav'); if (an) an.style.display = 'block';
    const en = document.getElementById('exercise-nav'); if (en) en.style.display = 'block';
    
    // Update user name
    const uname = document.getElementById('user-name'); if (uname && typeof currentUser !== 'undefined' && currentUser) uname.textContent = `Welcome, ${currentUser.name}!`;
}

function updateUIForLoggedOutUser() {
    // Hide user menu and show get started button
    const um = document.getElementById('user-menu'); if (um) um.style.display = 'none';
    const gs = document.getElementById('get-started-btn'); if (gs) gs.style.display = 'block';
    
    // Hide protected navigation items
    const dn = document.getElementById('dashboard-nav'); if (dn) dn.style.display = 'none';
    const cn = document.getElementById('chat-nav'); if (cn) cn.style.display = 'none';
    const an = document.getElementById('activities-nav'); if (an) an.style.display = 'none';
    const en = document.getElementById('exercise-nav'); if (en) en.style.display = 'none';
}

function logout() {
    // Clear login status
    isLoggedIn = false;
    currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateUIForLoggedOutUser();
    
    // Redirect to home (guarded)
    try { window.location.href = 'index.html'; } catch (e) { console.warn('Redirect failed', e); }
    
    alert('You have been logged out successfully!');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.getElementById('body');
    const navbar = document.getElementById('navbar');
    const themeIcon = document.getElementById('theme-icon');
    const logoText = document.getElementById('logo-text');
    
    if (isDarkMode) {
        if (body) body.className = 'min-h-screen transition-all duration-500 bg-gray-900 text-white';
        if (navbar) navbar.className = 'fixed top-0 w-full z-50 dark-glass';
        if (themeIcon) themeIcon.textContent = '☀️';
        if (logoText) logoText.className = 'text-xl font-bold text-white';
    } else {
        if (body) body.className = 'min-h-screen transition-all duration-500 bg-white text-gray-900';
        if (navbar) navbar.className = 'fixed top-0 w-full z-50 glass-effect';
        if (themeIcon) themeIcon.textContent = '🌙';
        if (logoText) logoText.className = 'text-xl font-bold text-gray-900';
    }
}
