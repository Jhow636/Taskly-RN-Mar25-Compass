import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, RouteProp} from '@react-navigation/native';

import Button from '../components/Button';
import {
  registerUser,
  loginUser,
  CustomApiError,
  updateFullProfile,
  apiClient,
} from '../services/api';
import {AuthStackParamList} from '../navigation/types';
import {useAuth} from '../context/AuthContext';
import {UserSignupData} from './SignupScreen';

const avatars = [
  {id: 1, source: require('../assets/avatarr1.jpg')},
  {id: 2, source: require('../assets/avatarr2.jpg')},
  {id: 3, source: require('../assets/avatarr3.jpg')},
  {id: 4, source: require('../assets/avatarr4.jpg')},
  {id: 5, source: require('../assets/avatarr5.jpg')},
];

interface AvatarSelectionScreenParams {
  userData: UserSignupData;
  password: string;
}

const AvatarSelectionScreen: React.FC = () => {
  const route = useRoute<RouteProp<AuthStackParamList, 'AvatarSelection'>>();
  const auth = useAuth();

  const {userData, password} = route.params as AvatarSelectionScreenParams;

  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectAvatar = (id: number) => {
    setSelectedAvatarId(id);
  };

  const handleConfirmSelection = async () => {
    if (selectedAvatarId === null) {
      Alert.alert('Aviso', 'Por favor, selecione um avatar para continuar.');
      return;
    }

    setLoading(true);
    try {
      const avatarApiId = `avatar_${selectedAvatarId}`;

      // Passo 1: Registrar o usuário (sem o avatar ainda)
      await registerUser(userData.email, password, userData.fullName, userData.phone);

      Alert.alert('Sucesso', 'Conta criada! Configurando perfil e fazendo login...');

      // Passo 2: Fazer login para obter id_token e refresh_token
      const loginResponse = await loginUser(userData.email, password);
      const {id_token: newIdToken, refresh_token: newRefreshToken} = loginResponse;

      // Passo 3: Atualizar o perfil com o avatar usando o token obtido no login
      const previousAuthHeader = apiClient.defaults.headers.common.Authorization;
      apiClient.defaults.headers.common.Authorization = `Bearer ${newIdToken}`;

      try {
        await updateFullProfile({
          name: userData.fullName,
          phone: userData.phone,
          picture: avatarApiId,
        });
      } catch (profileError) {
        console.error('Erro ao atualizar o perfil com avatar:', profileError);
        Alert.alert(
          'Aviso',
          'Não foi possível definir o avatar, mas sua conta foi criada. Você pode tentar novamente no seu perfil.',
        );
      } finally {
        if (previousAuthHeader) {
          apiClient.defaults.headers.common.Authorization = previousAuthHeader;
        } else {
          delete apiClient.defaults.headers.common.Authorization;
        }
      }

      // Passo 4: Fazer login no AuthContext para estabelecer a sessão no app
      auth.login(newIdToken, newRefreshToken);
    } catch (error: any) {
      console.error('Erro durante o processo de cadastro e login:', error);
      let errorMessage = 'Falha no cadastro ou login. Tente novamente.';
      if (error instanceof CustomApiError) {
        errorMessage = error.message;
        if (error.data && error.data.error) {
          errorMessage = `${error.message}: ${error.data.error}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <Text style={styles.title}>SELECIONE SEU AVATAR</Text>
        <Text style={styles.subtitle}>(Escolha somente um)</Text>
        <View style={styles.avatarContainer}>
          {avatars.map(avatar => (
            <TouchableOpacity
              key={avatar.id}
              style={[
                styles.avatarButton,
                selectedAvatarId === avatar.id && styles.selectedAvatarButton,
              ]}
              onPress={() => handleSelectAvatar(avatar.id)}
              activeOpacity={0.7}>
              <Image
                source={avatar.source}
                style={[
                  styles.avatarImage,
                  selectedAvatarId !== null &&
                    selectedAvatarId !== avatar.id &&
                    styles.opaqueAvatar,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
        <Button
          title={loading ? '' : 'CONFIRMAR SELEÇÃO'}
          onPress={handleConfirmSelection}
          loading={loading}
          disabled={loading || selectedAvatarId === null}>
          {loading && <ActivityIndicator color="#FFFFFF" />}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  avatarButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarButton: {borderColor: '#6200EE'},
  avatarImage: {width: '100%', height: '100%'},
  opaqueAvatar: {opacity: 0.4},
});

export default AvatarSelectionScreen;
