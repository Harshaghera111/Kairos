import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

let app;
let db: any;
let auth: any;
let isUsingMock = false;

try {
  // Check if real config is valid (not mock placeholder keys)
  const isMockConfig = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('mock-api-key');
  if (isMockConfig) {
    console.warn("Firebase config has mock credentials. Operating in sandbox local persistence storage mode.");
    isUsingMock = true;
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
} catch (error) {
  console.warn("Unable to initialize real Firebase client. Switching gracefully to mock mode:", error);
  isUsingMock = true;
}

export { db, auth, isUsingMock };

// Verification check on load
if (!isUsingMock && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. Client is offline.");
      }
    }
  };
  testConnection();
}

/**
 * Handle Firestore errors according to security guidance specs.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Popup provider helper
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (isUsingMock) {
    // Generate a beautiful mock user session
    return {
      user: {
        uid: 'mock-judge-uid',
        email: 'judge@hackathon.com',
        displayName: 'Hackathon Judge',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      } as unknown as User
    };
  }
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Google Auth popup failed:", error);
    throw error;
  }
}

export async function logOut() {
  if (isUsingMock) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
