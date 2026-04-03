import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCOtUDhG_Sk6ewi8CRBHYNJVwtWy-pWYh0",
  authDomain: "fivlia-quick-commerce.firebaseapp.com",
  projectId: "fivlia-quick-commerce",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;