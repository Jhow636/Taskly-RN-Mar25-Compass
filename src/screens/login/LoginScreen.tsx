import React, { useState } from 'react';

import { View, Text, TextInput, Pressable, Alert, Image } from 'react-native';
import { useLoginStyles } from './LoginStyles';
// Importar funções de storage do usuário (serão criadas depois)
// import { getUserByEmail } from '../storage/userStorage'; // Exemplo
// Importar hook de navegação (será configurado depois)
// import { useNavigation } from '@react-navigation/native';

// Regex simples para validação de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
    const styles = useLoginStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState(''); // Para erro genérico de login
    // const navigation = useNavigation(); // Para navegação

    const validateInputs = (): boolean => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');
        setLoginError(''); // Limpa erro genérico ao tentar validar novamente

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

        // TODO: 3. Implementar busca do usuário no MMKV pelo e-mail
        // const user = getUserByEmail(email);
        // if (user && user.password === password) { // Comparação de senha (precisa de hashing seguro no futuro)
        //    Alert.alert('Sucesso', 'Login realizado!');
        //    // Navegar para a tela principal
        //    // navigation.navigate('MainApp');
        // } else {
        //    Alert.alert('Erro', 'E-mail ou senha inválidos.');
        // }

        console.log('Tentativa de Login com:', email); // Placeholder
        Alert.alert('Login Offline', 'Lógica de verificação no MMKV a ser implementada.');
    };

    const navigateToRegister = () => {
        // TODO: Implementar navegação para a tela de Cadastro
        // navigation.navigate('Register');
        console.log('Navegar para Cadastro');
        Alert.alert('Navegação', 'Ir para a tela de Cadastro.');
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
                        setLoginError(''); // Limpa o erro genérico
                    }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

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
            {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            {/* Exibe erro genérico de login, se houver */}
            {!!loginError && <Text style={styles.errorText}>{loginError}</Text>}

            {/* TODO: Implementar Checkbox "Lembrar de mim" */}

            <Pressable
                onPress={handleLogin}
                style={styles.buttonPrimary}
            >
                <Text style={styles.buttonPrimaryText}>ENTRAR</Text>
            </Pressable>

            <Pressable
                onPress={navigateToRegister}
                style={styles.buttonSecondary}
            >
            <Text style={styles.buttonSecondaryText}>CRIAR CONTA</Text>
            </Pressable>
        </View>
    );
};

export default LoginScreen;
