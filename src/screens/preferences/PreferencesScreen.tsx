import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const PreferencesScreen = () => {
  const { theme, setAppTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | null>(null);

  const handleConfirm = () => {
    if (selectedTheme) {
      setAppTheme(selectedTheme);
    }
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.mainText }]}>Preferências</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.secondaryBg }]}>
          Alterar Tema
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.secondaryBg }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.mainText }]}>
              Escolha o tema
            </Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity
                onPress={() => setSelectedTheme('dark')}
                style={[
                  styles.themeOption,
                  selectedTheme === 'dark' && styles.selectedOption,
                ]}
              >
                <Image source={require('../../assets/img/moon.png')} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedTheme('light')}
                style={[
                  styles.themeOption,
                  selectedTheme === 'light' && styles.selectedOption,
                ]}
              >
                <Image source={require('../../assets/img/sun.png')} style={styles.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
                  Agora não
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.confirmButton, { backgroundColor: theme.colors.secondaryAccent }]}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  themeOption: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#6200ea',
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
  },
  cancelText: {
    fontSize: 16,
  },
  confirmButton: {
    padding: 10,
    borderRadius: 5,
  },
  confirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
