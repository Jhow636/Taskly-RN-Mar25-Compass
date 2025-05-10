import React, {createContext, useState, useContext, useEffect, ReactNode, useCallback} from 'react';
import {jwtDecode} from 'jwt-decode';
import {
  saveAuthTokens,
  getIdToken,
  getRefreshToken as getStoredRefreshToken,
  clearAuthTokens,
} from '../storage/userStorage';
import {apiClient, initializeApiClient} from '../services/api';

interface DecodedToken {
  user_id: string;
  exp: number;
}

interface AuthContextType {
  idToken: string | null;
  userId: string | null;
  isLoading: boolean;
  login: (idToken: string, refreshToken: string) => void;
  logout: () => void;
  getRefreshToken: () => string | null; // Adicionado para o interceptor da API
  refreshTokensAndUpdateClient: (newIdToken: string, newRefreshToken: string) => void; // Adicionado
  registerSyncFunction: (syncFn: () => Promise<void>) => void; // Novo
  triggerSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
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

  const performLogout = useCallback(async () => {
    console.log('AuthProvider: Logging out.');
    try {
      // Adicionar chamada à API de logout se existir
      // await apiClient.post('/auth/logout'); // Exemplo
    } catch (error) {
      console.error('AuthProvider: Error during API logout call:', error);
    } finally {
      clearAuthTokens();
      setIdToken(null);
      setRefreshTokenState(null);
      setUserId(null);
      // Assegurar que o cabeçalho de autorização seja removido do cliente API
      if (apiClient.defaults.headers.common.Authorization) {
        delete apiClient.defaults.headers.common.Authorization;
      }
      console.log('AuthProvider: User logged out, tokens cleared.');
    }
  }, []);

  const refreshTokensAndUpdateClient = useCallback(
    (newIdToken: string, newRefreshToken: string) => {
      console.log('AuthProvider (via APIClient): Refreshing tokens.');
      saveAuthTokens(newIdToken, newRefreshToken); // Salva no MMKV
      setIdToken(newIdToken);
      setRefreshTokenState(newRefreshToken);
      const currentUserId = getUserIdFromToken(newIdToken);
      setUserId(currentUserId);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;
      console.log('AuthProvider (via APIClient): Tokens refreshed. UserID:', currentUserId);
    },
    [],
  );

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
          } else {
            console.log('AuthProvider: Stored ID token expired. Attempting refresh.');
            performLogout();
          }
        } else {
          console.log('AuthProvider: No stored tokens found.');
        }
      } catch (error) {
        console.error('AuthProvider: Error checking stored token:', error);
        performLogout();
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Token check finished. isLoading:', isLoading);
      }
    };

    checkStoredToken();
  }, [performLogout, refreshTokenState, refreshTokensAndUpdateClient, isLoading]);

  const login = (newIdToken: string, newRefreshToken: string) => {
    console.log('AuthProvider: login called.');
    saveAuthTokens(newIdToken, newRefreshToken);
    setIdToken(newIdToken);
    setRefreshTokenState(newRefreshToken);
    const currentUserId = getUserIdFromToken(newIdToken);
    setUserId(currentUserId);
    apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;
    console.log('AuthProvider: User logged in. UserID set to:', currentUserId);
  };

  const logout = () => {
    performLogout();
  };

  const getRefreshToken = useCallback(() => {
    return refreshTokenState;
  }, [refreshTokenState]);

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
    `AuthProvider: Rendering children. UserID: ${userId} idToken: ${
      idToken ? 'present' : 'absent'
    }`,
  );

  return (
    <AuthContext.Provider
      value={{
        idToken,
        userId,
        isLoading,
        login,
        logout,
        getRefreshToken,
        refreshTokensAndUpdateClient,
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
