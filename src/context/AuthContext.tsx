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
  balance?: number; // Legacy support
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
  isPhoneVerified?: boolean;
  isAdmin?: boolean;
  createdAt: any;
  photoURL?: string;
  address?: string;
  apiKey?: string;
  webhookUrl?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  transactionAlerts?: boolean;
  securityAlerts?: boolean;
  airtimeBeneficiaries?: any[];
  dataBeneficiaries?: any[];
  cableBeneficiaries?: any[];
  electricityBeneficiaries?: any[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  setTransactionPin: (pin: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // Listen to profile changes
        const profileRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
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
              isPhoneVerified: false,
              createdAt: new Date(),
            };
            setDoc(profileRef, initialProfile).catch(err => console.error('Error creating profile:', err));
            setProfile(initialProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error('Profile listener error:', error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const logout = () => signOut(auth);
  
  const refreshProfile = async () => {
    if (!user) return;
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    if (profileDoc.exists()) {
      setProfile(profileDoc.data() as UserProfile);
    }
  };

  const setTransactionPin = async (pin: string) => {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid);
    await setDoc(profileRef, {
      transactionPin: pin,
      isPinSet: true
    }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, setTransactionPin, refreshProfile }}>
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
