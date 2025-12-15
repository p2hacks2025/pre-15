// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDpiNPBwa9rhbrP5dwZqRE4f5PiKrXHFYo",
    authDomain: "gyoganlens-2ce04.firebaseapp.com",
    projectId: "gyoganlens-2ce04",
    storageBucket: "gyoganlens-2ce04.firebasestorage.app",
    messagingSenderId: "365669302808",
    appId: "1:365669302808:web:f538fcd503a957a647796d",
    measurementId: "G-CK5TS8GBYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);