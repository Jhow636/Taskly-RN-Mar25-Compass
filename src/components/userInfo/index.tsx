import React from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {Theme} from '../../theme/Theme';
import {useTheme} from '../../theme/ThemeContext';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import {formatBrazilianPhoneNumber} from '../../utils/formatters';

const avatarImages: Record<string, any> = {
  avatar_1: require('../../assets/avatarr1.jpg'),
  avatar_2: require('../../assets/avatarr2.jpg'),
  avatar_3: require('../../assets/avatarr3.jpg'),
  avatar_4: require('../../assets/avatarr4.jpg'),
  avatar_5: require('../../assets/avatarr5.jpg'),
};

interface UserInfoCardProps {}

export const UserInfoCard: React.FC<UserInfoCardProps> = () => {
  const {theme} = useTheme();
  const styles = getStyles(theme);
  const {userProfile, isLoading: authIsLoading} = useAuth();

  const currentUserData = userProfile;

  if (authIsLoading && !currentUserData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!currentUserData) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>Informações do usuário não disponíveis.</Text>
      </View>
    );
  }

  const avatarSource =
    currentUserData.picture && avatarImages[currentUserData.picture]
      ? avatarImages[currentUserData.picture]
      : require('../../assets/menu/profileImage.png');

  const formattedPhoneNumber = formatBrazilianPhoneNumber(currentUserData.phone_number);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={avatarSource} style={styles.profileImage} />
      <Text style={styles.name}>{currentUserData.name}</Text>
      <Text style={styles.email}>{currentUserData.email}</Text>
      {formattedPhoneNumber && <Text style={styles.email}>{formattedPhoneNumber}</Text>}
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(0,0,0,0)',
      borderRadius: 10,
      margin: 10,
    },
    profileImage: {
      width: 150,
      height: 150,
      borderRadius: 75,
      marginBottom: 15,
    },
    name: {
      ...theme.typography.subtitle,
      color: theme.colors.mainText,
      marginBottom: 8,
      textAlign: 'center',
    },
    email: {
      ...theme.typography.regular,
      color: theme.colors.mainText,
      marginBottom: 5,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
  });
