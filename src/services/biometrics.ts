import {Platform} from 'react-native';
import {MMKV} from 'react-native-mmkv';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';

// Inicializa o armazenamento para configurações de biometria
const biometricsStorage = new MMKV({
  id: 'biometrics-storage',
  encryptionKey: 'biometrics-encryption-key',
});

// Chaves para o armazenamento
const BIOMETRICS_ENABLED = 'biometrics_enabled';
const BIOMETRICS_KEY = 'biometrics_key';

// Inicializa o módulo de biometria
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

// Verificar se o dispositivo suporta biometria
export const isBiometricsAvailable = async (): Promise<boolean> => {
  try {
    const {available, biometryType} = await rnBiometrics.isSensorAvailable();
    return available && biometryType !== undefined;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade de biometria:', error);
    return false;
  }
};

export const getBiometryType = async (): Promise<string | null> => {
  try {
    const {biometryType} = await rnBiometrics.isSensorAvailable();

    if (biometryType === BiometryTypes.Biometrics) {
      return Platform.OS === 'ios' ? 'TouchID/FaceID' : 'Impressão Digital';
    } else if (biometryType === BiometryTypes.TouchID) {
      return 'TouchID';
    } else if (biometryType === BiometryTypes.FaceID) {
      return 'FaceID';
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter tipo de biometria:', error);
    return null;
  }
};

// Ativar biometria
export const activateBiometrics = async (): Promise<boolean> => {
  try {
    // Verificar se a biometria está disponível
    const available = await isBiometricsAvailable();
    if (!available) {
      return false;
    }

    // Criar par de chaves para autenticação biométrica
    const {publicKey} = await rnBiometrics.createKeys();

    // Salvar a chave pública e marcar biometria como ativada
    biometricsStorage.set(BIOMETRICS_KEY, publicKey);
    biometricsStorage.set(BIOMETRICS_ENABLED, 'true');

    return true;
  } catch (error) {
    console.error('Erro ao ativar biometria:', error);
    return false;
  }
};

// Desativar biometria
export const deactivateBiometrics = (): void => {
  biometricsStorage.delete(BIOMETRICS_ENABLED);
  biometricsStorage.delete(BIOMETRICS_KEY);
};

// Verificar se a biometria está ativada
export const isBiometricsEnabled = (): boolean => {
  return biometricsStorage.getString(BIOMETRICS_ENABLED) === 'true';
};

// Autenticar com biometria
export const authenticateWithBiometrics = async (
  promptMessage: string = 'Confirme sua identidade',
): Promise<boolean> => {
  try {
    // Verificar se a biometria está ativada
    if (!isBiometricsEnabled()) {
      return false;
    }

    // Solicitar autenticação biométrica
    const {success} = await rnBiometrics.simplePrompt({
      promptMessage,
    });

    return success;
  } catch (error) {
    console.error('Erro na autenticação biométrica:', error);
    return false;
  }
};

export default {
  isBiometricsAvailable,
  getBiometryType,
  activateBiometrics,
  deactivateBiometrics,
  isBiometricsEnabled,
  authenticateWithBiometrics,
};
