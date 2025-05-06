import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {COLORS} from '../constants/colors'; 
const screenWidth = Dimensions.get('window').width;
const modalWidth = screenWidth * 0.85;

interface BiometricsModalProps {
  visible: boolean;
  onCancel: () => void;
  onActivate: () => void;
  biometryType?: string | null;
}

const BiometricsModal: React.FC<BiometricsModalProps> = ({
  visible,
  onCancel,
  onActivate,
  biometryType = null,
}) => {
  const getBiometryText = () => {
    if (!biometryType) return 'impressão digital';
    if (biometryType.includes('Face')) return 'reconhecimento facial';
    return 'impressão digital';
  };

  const biometryText = getBiometryText();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Ative o Desbloqueio por Biometria</Text>
          <Text style={styles.description}>
            Use sua {biometryText} para acessar seu app de tarefas com rapidez e
            segurança. Se preferir, você ainda poderá usar sua senha sempre que
            quiser.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Agora não</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.activateButton}
              onPress={onActivate}>
              <Text style={styles.activateButtonText}>Ativar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: modalWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.MAIN_TEXT,
    marginBottom: 16,
    textAlign: 'left',
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.MAIN_TEXT,
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.LIGHT_PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  activateButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default BiometricsModal;
