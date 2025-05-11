import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {Theme} from '../../theme/Theme';
import {useState} from 'react';
import ConfirmMenuModal from '../confirmMenuModal';

type CarouselItemProps = {
  id: string;
  title: string;
  icon: any;
  modalTextconten: React.ReactNode;
  acceptText: string;
  modalTitle: string;
  action: () => any;
};

const CarouselItem = ({
  title,
  icon,
  modalTextconten,
  acceptText,
  modalTitle,
  action,
}: CarouselItemProps) => {
  const {theme} = useTheme();
  const styles = getStyle(theme);
  const [modal, setModal] = useState(false);

  return (
    <TouchableOpacity style={styles.container} onPress={() => setModal(!modal)}>
      <ConfirmMenuModal
        isVisible={modal}
        onClose={() => setModal(false)}
        modalText={modalTextconten as string}
        confirmButtonText={acceptText}
        title={modalTitle}
        onConfirm={action}
      />

      <Text style={styles.content}>{title}</Text>
      {icon}
    </TouchableOpacity>
  );
};

const getStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.secondaryBg,
      width: 134,
      height: 131,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      justifyContent: 'space-evenly',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4.65,
      elevation: 6,
      marginLeft: 16,
    },
    content: {
      ...theme.typography.subtitle,
      color: theme.colors.mainText,
    },
    icon: {
      width: 24,
      height: 24,
    },
  });

export default CarouselItem;
