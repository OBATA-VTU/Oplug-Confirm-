import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  walletBalance: number;
  role: string;
  status: string;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  referredBy: string | null;
  isPinSet: boolean;
  transactionPin: string;
  virtualAccount?: {
    account_name: string;
    account_number: string;
    bank_id: string;
    bank_name: string;
    reference: string;
  };
  isProfileComplete: boolean;
  isAdmin?: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen to profile changes
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile if it doesn't exist
            const initialProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || 'User',
              firstName: (firebaseUser.displayName || 'User').split(' ')[0],
              lastName: (firebaseUser.displayName || 'User').split(' ')[1] || '',
              username: firebaseUser.email?.split('@')[0] || 'user',
              phone: '',
              walletBalance: 0,
              role: 'user',
              status: 'active',
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
              referralCount: 0,
              referralEarnings: 0,
              referredBy: null,
              isPinSet: false,
              transactionPin: '',
              isProfileComplete: false,
              createdAt: new Date(),
            };
            setDoc(profileRef, initialProfile);
            setProfile(initialProfile);
          }
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
