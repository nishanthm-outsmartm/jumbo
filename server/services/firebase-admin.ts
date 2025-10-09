import admin from "firebase-admin";
import { serverConfig as config } from "@shared/config/server.config";

const serviceAccount = {
  projectId: config.env.firebase.projectId,
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
