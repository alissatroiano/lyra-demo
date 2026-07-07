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
      // Query user lessons ordered by createdAt descending
      const q = query(
        lessonsRef, 
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const lessons: SavedLesson[] = [];
      querySnapshot.forEach((docSnap) => {
        lessons.push({
          id: docSnap.id,
          ...docSnap.data()
        } as SavedLesson);
      });
      setSavedLessons(lessons);
    } catch (err: any) {
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

  const saveLessonToCloud = async (lessonData: ProcessedLesson): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error("You must be signed in to save lessons to the cloud.");
    }
    setDbLoading(true);
    setError(null);
    
    // Generate an alphanumeric ID for the lesson
    const lessonId = 'lesson_' + Math.random().toString(36).substring(2, 15);
    const lessonPath = `lessons/${lessonId}`;

    const newLessonDoc = {
      id: lessonId,
      userId: auth.currentUser.uid,
      lessonTitle: lessonData.lessonTitle || 'Untitled Lesson',
      duration: lessonData.duration || '45 minutes',
      summary: lessonData.summary || '',
      keyTakeaways: lessonData.keyTakeaways || [],
      slides: lessonData.slides || [],
      handsOnActivity: lessonData.handsOnActivity || { title: '', materials: [], steps: [], scientificPrinciple: '' },
      worksheet: lessonData.worksheet || { title: '', instructions: [], questions: [] },
      quiz: lessonData.quiz || [],
      mediaRecommendations: lessonData.mediaRecommendations || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
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
      await deleteDoc(doc(db, 'lessons', lessonId));
      await loadLessons();
    } catch (err: any) {
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
        saveInstructorPreferences
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
