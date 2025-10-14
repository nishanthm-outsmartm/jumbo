import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { apiRequest } from "@/lib/queryClient";

// Example User type/interface
export type User = {
  id: string;
  handle: string;
  points: number;
  switch_count: number;
  level: number;
  role?: string;
  userType?: "ANONYMOUS" | "REGISTERED";
};

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (firebaseUid: string) => Promise<User>;
  logout: () => Promise<void>;
  createAnonymousUser: (
    handle: string
  ) => Promise<{ user: User; backupCodes?: any[] }>;
  createUserWithSecretKey: (
    handle: string,
    state: string
  ) => Promise<{ user: User; secretKey: string }>;
  confirmSecretKeyUser: (user: User) => void;
  loginWithSecretKey: (handle: string, secretKey: string) => Promise<User>;
  migrateToRegistered: (
    firebaseUid: string,
    email?: string,
    phone?: string
  ) => Promise<User>;
  generateRecoveryKey: () => Promise<any>;
  useRecoveryKey: (keyDisplay: string) => Promise<User>;
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
          const response = await apiRequest("POST", "/api/auth/login", {
            firebaseUid: firebaseUser.uid,
          });
          const data = await response.json();
          setUser(data.user);
        } catch (error) {
          console.error("Auto-login failed:", error);
          setUser(null);
        }
      } else {
        // Check if there's an anonymous user stored in localStorage
        const anonymousUser = localStorage.getItem("anonymousUser");
        if (anonymousUser) {
          try {
            const userData = JSON.parse(anonymousUser);
            setUser(userData);
          } catch (error) {
            console.error("Failed to parse anonymous user data:", error);
            localStorage.removeItem("anonymousUser");
            setUser(null);
          }
        } else {
          // Try to retrieve existing anonymous user by cookie ID
          const cookieId = getCookieId();
          if (cookieId) {
            try {
              const response = await apiRequest("POST", "/api/auth/anonymous", {
                handle: "temp", // This will be ignored if user exists
                cookieId,
              });
              const data = await response.json();
              if (data.user) {
                setUser(data.user);
                localStorage.setItem(
                  "anonymousUser",
                  JSON.stringify(data.user)
                );
                return; // Exit early if we found a user
              }
            } catch (error) {
              console.error(
                "Failed to retrieve existing anonymous user:",
                error
              );
            }
          }
          setUser(null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (firebaseUid: string): Promise<User> => {
    const response = await apiRequest("POST", "/api/auth/login", {
      firebaseUid,
    });
    const data = await response.json();
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
    // Clear anonymous user data from localStorage
    localStorage.removeItem("anonymousUser");
    localStorage.removeItem("anonymousCookieId");
  };

  const createAnonymousUser = async (
    handle: string
  ): Promise<{ user: User; backupCodes?: any[] }> => {
    try {
      const cookieId = generateCookieId();
      console.log("Anonymous user created successfully:", { handle, cookieId });
      const response = await apiRequest("POST", "/api/auth/anonymous", {
        handle,
        cookieId,
      });
      const data = await response.json();
      setUser(data.user);
      // Store anonymous user data and cookie ID in localStorage for persistence
      localStorage.setItem("anonymousUser", JSON.stringify(data.user));
      localStorage.setItem("anonymousCookieId", cookieId);
      return data;
    } catch (error: any) {
      console.error("Anonymous user creation failed:", error);
      throw new Error(error.message || "Failed to create anonymous user");
    }
  };

  const createUserWithSecretKey = async (
    handle: string,
    state: string
  ): Promise<{ user: User; secretKey: string }> => {
    try {
      console.log("AuthContext: Creating user with secret key", {
        handle,
        state,
      });
      const response = await apiRequest("POST", "/api/auth/secret-register", {
        handle,
        state,
      });
      console.log("AuthContext: API response received", response);
      const data = await response.json();
      console.log("AuthContext: Parsed response data", data);

      if (!data.secretKey) {
        console.error("AuthContext: No secret key in response", data);
        throw new Error("No secret key received from server");
      }

      // DON'T set the user immediately - wait for confirmation
      // setUser(data.user);
      // DON'T store in localStorage yet - wait for confirmation
      // localStorage.setItem("anonymousUser", JSON.stringify(data.user));
      return data;
    } catch (error: any) {
      console.error("AuthContext: Secret key user creation failed:", error);
      throw new Error(error.message || "Failed to create user with secret key");
    }
  };

  const confirmSecretKeyUser = (user: User) => {
    console.log(
      "AuthContext: Confirming secret key user and setting as active:",
      user
    );
    setUser(user);
    // Store anonymous user data in localStorage for persistence
    localStorage.setItem("anonymousUser", JSON.stringify(user));
  };

  const loginWithSecretKey = async (
    handle: string,
    secretKey: string
  ): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/secret-login", {
        handle,
        secretKey,
      });
      const data = await response.json();
      setUser(data.user);
      // Store user data in localStorage for persistence
      localStorage.setItem("anonymousUser", JSON.stringify(data.user));
      return data.user;
    } catch (error: any) {
      console.error("Secret key login failed:", error);
      throw new Error(error.message || "Failed to login with secret key");
    }
  };

  const migrateToRegistered = async (
    firebaseUid: string,
    email?: string,
    phone?: string
  ): Promise<User> => {
    if (!user) throw new Error("No user to migrate");

    const response = await apiRequest("POST", "/api/auth/migrate", {
      anonymousUserId: user.id,
      firebaseUid,
      email,
      phone,
    });
    const data = await response.json();
    setUser(data.user);
    // Clear anonymous user data from localStorage since user is now registered
    localStorage.removeItem("anonymousUser");
    localStorage.removeItem("anonymousCookieId");
    return data.user;
  };

  const generateRecoveryKey = async (): Promise<any> => {
    if (!user) throw new Error("No user logged in");

    const response = await apiRequest("POST", "/api/recovery-key/generate", {
      userId: user.id,
    });
    const data = await response.json();
    return data.recoveryKey;
  };

  const useRecoveryKey = async (keyDisplay: string): Promise<User> => {
    const response = await apiRequest("POST", "/api/recovery-key/use", {
      keyDisplay,
    });
    const data = await response.json();
    setUser(data.user);
    return data.user;
  };

  // Helper function to generate a unique cookie ID
  const generateCookieId = (): string => {
    return "anon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  };

  // Helper function to get existing cookie ID from localStorage
  const getCookieId = (): string | null => {
    return localStorage.getItem("anonymousCookieId");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        logout,
        createAnonymousUser,
        createUserWithSecretKey,
        confirmSecretKeyUser,
        loginWithSecretKey,
        migrateToRegistered,
        generateRecoveryKey,
        useRecoveryKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
