import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {useHeaderInternStyles} from './HeaderIntern.style';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/feather';
import {useTheme} from '../../theme/ThemeContext';

const HeaderIntern: React.FC = () => {
  const styles = useHeaderInternStyles();
  const navigation = useNavigation();
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-left" size={25} color={theme.colors.secondaryBg} />
      </Pressable>
      <Text style={styles.titleText}>TASKLY</Text>
      <Image source={require('../../assets/imgs/profileImage.png')} style={styles.profileImage} />
    </View>
  );
};

export default HeaderIntern;
