import React from 'react';
import { StyleSheet, View } from 'react-native';
import BackMenu from '../../components/BackButtom';
import MenuOption from '../../components/menuOption';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme/Theme';
import { useTheme } from '../../theme/ThemeContext';

const Preferencies = () => {
    const navigation = useNavigation();
    const {theme} = useTheme();
    const styles = getStyles(theme);


    return (
        <View style={styles.container}>
            <BackMenu text="Preferências" />
            <View style={styles.btns}>
                <MenuOption title="Habilitar Tema Claro" action={ ()=>{navigation.navigate('DarkMode')}} />
            </View>
        </View>
    );
};

const getStyles = (theme: Theme ) => StyleSheet.create({
    container: {
       flex: 1,
       paddingTop: 20,
       backgroundColor:theme.colors.background,
    },
    btns: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Preferencies;
