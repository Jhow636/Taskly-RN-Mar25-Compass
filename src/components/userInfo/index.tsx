import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Theme } from '../../theme/Theme';
import { useTheme } from '../../theme/ThemeContext';
import { getRememberedEmail } from '../../storage/userStorage';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  picture?: string;
}

interface UserInfoCardProps {
  userData: UserInfo | null;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ userData }) => {



  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (!userData) {
    return null; // Ou outra renderização condicional caso userData seja nulo
  }




  return (
    <View style={styles.container}>
      {userData.picture && (
        <Image source={{ uri: userData.picture }} style={styles.profileImage} />
      )}
       <Image source={require(`../../assets/menu/profileImage.png`)} style={styles.profileImage} />
      <Text style={styles.name}>Rafaela Santos</Text>
      <Text style={styles.email}>{getRememberedEmail()}</Text>
      <Text style={styles.phone}>(23) 93232 - 3232</Text>
    </View>
  );
};

const getStyles = (theme: Theme) =>  StyleSheet.create({
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