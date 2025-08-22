import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { apiRequest } from '@/lib/queryClient';

// Example User type/interface
export type User = {
  handle: string;
  email: string;      // add this
  phone?: string;     // add this (optional if not always present)
  region?: string;
  role: string;
  // ...other fields...
};

export type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (firebaseUid: string) => Promise<User>;
  logout: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePhoneNumber: (newPhone: string) => Promise<void>;
  resetPassword: () => Promise<void>; // add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const response = await apiRequest('POST', '/api/auth/login', {
            firebaseUid: firebaseUser.uid
          });
          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          console.error('Auto-login failed:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (firebaseUid: string): Promise<User> => {
    const response = await apiRequest('POST', '/api/auth/login', { firebaseUid });
    const data = await response.json();
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const updateEmail = async (newEmail: string) => {
    if (!firebaseUser) throw new Error('Not authenticated');
    await apiRequest('POST', '/api/auth/update-email', { 
      email: newEmail,
      uid: firebaseUser.uid
    });
  };

  const updatePhoneNumber = async (newPhone: string) => {
    if (!firebaseUser) throw new Error('Not authenticated');
    await apiRequest('POST', '/api/auth/update-phone', { 
      phone: newPhone,
      uid: firebaseUser.uid
    });
  };

  const resetPassword = async () => {
    if (!firebaseUser) throw new Error('Not authenticated');
    await apiRequest('POST', '/api/auth/reset-password', { 
      uid: firebaseUser.uid
    });
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, updateEmail, updatePhoneNumber, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
