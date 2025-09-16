// Firebase Configuration for Humanities Society Website
// This file initializes Firebase and exports the necessary services

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDGaZJ2kWedRhA2zjlevC36JQlniTNL6M",
  authDomain: "humanities-society.firebaseapp.com",
  projectId: "humanities-society",
  storageBucket: "humanities-society.firebasestorage.app",
  messagingSenderId: "899773870840",
  appId: "1:899773870840:web:32565ce93ec551e6f7010d",
  measurementId: "G-416SWGCC5Z"
};

try {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();
  
  // Export for use in other files
  window.db = db;
  
  // Test the connection
  console.log('Firebase initialized successfully');
  
  // Enable offline persistence
  db.enablePersistence()
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
      }
    });
    
} catch (error) {
  console.error('Firebase initialization error:', error);
  window.db = null;
}