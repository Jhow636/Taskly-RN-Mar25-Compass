import React, {createContext, useState, useEffect, useContext, ReactNode, useCallback} from 'react';
import {
  getIdToken as getStoredIdToken,
  getRefreshToken as getStoredRefreshToken,
  saveAuthTokens as saveTokensToStorage,
  clearAuthTokens as clearTokensFromStorage,
} from '../storage/userStorage';
import {ActivityIndicator, View} from 'react-native';
import {useLoginStyles} from '../screens/login/LoginStyles'; // Ajuste o caminho se necessário
import {useTheme} from '../theme/ThemeContext';
import {jwtDecode, JwtPayload} from 'jwt-decode';
import {initializeApiClient, apiClient} from '../services/api'; // apiClient importado para limpar headers no logout

interface FirebaseJwtPayload extends JwtPayload {
  user_id?: string; // Firebase usa 'user_id' no token de ID
  // Adicione outras claims que você espera, como 'name', 'email', 'picture' se estiverem no idToken
}

interface AuthContextType {
  idToken: string | null;
  userId: string | null;
  isLoading: boolean;
  login: (idToken: string, refreshToken: string) => void;
  logout: () => void;
  // refreshToken: string | null; // Expor refreshToken se necessário externamente, mas geralmente é interno
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
    // O idToken do Firebase já contém o user_id (sub ou user_id)
    const decodedToken = jwtDecode<FirebaseJwtPayload>(token);
    const userId = decodedToken.sub || decodedToken.user_id; // 'sub' é o padrão JWT, 'user_id' é comum no Firebase
    if (!userId) {
      console.error(
        'getUserIdFromToken: Decoded token does not contain "sub" or "user_id" claim.',
        decodedToken,
      );
      return null;
    }
    console.log(`getUserIdFromToken: Extracted UserID: ${userId}`);
    return userId;
  } catch (e) {
    console.error('getUserIdFromToken: Error decoding token:', e);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const styles = useLoginStyles();
  const {theme} = useTheme();

  const performLogout = useCallback(() => {
    console.log('AuthProvider: performLogout initiated.');
    clearTokensFromStorage();
    setIdToken(null);
    setRefreshTokenState(null);
    setUserId(null);
    // Limpar o header de autorização do apiClient em caso de logout
    if (apiClient.defaults.headers.common.Authorization) {
      delete apiClient.defaults.headers.common.Authorization;
    }
    console.log(
      'AuthProvider: User logged out. Tokens, UserID, and API client auth header cleared.',
    );
    // Adicionar navegação para a tela de Login aqui, se aplicável e se o navigation estiver disponível.
  }, []);

  useEffect(() => {
    console.log('AuthProvider: Initializing API client and checking token.');
    initializeApiClient(
      () => refreshTokenState, // Fornece o refreshToken atual do estado
      (newIdToken, newRefreshToken) => {
        // Chamado pelo interceptor da API ao renovar tokens
        console.log('AuthProvider (via APIClient): Refreshing tokens.');
        saveTokensToStorage(newIdToken, newRefreshToken);
        setIdToken(newIdToken);
        setRefreshTokenState(newRefreshToken);
        const currentUserId = getUserIdFromToken(newIdToken);
        setUserId(currentUserId);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;
        console.log('AuthProvider (via APIClient): Tokens refreshed. UserID:', currentUserId);
      },
      performLogout, // Passa a função de logout para o interceptor da API
    );

    const checkStoredToken = async () => {
      setIsLoading(true);
      console.log('AuthProvider: Checking stored tokens.');
      try {
        const storedId = getStoredIdToken();
        const storedRefresh = getStoredRefreshToken();

        if (storedId && storedRefresh) {
          const currentUserId = getUserIdFromToken(storedId);
          if (currentUserId) {
            setIdToken(storedId);
            setRefreshTokenState(storedRefresh);
            setUserId(currentUserId);
            apiClient.defaults.headers.common.Authorization = `Bearer ${storedId}`;
            console.log('AuthProvider: Stored tokens loaded. UserID:', currentUserId);
          } else {
            // Token decodificado não resultou em um UserID (pode estar malformado ou realmente expirado)
            console.log(
              'AuthProvider: Stored ID token invalid or could not extract UserID. Logging out.',
            );
            performLogout();
          }
        } else {
          console.log('AuthProvider: No stored tokens found.');
          // Garante que o estado esteja limpo se não houver tokens
          performLogout();
        }
      } catch (e) {
        console.error('AuthProvider: Failed to load tokens on mount.', e);
        performLogout(); // Erro ao carregar, melhor deslogar
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Token check finished. isLoading:', isLoading);
      }
    };

    checkStoredToken();
  }, [performLogout, refreshTokenState, isLoading]); // Adicionar isLoading aqui

  const login = useCallback(
    (newIdToken: string, newRefreshToken: string) => {
      try {
        console.log('AuthProvider: login called.');
        saveTokensToStorage(newIdToken, newRefreshToken);
        const currentUserId = getUserIdFromToken(newIdToken);
        setIdToken(newIdToken);
        setRefreshTokenState(newRefreshToken);
        setUserId(currentUserId);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;
        console.log('AuthProvider: User logged in. UserID set to:', currentUserId);
      } catch (e) {
        console.error('AuthProvider: Failed to save tokens or set user ID on login.', e);
        performLogout(); // Se o login falhar em configurar o estado corretamente
      }
    },
    [performLogout],
  );

  const logout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  if (isLoading) {
    console.log('AuthProvider: Rendering loading indicator.');
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.colors.background}]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  console.log(
    'AuthProvider: Rendering children. UserID:',
    userId,
    'idToken:',
    idToken ? 'present' : 'null',
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
