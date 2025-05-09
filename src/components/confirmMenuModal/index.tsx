import {   Text, TouchableOpacity, StyleSheet, Modal, View } from 'react-native';
import { Theme } from '../../theme/Theme';
import { useTheme } from '../../theme/ThemeContext';


interface ConfirmMenuModalProps {
   title:string,
   isVisible: boolean;
   onClose: () => void;
   onConfirm: () => void;
   confirmButtonText: string;
   confirmButtonColor?: string;
   modalText?: string; // Nova prop para a mensagem do modal
   action:() => any;
  }

const ConfirmMenuModal: React.FC<ConfirmMenuModalProps> = ({
   isVisible,
   onClose,
   onConfirm,
   confirmButtonText,
   confirmButtonColor = 'red',
   modalText,
   title,
   action
  }) => {
    const {theme} = useTheme();
    const styles = getStyle(theme);

    return(
        <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{title}</Text>
          <Text style={styles.modalSubText}>{modalText}</Text>
          {/* ... restante do seu modal */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.dennyButton} onPress={onClose}>
              <Text style={styles.dennyButtonText} >Agora não</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: confirmButtonColor }]}
              onPress={()=>{onConfirm()}}
            >
              <Text style={styles.buttonText} >{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    );
};

const getStyle = (theme: Theme) => StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      backgroundColor: theme.colors.background,
      width:329,
      minHeight:187,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      alignSelf:'flex-start',
      marginLeft:5,
      color: theme.colors.mainText,
    },
    modalSubText: {
      fontSize: 16,
      color: theme.colors.mainText,
      marginBottom: 20,
      marginLeft:5,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    button: {
      backgroundColor: '#ddd',
      borderRadius: 8,
      textAlign:'center',
      justifyContent:'center',
      minWidth:134.5,
      height:37,
    },
    dennyButton: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderRadius: 8,
      textAlign:'center',
      justifyContent:'center',
      minWidth:134.5,
      height:37,
      borderWidth:2,
      borderColor: theme.colors.primary,
    },
    confirmButton: {
      backgroundColor: 'red',
    },
    buttonText: {
      color: theme.colors.secondaryBg,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    dennyButtonText: {
      color: '#5020ec',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

export default ConfirmMenuModal;