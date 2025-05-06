import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Pressable, Image, ActivityIndicator, Alert} from 'react-native';
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import {useLoginStyles} from './LoginStyles';
import {useTheme} from '../../theme/ThemeContext';
import {
  saveRememberedEmail,
  getRememberedEmail,
  clearRememberedEmail,
} from '../../storage/userStorage';
import {useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '../../navigation/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {loginUser, CustomApiError} from '../../services/api';
import {useAuth} from '../../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const styles = useLoginStyles();
  const {theme} = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const auth = useAuth();

  useEffect(() => {
    const rememberedEmail = getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateInputs = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    if (!email.trim()) {
      setEmailError('Por favor, preencha o e-mail.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('E-mail inválido.');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Por favor, preencha a senha.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.');
      isValid = false;
    }
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs() || isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const {id_token, refresh_token} = await loginUser(email, password);
      auth.login(id_token, refresh_token);

      if (rememberMe) {
        saveRememberedEmail(email);
      } else {
        clearRememberedEmail();
      }
    } catch (error) {
      console.error('LoginScreen handleLogin Error:', error);
      if (error instanceof CustomApiError) {
        if (error.status === 401) {
          setLoginError('E-mail ou senha incorretos.');
        } else if (error.status === -1) {
          setLoginError('Falha na conexão. Verifique sua internet.');
        } else {
          setLoginError(error.message || 'Ocorreu um erro durante o login.');
        }
      } else {
        setLoginError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navigateToRegister = () => {
    Alert.alert('Em breve', 'A tela de cadastro ainda será implementada.');
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../../assets/img/logo.png')} />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (emailError) {
            setEmailError('');
          }
          if (loginError) {
            setLoginError('');
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!isLoggingIn}
      />
      <Text style={[styles.errorText, {opacity: Number(!!emailError)}]}>{emailError || ' '}</Text>

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (passwordError) {
            setPasswordError('');
          }
          if (loginError) {
            setLoginError('');
          }
        }}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        editable={!isLoggingIn}
      />
      <Text style={[styles.errorText, {opacity: Number(!!passwordError)}]}>
        {passwordError || ' '}
      </Text>

      <Text style={[styles.errorText, {opacity: Number(!!loginError)}]}>{loginError || ' '}</Text>

      <View style={styles.checkboxContainer}>
        <AdvancedCheckbox
          value={rememberMe}
          onValueChange={newValue => setRememberMe(!!newValue)}
          label="Lembrar de mim"
          labelPosition="right"
          labelStyle={styles.checkboxLabel}
          checkedImage={require('../../assets/img/checkbox-checked.png')}
          checkBoxStyle={styles.checkbox}
          checkedColor="#32C25B"
          uncheckedColor="#B58B46"
          animationType="bounce"
          size={18}
          disabled={isLoggingIn}
        />
      </View>

      <Pressable
        onPress={handleLogin}
        style={[styles.buttonPrimary, isLoggingIn && styles.buttonDisabled]}
        disabled={isLoggingIn}>
        {isLoggingIn ? (
          <ActivityIndicator color={theme.colors.secondaryBg} />
        ) : (
          <Text style={styles.buttonPrimaryText}>Entrar</Text>
        )}
      </Pressable>

      <Pressable
        onPress={navigateToRegister}
        style={[styles.buttonSecondary, isLoggingIn && styles.buttonDisabled]}
        disabled={isLoggingIn}>
        <Text style={styles.buttonSecondaryText}>Criar Conta</Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;
