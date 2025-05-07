
import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';

type CarouselItemProps ={
    id:string,
    title:string,
    icon: any,
};

const CarouselItem = ({
    title,
    icon,
}: CarouselItemProps) => {
    const { theme } = useTheme();
    const styles = getStyle(theme);
    return (
            <TouchableOpacity 
                style={styles.container}
            >
                <Text style={styles.content}>{title}</Text>
                <Image source={icon}  style={[styles.icon]}/>
            </TouchableOpacity>

    );
};


const getStyle = (theme: Theme) => StyleSheet.create({

    container:{
        backgroundColor: theme.colors.secondaryBg,
        width:134,
        height:131,
        borderRadius:12,
        padding:16,
        display:'flex',
        justifyContent:'space-evenly',
        shadowColor:'#000000',
        shadowOffset:{
            width:0,
            height:4,
        },
        shadowOpacity:0.25,
        shadowRadius:4.65,
        elevation:6,
        marginLeft:16,

    },
    content:{
        ...theme.typography.subtitle,
        color:theme.colors.mainText,
    },
    icon:{
        width: 24,
        height: 24,
    },
});




export default CarouselItem;
