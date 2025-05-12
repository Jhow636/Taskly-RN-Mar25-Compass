import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {useHeaderInternStyles} from './HeaderIntern.style';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/feather';
import {useTheme} from '../../theme/ThemeContext';
import {useAuth} from '../../context/AuthContext';

const avatarImages: Record<string, any> = {
  avatar_1: require('../../assets/avatarr1.jpg'),
  avatar_2: require('../../assets/avatarr2.jpg'),
  avatar_3: require('../../assets/avatarr3.jpg'),
  avatar_4: require('../../assets/avatarr4.jpg'),
  avatar_5: require('../../assets/avatarr5.jpg'),
};

const HeaderIntern: React.FC = () => {
  const styles = useHeaderInternStyles();
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {userProfile} = useAuth();

  const avatarSource =
    userProfile?.picture && avatarImages[userProfile.picture]
      ? avatarImages[userProfile.picture]
      : require('../../assets/imgs/profileImage.png');

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-left" size={25} color={theme.colors.secondaryBg} />
      </Pressable>
      <Text style={styles.titleText}>TASKLY</Text>
      <Image source={avatarSource} style={styles.profileImage} />
    </View>
  );
};

export default HeaderIntern;
