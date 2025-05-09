import { Text, TouchableOpacity, StyleSheet, Image, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/feather';

type BackProps = {
    text?: string;
};

const BackMenu = ({ text }: BackProps) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.view}>
            <TouchableOpacity
                style={styles.container}
                onPress={() => navigation.goBack()}
            >
               <Icon name="chevron-left" size={25} color={theme.colors.mainText} />

                <Text
                    onPress={() => navigation.goBack()}
                    style={styles.content}
                >
                    Voltar
                </Text>
            </TouchableOpacity>
            {text && <Text style={styles.txt}>{text}</Text>}
        </View>
    );
};

const getStyles = (theme: Theme) =>
    StyleSheet.create({
        view: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        container: {
            backgroundColor: theme.colors.secondaryText,
            ...theme.typography.subtitle,
            width: 113,
            height: 48,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            shadowColor: '#000000',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4.65,
            elevation: 6,
        },
        content: {
            ...theme.typography.subtitle,
            color:theme.colors.mainText,
        },
        icon: {
            width: 9.75,
            height: 17.25,
            alignSelf: 'center',
        },
        txt: {
            ...theme.typography.regular,
            color:theme.colors.mainText,
        },
    });

export default BackMenu;
