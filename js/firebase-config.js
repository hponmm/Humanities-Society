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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Export for use in other files
window.db = db;