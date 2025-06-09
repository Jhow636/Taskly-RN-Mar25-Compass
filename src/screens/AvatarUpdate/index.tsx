import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Button from '../../components/Button';
import {useAuth} from '../../context/AuthContext';
import {CustomApiError, updateFullProfile} from '../../services/api';
import {UserEditStackParamList} from '../UserEdit';
import {useTheme} from '../../theme/ThemeContext';
import {Theme} from '../../theme/Theme';
import BackMenu from '../../components/BackButtom';
import {calculateProgressBarWidth} from '../../utils/AnimationUtils';

const avatars = [
  {id: 1, source: {uri: 'https://avatarescompass.s3.eu-north-1.amazonaws.com/avatarr1.jpg'}},
  {id: 2, source: {uri: 'https://avatarescompass.s3.eu-north-1.amazonaws.com/avatarr2.jpg'}},
  {id: 3, source: {uri: 'https://avatarescompass.s3.eu-north-1.amazonaws.com/avatarr3.jpg'}},
  {id: 4, source: {uri: 'https://avatarescompass.s3.eu-north-1.amazonaws.com/avatarr4.jpg'}},
  {id: 5, source: {uri: 'https://avatarescompass.s3.eu-north-1.amazonaws.com/avatarr5.jpg'}},
];

const AvatarUpdate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progressoAtual, setProgressoAtual] = useState(0);
  const progressoTotal = 100;
  const [carregando, setCarregando] = useState(true);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const {widthInterpolation} = calculateProgressBarWidth(
    animatedProgress,
    progressoAtual,
    progressoTotal,
  );
  const navigation = useNavigation();
  const route = useRoute<RouteProp<UserEditStackParamList, 'AvatarUpdate'>>();
  const {newName, newPhone, currentPicture} = route.params;

  const {theme} = useTheme();
  const styles = getStyles(theme);

  const auth = useAuth();
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);

  useEffect(() => {
    let contador = 50;
    setProgressoAtual(contador);

    if (contador >= progressoTotal) {
      setCarregando(false);
    }
  }, []);

  const incrementProgress = () => {
    setProgressoAtual(prev => Math.min(prev + 50, progressoTotal));
  };

  useEffect(() => {
    if (currentPicture) {
      const currentAvatar = avatars.find(avatar => `avatar_${avatar.id}` === currentPicture);
      if (currentAvatar) {
        setSelectedAvatarId(currentAvatar.id);
      }
    }
  }, [currentPicture]);

  const handleSelectAvatar = (id: number) => {
    incrementProgress();
    setSelectedAvatarId(id);
  };

  const handleConfirmSelection = async () => {
    let pictureToUpdate: string;

    if (selectedAvatarId !== null) {
      pictureToUpdate = `avatar_${selectedAvatarId}`;
    } else if (currentPicture) {
      pictureToUpdate = currentPicture;
    } else {
      Alert.alert('Erro', 'Não foi possível determinar o avatar. Tente novamente.');
      return;
    }

    try {
      setLoading(true);

      await updateFullProfile({
        name: newName,
        phone_number: newPhone.replace(/\D/g, ''),
        picture: pictureToUpdate,
      });

      navigation.navigate('Home', {avatarUpdated: true});
      await auth.refreshUserProfile();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil completo:', error);
      const errorMessage =
        error instanceof CustomApiError
          ? error.message
          : error.message || 'Falha ao atualizar o perfil.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.top}>
          <BackMenu text="EDIÇÂO DE PERFIL" />
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, {width: widthInterpolation}]} />
          </View>
        </View>
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
            title={loading ? '' : 'CONFIRMAR ATUALIZAÇÃO'}
            onPress={handleConfirmSelection}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      padding: 30,
      flex: 1,
      alignItems: 'center',
    },
    title: {
      ...theme.typography.bigTitle,
      color: theme.colors.mainText,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      ...theme.typography.regular,
      color: theme.colors.secondaryText,
      marginBottom: 32,
      textAlign: 'center',
    },
    progressBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingLeft: 40,
      paddingRight: 40,
      paddingTop: 40,
    },
    progressBarBackground: {
      backgroundColor: theme.colors.primaryLight,
      height: 8,
      flex: 1,
      marginRight: 10,
      overflow: 'hidden',
    },
    progressBarFill: {
      backgroundColor: theme.colors.primary,
      height: '100%',
      paddingTop: 40,
    },
    avatarContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 40,
    },
    avatarButton: {
      width: 95,
      height: 95,
      borderRadius: 47.5,
      margin: 10,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedAvatarButton: {
      borderColor: theme.colors.primary,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 40,
    },
    opaqueAvatar: {
      opacity: 0.4,
    },
    top: {
      paddingTop: 20,
    },
    scrollContent: {
      flexGrow: 1, // Permite que o conteúdo ocupe o espaço necessário
      justifyContent: 'center', // Centraliza o conteúdo se não houver rolagem
    },
  });

export default AvatarUpdate;
