import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Button from '../../components/Button';
import {useAuth} from '../../context/AuthContext';
import {CustomApiError, updateFullProfile} from '../../services/api';
import {UserEditStackParamList} from '../UserEdit';
import {useTheme} from '../../theme/ThemeContext';
import {Theme} from '../../theme/Theme';

const avatars = [
  {id: 1, source: require('../../assets/avatarr1.jpg')},
  {id: 2, source: require('../../assets/avatarr2.jpg')},
  {id: 3, source: require('../../assets/avatarr3.jpg')},
  {id: 4, source: require('../../assets/avatarr4.jpg')},
  {id: 5, source: require('../../assets/avatarr5.jpg')},
];

const AvatarUpdate: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<UserEditStackParamList, 'AvatarUpdate'>>();
  const {newName, newPhone, currentPicture} = route.params;

  const {theme} = useTheme();
  const styles = getStyles(theme);

  const auth = useAuth();
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPicture) {
      const currentAvatar = avatars.find(avatar => `avatar_${avatar.id}` === currentPicture);
      if (currentAvatar) {
        setSelectedAvatarId(currentAvatar.id);
      }
    }
  }, [currentPicture]);

  const handleSelectAvatar = (id: number) => {
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
        phone: newPhone,
        picture: pictureToUpdate,
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      await auth.refreshUserProfile();
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
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
      <View style={styles.container}>
        <Text style={styles.title}>ATUALIZE SEU AVATAR</Text>
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
      flex: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
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
  });

export default AvatarUpdate;
