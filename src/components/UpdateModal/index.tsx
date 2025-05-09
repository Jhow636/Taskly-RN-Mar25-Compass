import {   Text, TouchableOpacity, StyleSheet, Modal, View } from 'react-native';
import { Theme } from '../../theme/Theme';
import { useTheme } from '../../theme/ThemeContext';


interface UpdateModalProps {
   title:string,
   isVisible: boolean;
   action: () => void;
   confirmButtonText: string;
   content:string;
  }

const UpdateModal: React.FC<UpdateModalProps> = ({
  isVisible,
  title,
  confirmButtonText,
  action,
  content,
  }) => {
    const {theme} = useTheme();
    const styles = getStyle(theme);

    return(
      <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.content}>{content}</Text>
          <TouchableOpacity onPress={action}  style={styles.btn}>
            <Text style={styles.txt}> {confirmButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    );
};

const getStyle = (theme: Theme) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf:'flex-start',
  },
  content:{
    color:theme.colors.mainText,
    fontSize: 16,
    marginBottom: 20,
    marginLeft:5,
  },btn:{
    backgroundColor: theme.colors.secondaryAccent,
    height:37,
    width:281,
    borderRadius:8,
    justifyContent:'center',
  },
  txt:{
    color:theme.colors.secondaryBg,
    textAlign:'center',
    ...theme.typography.subtitle,
  },
});

export default UpdateModal;