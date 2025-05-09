import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BackMenu from '../../components/BackButtom';
import MenuOption from '../../components/menuOption';
import { Theme } from '../../theme/Theme';
import { useTheme } from '../../theme/ThemeContext';
import PreferencesScreen from '../preferences/PreferencesScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const Preferencies = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const {theme} = useTheme();
    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <BackMenu text="Preferências" />
            <View style={styles.btns}>
                <MenuOption title= {theme.statusBarStyle !== 'dark'? "Habilitar Tema Claro": "Habilitar Tema Escuro"} 
                 action={() => { setModalVisible(true); }}
                 />
            </View>

        <PreferencesScreen modalVisible={modalVisible} setModalVisible={setModalVisible} />


        </SafeAreaView>
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
