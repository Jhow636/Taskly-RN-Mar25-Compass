import React, {useEffect} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

const SplashScreen: React.FC<{onFinish?: () => void}> = ({onFinish}) => {
  const {theme} = useTheme();

  useEffect(() => {
    // Simula carregamento (ex: 2 segundos)
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Image source={require('../assets/img/logo.png')} style={styles.logo} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 56,
  },
});

export default SplashScreen;
