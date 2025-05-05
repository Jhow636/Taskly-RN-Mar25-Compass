import React from 'react';
import { View, Text, Image} from 'react-native';
import { styles } from './Header.style';

const Header: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>TASKLY</Text>
            <Image
                source={require('../../assets/imgs/profileImage.png')}
                style={styles.profileImage}
            />
        </View>
    );
};

export default Header;