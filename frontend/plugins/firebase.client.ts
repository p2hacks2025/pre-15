// frontend/plugins/firebase.client.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; <--- 削除

// Your web app's Firebase configuration
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
const db = getFirestore(app);
// const auth = getAuth(app); <--- 削除

// Nuxt アプリケーション全体で Firebase インスタンスを利用可能にする
export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            firestore: db,
            // auth: auth, <--- 削除
        },
    };
});