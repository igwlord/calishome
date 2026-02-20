// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Reemplaza con la configuración de tu proyecto 'CalisHome' de la consola de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "calishome-XXXXX.firebaseapp.com",
  projectId: "calishome-XXXXX",
  storageBucket: "calishome-XXXXX.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
