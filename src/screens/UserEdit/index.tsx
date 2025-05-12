import React, {useRef, useMemo, useState, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {calculateProgressBarWidth} from '../../utils/AnimationUtils';
import {useTheme} from '../../theme/ThemeContext';
import {Theme} from '../../theme/Theme';
import BackMenu from '../../components/BackButtom';
import Input from '../../components/Input';
import useForm from '../../hooks/useForm';
import {formatPhoneNumber, validateFullName, validatePhone} from '../../utils/validation';
import Button from '../../components/Button';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type UserEditStackParamList = {
  UserEditScreen: undefined;
  AvatarUpdate: {
    newName: string;
    newPhone: string;
    currentPicture: string | undefined;
  };
};

const UserEdit: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserEditStackParamList, 'UserEditScreen'>>();
  const {theme} = useTheme();
  const styles = getStyles(theme);
  const {userProfile, isLoading: authLoading} = useAuth();
  const [carregandoFormulario, setCarregandoFormulario] = useState(true);
  const [progressoAtual, setProgressoAtual] = useState(0);
  const progressoTotal = 100;
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const {widthInterpolation, progressPercentage} = calculateProgressBarWidth(
    animatedProgress,
    progressoAtual,
    progressoTotal,
  );

  const initialValues = useMemo(
    () => ({
      fullName: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone_number || '',
    }),
    [userProfile],
  );

  const validations = useMemo(
    () => ({
      fullName: validateFullName,
      phone: validatePhone,
    }),
    [],
  );

  const {formState, handleChange, handleBlur, validateAllFields, getValues, setValues} = useForm(
    initialValues,
    validations,
  );

  useEffect(() => {
    if (userProfile) {
      if (typeof setValues === 'function') {
        setValues({
          fullName: userProfile.name || '',
          email: userProfile.email || '',
          phone: formatPhoneNumber(userProfile.phone_number || ''),
        });
      } else {
        console.warn(
          'UserEditScreen: setValues function is not available from useForm hook. Form may not populate correctly.',
        );
      }

      let initialProgress = 0;
      if (userProfile.name) {
        initialProgress += 25;
      }
      if (userProfile.phone_number) {
        initialProgress += 25;
      }
      setProgressoAtual(initialProgress);
      setCarregandoFormulario(false);
    } else if (!authLoading) {
      setCarregandoFormulario(false);
    }
  }, [userProfile, authLoading, setValues]);

  useEffect(() => {
    // Recalcular progresso sempre que formState mudar
    let newProgress = 0;
    const fieldsToProgress = ['fullName', 'phone'] as const; // Campos que contam para o progresso
    const progressPerField = 25; // Quanto cada campo válido contribui

    fieldsToProgress.forEach(fieldName => {
      if (formState[fieldName] && formState[fieldName].value && !formState[fieldName].error) {
        newProgress += progressPerField;
      }
    });
    setProgressoAtual(Math.min(newProgress, progressoTotal));
  }, [formState, progressoTotal]); // Depende de formState

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhoneNumber(value);
    handleChange('phone')(formattedPhone);
  };

  const handleContinue = async () => {
    if (!validateAllFields()) {
      return;
    }

    const values = getValues();
    navigation.navigate('AvatarUpdate', {
      newName: values.fullName,
      newPhone: values.phone,
      currentPicture: userProfile?.picture,
    });
  };

  if (authLoading && !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Carregando dados do usuário...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View>
          <View>
            <BackMenu text="Editar Perfil" />
          </View>
          {carregandoFormulario ? (
            <View style={styles.progressBarContainer}>
              <Text>Carregando formulário...</Text>
            </View>
          ) : (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBarFill, {width: widthInterpolation}]} />
              </View>
             
            </View>
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
            }}
            error={formState.fullName.error}
            autoCapitalize="words"
          />
          <Input
            label="E-mail"
            value={formState.email.value}
            placeholder="seu@email.com"
            autoCapitalize="none"
            enable={false}
          />
          <Input
            label="Número"
            placeholder="(00) 9 0000-0000"
            value={formState.phone.value}
            onChangeText={handlePhoneChange}
            onBlur={() => {
              handleBlur('phone')();
            }}
            error={formState.phone.error}
            keyboardType="phone-pad"
          />
          <Button
            title="CONTINUAR PARA AVATAR"
            onPress={handleContinue}
            disabled={
              !(
                formState.fullName.value &&
                !formState.fullName.error &&
                formState.phone.value &&
                !formState.phone.error
              )
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: theme.colors.background,
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
    form: {
      width: '100%',
      paddingLeft: 40,
      paddingRight: 40,
      paddingTop: 40,
    },
  });

export default UserEdit;
