import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, IS_DUMMY_MODE } from '../lib/firebase';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    if (IS_DUMMY_MODE) {
      const savedUser = localStorage.getItem('dummy_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Sync with our backend profile
            const res = await userApi.getProfile();
            setUser({ ...firebaseUser, ...res.data });
          } catch (error: any) {
            let message = error.message;
            try {
              const parsed = JSON.parse(error.message);
              if (parsed.error) message = parsed.error;
            } catch (e) {}
            console.error("Profile sync error:", message);
            setUser(firebaseUser);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      setLoading(false);
      return;
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  const login = async (data: any) => {
    if (IS_DUMMY_MODE) {
      const dummyUser = {
        uid: 'dummy-uid-123',
        email: data.email || 'dummy@example.com',
        displayName: 'Dummy User',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dummy',
      };
      setUser(dummyUser);
      localStorage.setItem('dummy_user', JSON.stringify(dummyUser));
      toast.success('Logged in successfully (Dummy Mode)');
      return true;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast.success('Logged in successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (data: any) => {
    if (IS_DUMMY_MODE) {
      const dummyUser = {
        uid: 'dummy-uid-123',
        email: data.email,
        displayName: data.name,
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + data.name,
      };
      setUser(dummyUser);
      localStorage.setItem('dummy_user', JSON.stringify(dummyUser));
      toast.success('Registered successfully (Dummy Mode)');
      return true;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Create profile in our backend/firestore
      await userApi.updateProfile({ name: data.name, email: data.email });
      toast.success('Registered successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    if (IS_DUMMY_MODE) {
      setUser(null);
      localStorage.removeItem('dummy_user');
      toast.success('Logged out (Dummy Mode)');
      return;
    }

    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const loginWithGoogle = async () => {
    if (IS_DUMMY_MODE) {
      const dummyUser = {
        uid: 'dummy-google-uid',
        email: 'google-user@example.com',
        displayName: 'Google Test User',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Google',
      };
      setUser(dummyUser);
      localStorage.setItem('dummy_user', JSON.stringify(dummyUser));
      toast.success('Logged in with Google (Dummy Mode)');
      return true;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
      return false;
    }
  };

  return { user, loading, login, register, logout, loginWithGoogle };
}
