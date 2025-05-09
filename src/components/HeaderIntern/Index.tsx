import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {useHeaderInternStyles} from './HeaderIntern.style';
import {useNavigation} from '@react-navigation/native';

const HeaderIntern: React.FC = () => {
  const styles = useHeaderInternStyles();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image style={styles.icon} source={require('../../assets/imgs/backImage.png')} />
      </Pressable>
      <Text style={styles.titleText}>TASKLY</Text>
      <Image source={require('../../assets/imgs/profileImage.png')} style={styles.profileImage} />
    </View>
  );
};

export default HeaderIntern;
