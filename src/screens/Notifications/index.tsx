import React from 'react';
import { View, Text, StyleSheet ,Image} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';

const Notifications: React.FC = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Estamos ajustando os ponteiros para que você nunca mais perca a hora!</Text>
            <Text style={styles.subtext}>Em breve retorne aqui</Text>
            <Image  style={styles.image} source={require('../../assets/notivication.png')}/>
        </View>
    );
};

const getStyles = (theme:Theme)=> StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding:30,
        backgroundColor: theme.colors.background,
    },
    text: {
        ...theme.typography.bigTitle ,
        color:theme.colors.mainText,
    },
    image:{
        height:200,
        width:200,
        textAlign:'center',
    },
    subtext:{
        color:theme.colors.mainText,
    },

});

export default Notifications;