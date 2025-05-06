import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import {
  saveUserData,
  getUserData,
  clearUserData,
  UserData,
  saveAuthToken,
  getAuthToken,
} from '../utils/storage';
import {registerUser, updateAvatar} from '../services/api';

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userInfo: Omit<UserData, 'id'>, password: string) => Promise<void>;
  signOut: () => void;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};
