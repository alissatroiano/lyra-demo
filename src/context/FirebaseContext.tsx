import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { ProcessedLesson } from '../types';

export interface SavedLesson extends ProcessedLesson {
  id: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: any | null;
  savedLessons: SavedLesson[];
  authLoading: boolean;
  dbLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  saveLessonToCloud: (lessonData: ProcessedLesson) => Promise<string>;
  deleteLessonFromCloud: (lessonId: string) => Promise<void>;
  loadLessons: () => Promise<void>;
  saveInstructorPreferences: (
    customPreferences: string,
    grade?: string,
    classSize?: string,
    duration?: string,
    tech?: string,
    instructorNotes?: string
  ) => Promise<void>;
  subscribeUser: (plan: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's saved lessons
  const loadLessons = async () => {
    if (!auth.currentUser) return;
    setDbLoading(true);
    setError(null);
    const path = 'lessons';
    try {
      const lessonsRef = collection(db, path);
      // Query user lessons by userId without requiring a composite index
      const q = query(
        lessonsRef, 
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const lessons: SavedLesson[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        lessons.push({
          ...data,
          id: docSnap.id // docSnap.id MUST come after ...data so the true Firestore document ID is never overwritten by data.id
        } as SavedLesson);
      });

      // Sort in-memory by createdAt descending
      lessons.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setSavedLessons(lessons);
    } catch (err: any) {
      console.error("Error loading lessons from Firestore:", err);
      handleFirestoreError(err, OperationType.LIST, path);
    } finally {
      setDbLoading(false);
    }
  };

  // Sync user profile state & create profile doc if needed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(true);
      
      if (currentUser) {
        const userDocPath = `users/${currentUser.uid}`;
        try {
          // Check if profile exists
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            // Profile must be verified if the email verification rule is active.
            // Let's force an email verified claim or handle gracefully.
            // Note: In development/preview environments, google logins are verified.
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Educator',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(docSnap.data());
          }
          
          // Load lessons once verified
          setAuthLoading(false);
          await loadLessons();
        } catch (err: any) {
          console.error("Error loading user profile from Firestore:", err);
          handleFirestoreError(err, OperationType.GET, userDocPath);
          setAuthLoading(false);
        }
      } else {
        setProfile(null);
        setSavedLessons([]);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Auth sign-in failed:", err);
      setError(err?.message || "Sign-in failed");
    }
  };

  const logOut = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout failed:", err);
      setError("Logout failed");
    }
  };

// Helper to compress base64 data URLs to smaller JPEGs using canvas
async function compressBase64Image(dataUrl: string, maxWidth = 500, quality = 0.5): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  // If it's already small (< 50KB), return as is
  if (dataUrl.length < 50000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
          return;
        }
      } catch (e) {
        console.warn('Canvas compression failed:', e);
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

// Prepare lesson document ensuring payload is safely under Firestore 1MB (1,048,576 bytes) limit
async function prepareLessonForFirestore(lessonData: ProcessedLesson, uid: string, lessonId: string) {
  let visuals = lessonData.generatedVisuals || [];
  
  // Compress any base64 images inside generatedVisuals
  const processedVisuals = await Promise.all(
    visuals.map(async (vis) => {
      if (vis.url && vis.url.startsWith('data:image/')) {
        const compressedUrl = await compressBase64Image(vis.url, 500, 0.5);
        return { ...vis, url: compressedUrl };
      }
      return vis;
    })
  );

  let newLessonDoc: any = {
    id: lessonId,
    userId: uid,
    lessonTitle: lessonData.lessonTitle || 'Untitled Lesson',
    duration: lessonData.duration || '45 minutes',
    summary: lessonData.summary || '',
    keyTakeaways: lessonData.keyTakeaways || [],
    slides: lessonData.slides || [],
    handsOnActivity: lessonData.handsOnActivity || { title: '', materials: [], steps: [], scientificPrinciple: '' },
    worksheet: lessonData.worksheet || { title: '', instructions: '', questions: [] },
    quiz: lessonData.quiz || [],
    mediaRecommendations: lessonData.mediaRecommendations || [],
    generatedVisuals: processedVisuals,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Calculate approximate byte size of JSON payload
  let jsonString = JSON.stringify(newLessonDoc);
  let payloadBytes = new Blob([jsonString]).size;

  // Maximum allowed size safety threshold: 750,000 bytes (safely below 1,048,576 B)
  const MAX_SAFE_BYTES = 750000;

  if (payloadBytes > MAX_SAFE_BYTES) {
    // Stage 1: Keep only the 2 most recent visuals if payload is still too large
    if (newLessonDoc.generatedVisuals.length > 2) {
      newLessonDoc.generatedVisuals = newLessonDoc.generatedVisuals.slice(0, 2);
    }
    jsonString = JSON.stringify(newLessonDoc);
    payloadBytes = new Blob([jsonString]).size;
  }

  if (payloadBytes > MAX_SAFE_BYTES) {
    // Stage 2: Replace any remaining huge base64 visuals with lightweight seed placeholders
    newLessonDoc.generatedVisuals = newLessonDoc.generatedVisuals.map((v: any, i: number) => {
      if (v.url && v.url.startsWith('data:image/')) {
        return {
          ...v,
          url: `https://picsum.photos/seed/${encodeURIComponent(newLessonDoc.lessonTitle + '-vis-' + i)}/800/450`
        };
      }
      return v;
    });
    jsonString = JSON.stringify(newLessonDoc);
    payloadBytes = new Blob([jsonString]).size;
  }

  if (payloadBytes > MAX_SAFE_BYTES) {
    // Stage 3: Trim any huge text fields if text content alone is massive
    if (newLessonDoc.summary && newLessonDoc.summary.length > 3000) {
      newLessonDoc.summary = newLessonDoc.summary.slice(0, 3000) + '...';
    }
    if (newLessonDoc.slides && newLessonDoc.slides.length > 12) {
      newLessonDoc.slides = newLessonDoc.slides.slice(0, 12);
    }
  }

  return newLessonDoc;
}

  const saveLessonToCloud = async (lessonData: ProcessedLesson): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error("You must be signed in to save lessons to the cloud.");
    }
    setDbLoading(true);
    setError(null);
    
    // Generate an alphanumeric ID for the lesson
    const lessonId = 'lesson_' + Math.random().toString(36).substring(2, 15);
    const lessonPath = `lessons/${lessonId}`;

    try {
      const newLessonDoc = await prepareLessonForFirestore(lessonData, auth.currentUser.uid, lessonId);
      await setDoc(doc(db, 'lessons', lessonId), newLessonDoc);
      // Reload lessons to get latest
      await loadLessons();
      return lessonId;
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, lessonPath);
      throw err;
    } finally {
      setDbLoading(false);
    }
  };

  const deleteLessonFromCloud = async (lessonId: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("You must be signed in to delete lessons.");
    }
    setDbLoading(true);
    setError(null);
    const lessonPath = `lessons/${lessonId}`;

    try {
      // Optimistically update local state first for instantaneous UI responsiveness
      setSavedLessons(prev => prev.filter(l => l.id !== lessonId));
      await deleteDoc(doc(db, 'lessons', lessonId));
      await loadLessons();
    } catch (err: any) {
      console.error("Error deleting lesson from Firestore:", err);
      // Reload lessons to restore state if deletion failed
      await loadLessons();
      handleFirestoreError(err, OperationType.DELETE, lessonPath);
      throw err;
    } finally {
      setDbLoading(false);
    }
  };

  const saveInstructorPreferences = async (
    customPreferences: string,
    grade?: string,
    classSize?: string,
    duration?: string,
    tech?: string,
    instructorNotes?: string
  ): Promise<void> => {
    if (!auth.currentUser) return;
    setDbLoading(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const updatedFields: any = {
        customPreferences,
        updatedAt: serverTimestamp()
      };
      if (grade !== undefined) updatedFields.grade = grade;
      if (classSize !== undefined) updatedFields.classSize = classSize;
      if (duration !== undefined) updatedFields.duration = duration;
      if (tech !== undefined) updatedFields.tech = tech;
      if (instructorNotes !== undefined) updatedFields.instructorNotes = instructorNotes;

      await setDoc(userDocRef, updatedFields, { merge: true });
      
      // Update local profile state
      setProfile((prev: any) => ({
        ...(prev || {}),
        ...updatedFields,
        uid: auth.currentUser ? auth.currentUser.uid : ''
      }));
    } catch (err: any) {
      console.error("Error saving instructor preferences:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      throw err;
    } finally {
      setDbLoading(false);
    }
  };

  const subscribeUser = async (plan: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("You must be signed in to subscribe.");
    }
    setDbLoading(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const updatedFields = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        displayName: auth.currentUser.displayName || 'Educator',
        isSubscribed: true,
        stripeSubscriptionPlan: plan,
        subscriptionDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(userDocRef, updatedFields, { merge: true });
      
      setProfile((prev: any) => ({
        ...(prev || {}),
        ...updatedFields,
        isSubscribed: true,
        stripeSubscriptionPlan: plan,
        uid: auth.currentUser ? auth.currentUser.uid : ''
      }));
    } catch (err: any) {
      console.error("Error updating subscription in Firestore:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      throw err;
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        profile,
        savedLessons,
        authLoading,
        dbLoading,
        error,
        signInWithGoogle,
        logOut,
        saveLessonToCloud,
        deleteLessonFromCloud,
        loadLessons,
        saveInstructorPreferences,
        subscribeUser
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
