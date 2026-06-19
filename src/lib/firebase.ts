
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAr7TRtRn9pyEY-2Ozfi_WVMfZycmezgao",
    authDomain: "zenaura-be56a.firebaseapp.com",
    projectId: "zenaura-be56a",
    storageBucket: "zenaura-be56a.firebasestorage.app",
    messagingSenderId: "192202468637",
    appId: "1:192202468637:web:8ec8cf27b062606a0e45f4"
};

// Initialize Firebase
console.log('Initializing Firebase...');
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized successfully');
console.log('Auth:', auth);
console.log('Firestore:', db);

export { app, auth, db };
