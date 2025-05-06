import React, {createContext, useState, useEffect, useContext, ReactNode, useCallback} from 'react';
import {getIdToken, saveAuthTokens, clearAuthTokens} from '../storage/userStorage';
import {
  saveUserData,
  getUserData,
  clearUserData,
  UserData,
  saveAuthToken,
  getAuthToken,
} from '../utils/storage';
import {ActivityIndicator, View} from 'react-native';
import {useLoginStyles} from '../screens/login/LoginStyles';
import {useTheme} from '../theme/ThemeContext';
import {registerUser, updateAvatar} from '../services/api';

interface AuthContextType {
  idToken: string | null;
  isLoading: boolean;
  login: (idToken: string, refreshToken: string) => void;
  logout: () => void;
}
interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userInfo: Omit<UserData, 'id'>, password: string) => Promise<void>;
  signOut: () => void;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext2 = createContext<AuthContextData>({} as AuthContextData);
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

 const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUserData = getUserData();
        const token = getAuthToken();

        if (storedUserData && token) {
          setUserData(storedUserData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do armazenamento:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      console.log(
        `Autenticando com email: ${email} e senha com ${password.length} caracteres`,
      );

      const mockUser: UserData = {
        id: '1',
        fullName: 'Usuário Mockado',
        email,
        phone: '(11) 9 9999-9999',
        avatarId: 1,
      };

      const mockToken = 'mock-token-123456';

      saveUserData(mockUser);
      saveAuthToken(mockToken);

      setUserData(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    userInfo: Omit<UserData, 'id'>,
    password: string,
  ): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await registerUser(
        userInfo.email,
        password,
        userInfo.fullName,
        userInfo.phone,
      );

      const idToken = response.idToken;
      const picture = `avatar_${userInfo.avatarId}`;

      await updateAvatar(idToken, picture);

      const newUser: UserData = {
        ...userInfo,
        id: response.uid,
      };

      saveUserData(newUser);
      saveAuthToken(idToken);

      setUserData(newUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async (data: Partial<UserData>): Promise<void> => {
    try {
      setIsLoading(true);

      if (userData) {
        const updatedUserData = {
          ...userData,
          ...data,
        };

        saveUserData(updatedUserData);
        setUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    clearUserData();
    setUserData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userData,
        signIn,
        signUp,
        signOut,
        updateUserData,
      }}>

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
