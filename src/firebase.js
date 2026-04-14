import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCho7k9DhoxU_fVllP0ORhtqaOSYa1Bzm8",
  authDomain: "timesheet-tracker-8a69c.firebaseapp.com",
  databaseURL:
    "https://timesheet-tracker-8a69c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "timesheet-tracker-8a69c",
  storageBucket: "timesheet-tracker-8a69c.firebasestorage.app",
  messagingSenderId: "879347061785",
  appId: "1:879347061785:web:efec8fc3f302f4430d8688",
};

const app = initializeApp(firebaseConfig);

// ✅ EXPORT SERVICES
export const auth = getAuth(app);
export const db = getDatabase(app);