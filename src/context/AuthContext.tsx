import React, {createContext, useState, useEffect, useContext, ReactNode, useCallback} from 'react';
import {getIdToken, saveAuthTokens, clearAuthTokens} from '../storage/userStorage';
import {ActivityIndicator, View} from 'react-native';
import {useLoginStyles} from '../screens/login/LoginStyles';
import {useTheme} from '../theme/ThemeContext';

interface AuthContextType {
  idToken: string | null;
  isLoading: boolean;
  login: (idToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const styles = useLoginStyles();
  const {theme} = useTheme();

  useEffect(() => {
    const checkToken = async () => {
      setIsLoading(true);
      try {
        const storedToken = getIdToken();
        console.log('AuthProvider useEffect: Found token?', !!storedToken);
        setIdToken(storedToken);
      } catch (e) {
        console.error('AuthProvider: Failed to load token on mount', e);
        setIdToken(null);
      } finally {
        setIsLoading(false);
        console.log('AuthProvider useEffect: Finished loading.');
      }
    };
    checkToken();
  }, []);

  const login = useCallback((newIdToken: string, newRefreshToken: string) => {
    try {
      console.log('AuthProvider: login called.');
      saveAuthTokens(newIdToken, newRefreshToken);
      setIdToken(newIdToken);
    } catch (e) {
      console.error('AuthProvider: Failed to save tokens on login', e);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      console.log('AuthProvider: logout called.');
      clearAuthTokens();
      setIdToken(null);
    } catch (e) {
      console.error('AuthProvider: Failed to clear tokens on logout', e);
    }
  }, []);

  if (isLoading) {
    console.log('AuthProvider: Rendering loading indicator.');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  console.log('AuthProvider: Rendering children with token:', idToken ? 'Exists' : 'None');
  return (
    <AuthContext.Provider value={{idToken, isLoading, login, logout}}>
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
