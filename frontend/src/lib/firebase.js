import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase config object
// You can get this from the Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyDZbVtdN74EYlFZ4nguXLukX_-X-NNJeOQ",
    authDomain: "antiproject-36b6f.firebaseapp.com",
    projectId: "antiproject-36b6f",
    storageBucket: "antiproject-36b6f.firebasestorage.app",
    messagingSenderId: "792815007480",
    appId: "1:792815007480:web:bbd86109028a2b48352d0d",
    measurementId: "G-YWY77FC66J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
