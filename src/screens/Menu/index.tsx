import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { UserInfoCard } from '../../components/userInfo';
import MenuOption from '../../components/menuOption';
import CarouselItem, { CarouselItemProps } from '../../components/carouselItem'; // Ajuste o caminho se necessário
import ConfirmMenuModal from '../../components/confirmMenuModal';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';

const mensage = {
    userEdit:"Editar Informações Pessoais",
    biometric: 'Mudar Biometria', 
    logOut:'Sair da conta',
    accountExclude:'Excluir Conta',
};
const icons = {
    user: require('../../assets/menu/perfilIcon.png'),
    biometric: require('../../assets/menu/biometric.png'),
    logOut: require('../../assets/menu/out.png'),
    exclude: require('../../assets/menu/trash.png'),
};



const Menu: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = getStyles(theme);
    
    const carouselData: CarouselItemProps[] = [
        {
          id: '1',
          title: mensage.userEdit,
          icon: icons.user,
        },
        {
          id: '2',
          title: mensage.biometric,
          icon: icons.biometric,

        },
        {
          id: '3',
          title: mensage.logOut,
          icon: icons.logOut,
        },
        {
          id: '4',
          title: mensage.accountExclude,
          icon: icons.exclude,
        },
      ];

    return (
      <View style={styles.container}>
        <UserInfoCard userData={true}/>

        {/* -----------Carrossel ----------- */}
        <FlatList
        data={carouselData}
        renderItem={({ item }) => <CarouselItem {...item} />}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselItem}
        style={styles.carouselContainer}
      />

        <View style={styles.rowOptions}>
          < MenuOption  title='Preferências' action={ ()=>{navigation.navigate('Preferencies')}} />
          < MenuOption  title='Termos e regulamentos' action={ ()=>{navigation.navigate('Terms')}} />
        </View>
      </View>
    );
  };

const getStyles =(theme:Theme)=> StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    carouselContainer: {
        marginLeft:16,
        maxHeight:144,
        marginBottom:20,
    },
    rowOptions:{
        justifyContent:'space-around',
    },
    carouselItem:{
        marginLeft:16,
    },
});

export default Menu;