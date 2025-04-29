import React, { useState } from 'react';

import { View, Text, TextInput, Pressable, Alert, Image } from 'react-native';
import { useLoginStyles } from './LoginStyles';
// Importar funções de storage do usuário (serão criadas depois)
// import { getUserByEmail } from '../storage/userStorage'; // Exemplo
// Importar hook de navegação (será configurado depois)
// import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
    const styles = useLoginStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const navigation = useNavigation(); // Para navegação

    const handleLogin = () => {
        // 1. Validação básica dos campos
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
            return;
        }
        // TODO: 2. Implementar validação de formato de e-mail

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
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />
            {/* TODO: Adicionar lógica para exibir erro real */}
            <Text style={styles.errorText}>{/* Erro aqui */}</Text>

            <Text style={styles.label}>Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
            />
            {/* TODO: Adicionar lógica para exibir erro real */}
            <Text style={styles.errorText}>{/* Erro aqui */}</Text>

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
