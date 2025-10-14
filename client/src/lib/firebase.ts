import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { clientConfig as config } from "@shared/config/client.config";

const firebaseConfig = {
  apiKey: config.env.firebase.apiKey,
  authDomain: `${config.env.firebase.projectId}.firebaseapp.com`,
  projectId: config.env.firebase.projectId,
  storageBucket: `${config.env.firebase.projectId}.firebasestorage.app`,
  appId: config.env.firebase.appId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
