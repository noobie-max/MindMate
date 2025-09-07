// Firebase initialization helper (plain JS)
// Replace the config values with your Firebase project config.

// Usage: include this script before other js files that need Firebase.

(function(global) {
    const FirebaseApp = {
        initialized: false,
        init(config) {
            if (this.initialized) return;
            // Load Firebase scripts dynamically
            const script1 = document.createElement('script');
            script1.src = 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js';
            script1.onload = () => {
                const script2 = document.createElement('script');
                script2.src = 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js';
                script2.onload = () => {
                    const script3 = document.createElement('script');
                    script3.src = 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js';
                    script3.onload = () => {
                        window.firebase.initializeApp(config);
                        this.auth = window.firebase.auth();
                        this.db = window.firebase.firestore();
                        this.initialized = true;
                        if (this._onReady) this._onReady();
                    };
                    document.head.appendChild(script3);
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script1);
        },
        onReady(cb) {
            if (this.initialized) cb(); else this._onReady = cb;
        }
    };

    global.FirebaseApp = FirebaseApp;
})(window);
