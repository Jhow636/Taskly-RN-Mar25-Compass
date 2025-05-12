import React, {createContext, useState, useContext, useEffect, ReactNode, useCallback} from 'react';
import {jwtDecode} from 'jwt-decode';
import {
  saveAuthTokens,
  getIdToken,
  getRefreshToken as getStoredRefreshToken,
  clearAuthTokens,
} from '../storage/userStorage';
import {apiClient, initializeApiClient, getProfile} from '../services/api';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  picture: string;
  phone_number?: string;
}

interface DecodedToken {
  user_id: string;
  exp: number;
}

interface AuthContextType {
  idToken: string | null;
  userId: string | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (idToken: string, refreshToken: string) => void;
  logout: () => void;
  deleteUserAccount: () => Promise<void>;
  getRefreshToken: () => string | null;
  refreshTokensAndUpdateClient: (newIdToken: string, newRefreshToken: string) => void;
  refreshUserProfile: () => Promise<void>;
  registerSyncFunction: (syncFn: () => Promise<void>) => void;
  triggerSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncFunction, setSyncFunction] = useState<(() => Promise<void>) | null>(null);

  const getUserIdFromToken = (token: string): string | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.user_id || null;
    } catch (error) {
      console.error('getUserIdFromToken: Error decoding token:', error);
      return null;
    }
  };

  const fetchUserProfile = useCallback(async () => {
    if (!apiClient.defaults.headers.common.Authorization) {
      console.log('AuthProvider: Cannot fetch profile, no auth token set.');
      return;
    }
    console.log('AuthProvider: Fetching user profile.');
    try {
      const profileData = await getProfile();
      setUserProfile(profileData);
      console.log('AuthProvider: User profile fetched and set:', profileData);
    } catch (error) {
      console.error('AuthProvider: Failed to fetch user profile:', error);
    }
  }, []);

  const performLogout = useCallback(async (isAccountDeletion: boolean = false) => {
    console.log(`AuthProvider: Performing logout. Is account deletion: ${isAccountDeletion}`);
    try {
      if (!isAccountDeletion) {
        // await apiClient.post('/auth/logout'); // Exemplo
        console.log('AuthProvider: API logout call skipped or not implemented for regular logout.');
      }
    } catch (error) {
      console.error('AuthProvider: Error during API logout call:', error);
    } finally {
      clearAuthTokens();
      setIdToken(null);
      setRefreshTokenState(null);
      setUserId(null);
      setUserProfile(null);
      if (apiClient.defaults.headers.common.Authorization) {
        delete apiClient.defaults.headers.common.Authorization;
      }
      console.log('AuthProvider: User logged out, tokens and profile cleared.');
    }
  }, []);

  const refreshTokensAndUpdateClient = useCallback(
    async (newIdToken: string, newRefreshToken: string) => {
      console.log('AuthProvider (via APIClient): Refreshing tokens.');
      saveAuthTokens(newIdToken, newRefreshToken);
      setIdToken(newIdToken);
      setRefreshTokenState(newRefreshToken);
      const currentUserId = getUserIdFromToken(newIdToken);
      setUserId(currentUserId);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;
      console.log('AuthProvider (via APIClient): Tokens refreshed. UserID:', currentUserId);
      await fetchUserProfile();
    },
    [fetchUserProfile],
  );

  const deleteUserAccount = async () => {
    console.log('AuthProvider: Attempting to delete user account.');
    if (!idToken) {
      console.error('AuthProvider: No user logged in to delete.');
      throw new Error('Nenhum usuário logado para excluir.');
    }
    try {
      await apiClient.delete('/profile/delete-account');
      console.log('AuthProvider: API call to delete account successful.');
      await performLogout(true);
      console.log('AuthProvider: Account deleted successfully and user logged out.');
    } catch (error) {
      console.error('AuthProvider: Error deleting user account:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing API client and checking token.');
    initializeApiClient(() => refreshTokenState, refreshTokensAndUpdateClient, performLogout);

    const checkStoredToken = async () => {
      setIsLoading(true);
      console.log('AuthProvider: Checking stored tokens.');
      try {
        const storedId = getIdToken();
        const storedRefresh = getStoredRefreshToken();

        if (storedId && storedRefresh) {
          const currentUserId = getUserIdFromToken(storedId);
          const decodedToken = jwtDecode<DecodedToken>(storedId);
          if (decodedToken.exp * 1000 > Date.now()) {
            setIdToken(storedId);
            setRefreshTokenState(storedRefresh);
            setUserId(currentUserId);
            apiClient.defaults.headers.common.Authorization = `Bearer ${storedId}`;
            console.log('AuthProvider: Stored tokens loaded. UserID:', currentUserId);
            await fetchUserProfile();
          } else {
            console.log('AuthProvider: Stored ID token expired. Logging out.');
            performLogout();
          }
        } else {
          console.log('AuthProvider: No stored tokens found.');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('AuthProvider: Error checking stored token:', error);
        performLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredToken();
  }, [performLogout, refreshTokenState, refreshTokensAndUpdateClient, fetchUserProfile]);

  const login = async (newIdToken: string, newRefreshToken: string) => {
    console.log('AuthProvider: login called.');
    saveAuthTokens(newIdToken, newRefreshToken);
    setIdToken(newIdToken);
    setRefreshTokenState(newRefreshToken);
    const currentUserId = getUserIdFromToken(newIdToken);
    setUserId(currentUserId);
    apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;
    console.log('AuthProvider: User logged in. UserID set to:', currentUserId);
    await fetchUserProfile();
  };

  const logout = () => {
    performLogout();
  };

  const getRefreshToken = useCallback(() => {
    return refreshTokenState;
  }, [refreshTokenState]);

  const refreshUserProfile = useCallback(async () => {
    console.log('AuthProvider: Refresh user profile explicitly called.');
    await fetchUserProfile();
  }, [fetchUserProfile]);

  const registerSyncFunction = useCallback((syncFn: () => Promise<void>) => {
    console.log('AuthProvider: Sync function registered.');
    setSyncFunction(() => syncFn);
  }, []);

  const triggerSync = useCallback(async () => {
    if (syncFunction) {
      console.log('AuthProvider: Triggering sync requested by another screen.');
      await syncFunction();
    } else {
      console.warn('AuthProvider: Sync trigger requested, but no sync function is registered.');
    }
  }, [syncFunction]);

  console.log(
    `AuthProvider: Rendering. UserID: ${userId}, Profile: ${
      userProfile ? userProfile.name : 'none'
    }, Token: ${idToken ? 'present' : 'absent'}`,
  );

  return (
    <AuthContext.Provider
      value={{
        idToken,
        userId,
        userProfile,
        isLoading,
        login,
        logout,
        deleteUserAccount,
        getRefreshToken,
        refreshTokensAndUpdateClient,
        refreshUserProfile,
        registerSyncFunction,
        triggerSync,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
