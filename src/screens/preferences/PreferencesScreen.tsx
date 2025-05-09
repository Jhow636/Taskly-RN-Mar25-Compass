import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';



type PreferencesScreenProps ={
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

const PreferencesScreen = ({modalVisible, setModalVisible}: PreferencesScreenProps) => {
  const { theme, setAppTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | null>(null);
  const styles = getStyles(theme);

  const handleConfirm = () => {
    if (selectedTheme) {
      setAppTheme(selectedTheme);
    }
    setModalVisible(false);
  };

  return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
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
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textDecorationLine:'underline',
    alignSelf:'flex-start',
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  themeOption: {
    width: 134.5,
    height: 134.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor:theme.colors.secondaryBg,
  },
  selectedOption: {
    borderColor: '#6200ea',
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cancelButton: {
    borderRadius: 8,
    borderWidth:2,
    borderColor:theme.colors.primary,
    width:134.5,
    height:37,
    justifyContent:'center',
    alignItems:'center',
  },
  cancelText: {
    ...theme.typography.regular,
  },
  confirmButton: {
    borderRadius: 5,
    width:134.5,
    height:37,
    justifyContent:'center',
    alignItems:'center',
  },
  confirmText: {
    ...theme.typography.regular,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
