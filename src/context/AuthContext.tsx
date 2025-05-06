import React, {createContext, useState, useEffect, useContext, ReactNode, useCallback} from 'react';
import {getIdToken, saveAuthTokens, clearAuthTokens} from '../storage/userStorage';
import {ActivityIndicator, View} from 'react-native';
import {useLoginStyles} from '../screens/login/LoginStyles';
import {useTheme} from '../theme/ThemeContext';
import {jwtDecode, JwtPayload} from 'jwt-decode';

interface FirebaseJwtPayload extends JwtPayload {
  user_id?: string;
}

interface AuthContextType {
  idToken: string | null;
  userId: string | null;
  isLoading: boolean;
  login: (idToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) {
    console.warn('getUserIdFromToken: No token provided.');
    return null;
  }
  try {
    const decodedToken = jwtDecode<FirebaseJwtPayload>(token);
    const userId = decodedToken.sub || decodedToken.user_id;
    if (!userId) {
      console.error(
        'getUserIdFromToken: Decoded token does not contain "sub" or "user_id" claim.',
        decodedToken,
      );
      return null;
    }
    console.log(`getUserIdFromToken: Decoded token. Extracted UserID (sub/user_id): ${userId}`);
    return userId;
  } catch (e) {
    console.error('getUserIdFromToken: Error decoding token:', e);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const styles = useLoginStyles();
  const {theme} = useTheme();

  useEffect(() => {
    const checkToken = async () => {
      console.log('AuthProvider: checkToken effect triggered.');
      setIsLoading(true);
      let derivedUserIdInScope = null;
      try {
        const storedToken = getIdToken();
        console.log(
          'AuthProvider: Stored token from MMKV (first 20 chars):',
          storedToken ? storedToken.substring(0, Math.min(20, storedToken.length)) + '...' : 'null',
        );
        if (storedToken) {
          derivedUserIdInScope = getUserIdFromToken(storedToken);
          setIdToken(storedToken);
          setUserId(derivedUserIdInScope);
          console.log('AuthProvider: Token found. UserID set to:', derivedUserIdInScope);
        } else {
          setIdToken(null);
          setUserId(null);
          console.log('AuthProvider: No stored token found. UserID set to null.');
        }
      } catch (e) {
        console.error('AuthProvider: Failed to load token on mount', e);
        setIdToken(null);
        setUserId(null);
      } finally {
        setIsLoading(false);
        console.log(
          'AuthProvider: checkToken effect finished. isLoading: false. UserID in state (after potential update):',
          userId,
          'Derived UserID in this scope:',
          derivedUserIdInScope,
        );
      }
    };
    checkToken();
  }, []);

  const login = useCallback((newIdToken: string, newRefreshToken: string) => {
    try {
      console.log(
        'AuthProvider: login called with newIdToken (first 20 chars):',
        newIdToken ? newIdToken.substring(0, Math.min(20, newIdToken.length)) + '...' : 'null',
      );
      saveAuthTokens(newIdToken, newRefreshToken);
      const currentUserId = getUserIdFromToken(newIdToken);
      setIdToken(newIdToken);
      setUserId(currentUserId);
      console.log('AuthProvider: User logged in. UserID set to:', currentUserId);
    } catch (e) {
      console.error('AuthProvider: Failed to save tokens or set user ID on login', e);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      console.log('AuthProvider: logout called.');
      clearAuthTokens();
      setIdToken(null);
      setUserId(null);
      console.log('AuthProvider: User logged out. UserID cleared.');
    } catch (e) {
      console.error('AuthProvider: Failed to clear tokens or user ID on logout', e);
    }
  }, []);

  if (isLoading) {
    console.log('AuthProvider: Rendering loading indicator (isLoading is true).');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  console.log(
    'AuthProvider: Rendering children. isLoading: false. Current idToken (first 20):',
    idToken ? idToken.substring(0, Math.min(20, idToken.length)) + '...' : 'None',
    'Current UserID:',
    userId,
  );
  return (
    <AuthContext.Provider value={{idToken, userId, isLoading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
