import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Button from '../components/Button';
import {registerUser} from '../services/api';
import {AuthStackParamList} from '../navigation/types';

type AvatarSelectionRouteProp = RouteProp<
  AuthStackParamList, // Use AuthStackParamList
  'AvatarSelection'
>;
type AvatarSelectionNavigationProp = NativeStackNavigationProp<
  AuthStackParamList, // Use AuthStackParamList
  'AvatarSelection'
>;

const avatars = [
  {id: 1, source: require('../assets/avatarr1.png')},
  {id: 2, source: require('../assets/avatarr2.png')},
  {id: 3, source: require('../assets/avatarr3.png')},
  {id: 4, source: require('../assets/avatarr4.png')},
  {id: 5, source: require('../assets/avatarr5.png')},
];

const AvatarSelectionScreen: React.FC = () => {
  const route = useRoute<AvatarSelectionRouteProp>();
  const navigation = useNavigation<AvatarSelectionNavigationProp>();
  const {userData, password} = route.params;

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
      await registerUser(userData.email, password, userData.fullName, userData.phone, avatarId);

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <Text style={styles.title}>SELECIONE SEU AVATAR</Text>
        <Text style={styles.subtitle}>(Escolha somente um)</Text>
        <View style={styles.avatarContainer}>
          {avatars.map(avatar => (
            <TouchableOpacity
              key={avatar.id}
              style={[
                styles.avatarButton,
                selectedAvatarId === avatar.id && styles.selectedAvatarButton,
              ]}
              onPress={() => handleSelectAvatar(avatar.id)}
              activeOpacity={0.7}>
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
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
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
  selectedAvatarButton: {borderColor: '#6200EE'},
  avatarImage: {width: '100%', height: '100%'},
  opaqueAvatar: {opacity: 0.4},
});

export default AvatarSelectionScreen;
