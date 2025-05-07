import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import BackMenu from '../../components/BackButtom';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';

const termsURL = 'https://sobreuol.noticias.uol.com.br/normas-de-seguranca-e-privacidade/en/';

const Terms = () => {

    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.nav}>
                <BackMenu text="Termos e Regulamentos" />
            </View>
            <WebView
                source={{ uri: termsURL }}
                startInLoadingState
                style={styles.webview}
            />
        </View>
    );
};

const getStyles = (theme: Theme) =>StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:theme.colors.secondaryBg
    },
    webview: {
        flex: 1,
    },
    nav: {
        justifyContent: 'center',
        height: 50,
        margin: 10,
    },
});

export default Terms;