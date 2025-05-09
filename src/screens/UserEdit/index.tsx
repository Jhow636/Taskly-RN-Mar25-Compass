import React, {useRef, useMemo, useState,useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { calculateProgressBarWidth } from '../../utils/AnimationUtils';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';
import { Platform } from 'react-native';
import BackMenu from '../../components/BackButtom';
import Input from '../../components/Input';
import useForm from '../../hooks/useForm';
import { formatPhoneNumber, validateEmail, validateFullName, validatePassword, validatePasswordConfirmation, validatePhone } from '../../utils/validation';
import Button from '../../components/Button';
import { getRememberedEmail } from '../../storage/userStorage';
import { useNavigation } from '@react-navigation/native';


const UserEdit: React.FC = () => {
  const navigation = useNavigation()
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [carregando, setCarregando] = useState(true);
  const [progressoAtual, setProgressoAtual] = useState(0);
  const progressoTotal = 100;
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const { widthInterpolation, progressPercentage } = calculateProgressBarWidth(
    animatedProgress,
    progressoAtual,
    progressoTotal,
  );

  useEffect(() => {
    // Simulação de um processo de carregamento
    let contador = 0;
      setProgressoAtual(contador);

      if (contador >= progressoTotal) {
        setCarregando(false);
      }


  }, []);

 const passwordRef = useRef<string>('');
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

  const {formState, handleChange, handleBlur} =
    useForm(initialValues, validations);

    const handleContinue = async () => {
      navigation.navigate('AvatarUpdate' as never);
    };

  const handlePhoneChange = (value: string) => {
      const formattedPhone = formatPhoneNumber(value);
      handleChange('phone')(formattedPhone);
    };
    const incrementProgress = () => {
      setProgressoAtual((prev) => Math.min(prev + 25, progressoTotal));
    };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
       <View>
          <View>
            <BackMenu text="Termos e Regulamentos" />
          </View>
          {carregando ? (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: widthInterpolation },
                  ]}
                  />
              </View>
              <Text>
                {`${Math.round(progressPercentage * 100)}%`}
              </Text>
            </View>
          ) : (
            <Text>Carregamento Concluído!</Text>
          )}
      </View>



      <View style={styles.form}>
      <Input
              label="Nome Completo"
              placeholder="João Silva"
              value={formState.fullName.value}
              onChangeText={handleChange('fullName')}
              onBlur={() => {
                handleBlur('fullName')();
                if (!formState.fullName.error && formState.fullName.value) {
                  incrementProgress(); // Incrementa o progresso se o nome for válido
                }
              }}
              error={formState.fullName.error}
              autoCapitalize="words"
            />
            <Input
              enable={false}
              label="E-mail"
              placeholder={getRememberedEmail() ?? undefined}
              autoCapitalize="none"
            />
             <Input
              label="Número"
              placeholder="(00) 9 0000-0000"
              value={formState.phone.value}
              onChangeText={handlePhoneChange}
              onBlur={()=>{
                handleBlur('phone')();
                if (!formState.phone.error && formState.phone.value) {
                  incrementProgress(); // Incrementa o progresso se o nome for válido
                }
              }}
              error={formState.phone.error}
              keyboardType="phone-pad"
            />
            <Button title="CONTINUAR" onPress={handleContinue} disabled={(progressPercentage * 100 === 50) ? false : true}/>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>StyleSheet.create({
  container: {
    flex:1,
    paddingTop: 20,
    backgroundColor:theme.colors.background,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop:40,
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
    paddingTop:40,
  },
  form:{
    width: '100%',
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop:40,
  },
});

export default UserEdit;
