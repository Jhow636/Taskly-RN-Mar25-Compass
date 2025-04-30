import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { AdvancedCheckbox } from 'react-native-advanced-checkbox';
import { useLoginStyles } from './LoginStyles';
import { getUserByEmail, saveRememberedEmail, getRememberedEmail, clearRememberedEmail } from '../../storage/userStorage';
import { useNavigation } from '@react-navigation/native';
// Importar o tipo para a stack de navegação (será criado em App.tsx ou navigation file)
import { AuthStackParamList } from '../../navigation/types'; // Exemplo de caminho
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Regex simples para validação de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Definindo o tipo de navegação para a tela de login
type LoginScreenNavigationProp = NativeStackNavigationProp<
    AuthStackParamList,
    'Login' // Nome desta tela na stack de navegação
>;

const LoginScreen = () => {
    const styles = useLoginStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // Estado para Checkbox "Lembrar de mim"
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState(''); // Estado para erro genérico
    const navigation = useNavigation<LoginScreenNavigationProp>();

    // Efeito para carregar o e-mail lembrado (se houver)
    useEffect(() => {
        const rememberedEmail = getRememberedEmail(); // Busca o e-mail lembrado
        if (rememberedEmail) {
            setEmail(rememberedEmail); // Preenche o campo de e-mail com o e-mail lembrado
            setRememberMe(true); // Marca o checkbox como selecionado
        }
    }, []);

    const validateInputs = (): boolean => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');
        setLoginError(''); // Limpa o erro genérico ao tentar validar novamente

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

    const handleLogin = () => {
        if (!validateInputs()) {
            return; // Se a validação falhar, não prossegue com o login
        }

        // Busca o usuário pelo e-mail no MMKV
        const user = getUserByEmail(email);

        // Verifica se o usuário existe e se a senha corresponde
        if (user && user.password === password) { // Comparação de senha (precisa de hashing seguro no futuro)
            setLoginError(''); // Limpa qualquer erro anterior
            // Alert.alert('Sucesso', `Login realizado com sucesso! Bem-vindo(a), ${user.name || user.email}!`);

            // Lógica do "Lembrar de mim"
            if (rememberMe) {
                saveRememberedEmail(email); // Salva o e-mail se o checkbox estiver marcado
            } else {
                clearRememberedEmail(); // Limpa o e-mail lembrado se o checkbox não estiver marcado
            }

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' as any }],
            });

        } else {
            // Usuário não encontrado ou senha incorreta
            setLoginError('E-mail ou senha incorretos.');
        }
    };

    const navigateToRegister = () => {
        // Navegar para a tela de Cadastro (ex: 'Register')
        navigation.navigate('Register');
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.logo}
                source={require('../../assets/img/logo.png')}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) {
                        setEmailError(''); // Limpa o erro ao digitar
                    }
                    if (loginError) {
                        setLoginError(''); // Limpa o erro genérico ao digitar
                    }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />
            <Text style={[styles.errorText, { opacity: Number(!!emailError) }]}>
                {emailError || ''}
            </Text>

            <Text style={styles.label}>Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                value={password}
                onChangeText={(text) => {
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
            />
            <Text style={[styles.errorText, { opacity: Number(!!passwordError) }]}>
                {passwordError || ''}
            </Text>

            <Text style={[styles.errorText, { opacity: Number(!!loginError) }]}>
                {loginError || ''}
            </Text>

            {/* Checkbox "Lembrar de mim" */}
            <View style={styles.checkboxContainer}>
                <AdvancedCheckbox
                    value={rememberMe}
                    onValueChange={(newValue) => {
                        setRememberMe(!!newValue);
                        console.log('Checkbox clicked, new value:', newValue, 'isChecked:', !!newValue);
                    }}
                    label="Lembrar de mim"
                    labelPosition="right"
                    labelStyle={styles.checkboxLabel}
                    checkedImage={require('../../assets/img/checkbox-checked.png')}
                    checkBoxStyle={styles.checkbox}
                    checkedColor="#32C25B"
                    uncheckedColor="#B58B46"
                    animationType="bounce"
                    size={18}
                />
            </View>

            <Pressable
                onPress={handleLogin}
                style={styles.buttonPrimary}
            >
                <Text style={styles.buttonPrimaryText}>Entrar</Text>
            </Pressable>

            <Pressable
                onPress={navigateToRegister}
                style={styles.buttonSecondary}
            >
            <Text style={styles.buttonSecondaryText}>Criar Conta</Text>
            </Pressable>
        </View>
    );
};

export default LoginScreen;
