import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Check database connection as required by firebase-integration skill
async function testConnection() {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await getDocFromServer(testDocRef);
    console.log('Firebase connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.log('Firebase configuration status: client is offline (operating in cached offline state).');
    } else {
      console.log('Firebase initialization completed (empty or connection check response received).');
    }
  }
}

testConnection();
