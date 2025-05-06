import React from 'react';
import {Pressable, Text, ActivityIndicator} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {useLogoutButtonStyles} from './LogoutButton.style';
import {useTheme} from '../../theme/ThemeContext';

interface LogoutButtonProps {}

const LogoutButton: React.FC<LogoutButtonProps> = () => {
  const styles = useLogoutButtonStyles();
  const {theme} = useTheme();
  const {logout, isLoading} = useAuth();

  const handleLogout = () => {
    console.log('LogoutButton: Pressionado');
    logout();
  };

  return (
    <Pressable
      onPress={handleLogout}
      style={({pressed}) => [
        styles.button,
        pressed && styles.buttonPressed,
        isLoading && styles.buttonDisabled,
      ]}
      disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <Text style={[theme.typography.mediumTitle, {color: theme.colors.secondaryBg}]}>
          Sair (Logout)
        </Text>
      )}
    </Pressable>
  );
};

export default LogoutButton;
