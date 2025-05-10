import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Theme} from '../../theme/Theme';
import {useTheme} from '../../theme/ThemeContext';
import {getRememberedEmail} from '../../storage/userStorage';
import {SafeAreaView} from 'react-native-safe-area-context';

const avatarImages: Record<string, any> = {
  avatar_1: require('../../assets/avatarr1.jpg'),
  avatar_2: require('../../assets/avatarr2.jpg'),
  avatar_3: require('../../assets/avatarr3.jpg'),
  avatar_4: require('../../assets/avatarr4.jpg'),
  avatar_5: require('../../assets/avatarr5.jpg'),
};

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  picture?: string;
}

interface UserInfoCardProps {
  userData: UserInfo | null;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({userData}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  if (!userData) {
    return null;
  }

  const avatarSource =
    userData.picture && avatarImages[userData.picture]
      ? avatarImages[userData.picture]
      : require('../../assets/menu/profileImage.png');

  return (
    <SafeAreaView style={styles.container}>
      <Image source={avatarSource} style={styles.profileImage} />
      <Text style={styles.name}>{userData.name}</Text>
      <Text style={styles.email}>{userData.email}</Text>
      <Text style={styles.phone}>{userData.phone}</Text>
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
      borderRadius: 50,
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
    phone: {
      textAlign: 'center',
      ...theme.typography.regular,
      color: theme.colors.mainText,
    },
  });
