import React, {useRef, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Input from '../components/Input';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import useForm from '../hooks/useForm';

import BiometricsModal from '../components/BiometricsModal';
import {activateBiometrics} from '../services/biometrics';

export interface UserSignupData {
  fullName: string;
  email: string;
  phone: string;
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  AvatarSelection: {
    userData: UserSignupData;
    password: string;
  };
};

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Signup'>>();
  const passwordRef = useRef<string>('');

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [pendingUserData, setPendingUserData] = useState<{
    userData: UserSignupData;
    password: string;
  } | null>(null);

  const initialValues = useMemo(
    () => ({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirmation: '',
    }),
    [],
  );

  const validateFullName = (name: string): string | null => {
    if (!name) return 'Nome é obrigatório';
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return 'Nome deve ser composto (mínimo dois nomes)';
    if (name.length > 120) return 'Nome deve ter no máximo 120 caracteres';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return 'E-mail é obrigatório';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de e-mail inválido';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Número é obrigatório';
    const phoneRegex = /^\([0-9]{2}\) 9 [0-9]{4}-[0-9]{4}$/;
    if (!phoneRegex.test(phone)) return 'Formato: (DDD) 9 dddd-dddd';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 8) return 'Senha deve ter no mínimo 8 caracteres';
    if (password.length > 20) return 'Senha deve ter no máximo 20 caracteres';

    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);

    if (!hasSpecialChar || !hasLowerCase || !hasUpperCase) {
      return 'Senha deve conter 8-20 caracteres, letra maiúscula, minúscula e caractere especial';
    }

    return null;
  };

  const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
    if (!confirmation) return 'Confirmação de senha é obrigatória';
    if (password !== confirmation) return 'As senhas devem ser iguais';
    return null;
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers.length ? `(${numbers}` : '';
    } else if (numbers.length <= 3) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) 9 ${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) 9 ${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) 9 ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const validations = useMemo(
    () => ({
      fullName: validateFullName,
      email: validateEmail,
      phone: validatePhone,
      password: (value: string) => {
        passwordRef.current = value;
        return validatePassword(value);
      },
      passwordConfirmation: (confirmation: string) => {
        return validatePasswordConfirmation(passwordRef.current, confirmation);
      },
    }),
    [],
  );

  const {formState, handleChange, handleBlur, validateAllFields, getValues} = useForm(
    initialValues,
    validations,
  );

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    handleChange('phone')(formattedPhone);
  };

  const handleContinue = async () => {
    if (!validateAllFields()) return;

    const values = getValues();
    const userData: UserSignupData = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
    };
    const password = values.password;

    setBiometryType('Impressão Digital');
    setPendingUserData({userData, password});
    setShowBiometricModal(true);
  };

  const handleCancelBiometric = () => {
    setShowBiometricModal(false);
    if (pendingUserData) {
      navigation.navigate('AvatarSelection', {
        userData: pendingUserData.userData,
        password: pendingUserData.password,
      });
    }
  };

  const handleActivateBiometric = async () => {
    const success = await activateBiometrics();
    setShowBiometricModal(false);

    if (!success) {
      Alert.alert('Erro', 'Falha ao ativar a biometria.');
    }

    if (pendingUserData) {
      navigation.navigate('AvatarSelection', {
        userData: pendingUserData.userData,
        password: pendingUserData.password,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <BackButton onPress={() => navigation.navigate('Login')} />
          <Text style={styles.title}>CADASTRO</Text>
          <View style={styles.form}>
            <Input
              label="Nome Completo"
              placeholder="João Silva"
              value={formState.fullName.value}
              onChangeText={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
              error={formState.fullName.error}
              autoCapitalize="words"
            />
            <Input
              label="E-mail"
              placeholder="exemplo@email.com"
              value={formState.email.value}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={formState.email.error}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Número"
              placeholder="(00) 9 0000-0000"
              value={formState.phone.value}
              onChangeText={handlePhoneChange}
              onBlur={handleBlur('phone')}
              error={formState.phone.error}
              keyboardType="phone-pad"
            />
            <Input
              label="Senha"
              placeholder="Sua senha"
              value={formState.password.value}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={formState.password.error}
              isPassword
            />
            <Input
              label="Confirmar senha"
              placeholder="Repita sua senha"
              value={formState.passwordConfirmation.value}
              onChangeText={handleChange('passwordConfirmation')}
              onBlur={handleBlur('passwordConfirmation')}
              error={formState.passwordConfirmation.error}
              isPassword
            />
            <Button title="CRIAR CONTA" onPress={handleContinue} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BiometricsModal
        visible={showBiometricModal}
        biometryType={biometryType}
        onCancel={handleCancelBiometric}
        onActivate={handleActivateBiometric}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  container: {flex: 1},
  scrollContent: {flexGrow: 1, padding: 20},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 26,
    textAlign: 'center',
  },
  form: {width: '100%'},
});

export default SignupScreen;
