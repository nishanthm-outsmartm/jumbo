import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import config from "./config";

const firebaseConfig = {
  apiKey: config.env.firebase.API_KEY,
  authDomain: `${config.env.firebase.PROJECT_ID}.firebaseapp.com`,
  projectId: config.env.firebase.PROJECT_ID,
  storageBucket: `${config.env.firebase.PROJECT_ID}.appspot.com`, // fixed line
  appId: config.env.firebase.APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
