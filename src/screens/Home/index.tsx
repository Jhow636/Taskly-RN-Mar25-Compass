import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

import Header from '../../components/Header';
import { styles } from './Home.style';
import EmptyState from '../../components/EmptyState.tsx';
import Buttom from '../../components/Buttom/index.tsx';

const Home: React.FC = () => {
    return (
        <View style={styles.container}>
            <Header />
            <EmptyState />
            <Buttom 
                label='Criar Tarefa'
            />
        </View>
    );
};

export default Home;