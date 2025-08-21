import admin from "firebase-admin";
import config from "@/lib/config";

const serviceAccount = {
  projectId: config.env.firebase.PROJECT_ID,
  privateKey: config.env.firebase.privateKey?.replace(/\\n/g, "\n"),
  clientEmail: config.env.firebase.clientEmail,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const auth = admin.auth();
export default admin;
