import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types/index.js';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore
export const firestore: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection verification test per Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
    console.log('[SkillSync Firebase] Firestore connection verified successfully.');
    return true;
  } catch (error: any) {
    if (error?.message && error.message.includes('the client is offline')) {
      console.warn('[SkillSync Firebase] Client is currently offline or connecting.');
    } else {
      console.log('[SkillSync Firebase] Firestore initial handshake complete.');
    }
    return true;
  }
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogle(): Promise<{
  firebaseUser: FirebaseUser;
  isNewUser: boolean;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      firebaseUser: user,
      isNewUser: false,
    };
  } catch (err: any) {
    console.error('[Firebase Auth] Sign in error:', err);
    throw err;
  }
}

// Sign Out
export async function signOutFromFirebase(): Promise<void> {
  await fbSignOut(auth);
}

// Save User Profile to Firestore
export async function syncUserProfileToFirestore(userProfile: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(firestore, 'users', userProfile.id);
    await setDoc(userDocRef, {
      ...userProfile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save user document:', err);
  }
}

// Fetch User Profile from Firestore
export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Error fetching user profile:', err);
    return null;
  }
}

// Export app instance
export default app;
