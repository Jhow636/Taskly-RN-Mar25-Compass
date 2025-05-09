import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import axios from 'axios';

const updateAvatar = async (data: { picture: string }, token: string) => {
    const response = await axios.put(
        'http://15.229.11.44:3000/profile/avatar',
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};
import { useAuth } from '../../context/AuthContext'; // Para obter o token do usuário

const avatars = [
  { id: 1, source: require('../../assets/avatarr1.png') },
  { id: 2, source: require('../../assets/avatarr2.png') },
  { id: 3, source: require('../../assets/avatarr3.png') },
  { id: 4, source: require('../../assets/avatarr4.png') },
  { id: 5, source: require('../../assets/avatarr5.png') },
];

const AvatarUpdate: React.FC = () => {
  const navigation = useNavigation();
  const { idToken } = useAuth(); // Obtém o token do usuário autenticado
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectAvatar = (id: number) => {
    setSelectedAvatarId(id);
  };

  const handleConfirmSelection = async () => {
    if (selectedAvatarId === null) {
      Alert.alert('Aviso', 'Por favor, selecione um avatar para continuar.');
      return;
    }

    try {
      setLoading(true);
      const avatarId = `avatar_${selectedAvatarId}`;
      await updateAvatar({ picture: avatarId }, idToken); // Chama a API para atualizar o avatar

      Alert.alert('Sucesso', 'Avatar atualizado com sucesso!');
      navigation.goBack(); // Retorna para a tela anterior
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Falha ao atualizar o avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <Text style={styles.title}>ATUALIZE SEU AVATAR</Text>
        <Text style={styles.subtitle}>(Escolha somente um)</Text>
        <View style={styles.avatarContainer}>
          {avatars.map((avatar) => (
            <TouchableOpacity
              key={avatar.id}
              style={[
                styles.avatarButton,
                selectedAvatarId === avatar.id && styles.selectedAvatarButton,
              ]}
              onPress={() => handleSelectAvatar(avatar.id)}
              activeOpacity={0.7}
            >
              <Image
                source={avatar.source}
                style={[
                  styles.avatarImage,
                  selectedAvatarId !== null &&
                    selectedAvatarId !== avatar.id &&
                    styles.opaqueAvatar,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
        <Button
          title="CONFIRMAR SELEÇÃO"
          onPress={handleConfirmSelection}
          loading={loading}
          disabled={loading || selectedAvatarId === null}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  avatarButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarButton: { borderColor: '#6200EE' },
  avatarImage: { width: '100%', height: '100%' },
  opaqueAvatar: { opacity: 0.4 },
});

export default AvatarUpdate;