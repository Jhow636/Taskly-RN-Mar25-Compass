import React from 'react';
import {View, TextInput, TouchableOpacity, Text, StyleSheet, TextInputProps} from 'react-native';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {useTheme} from '../../theme/ThemeContext'; // Supondo que você tem useTheme
import {faCircleArrowRight} from '@fortawesome/free-solid-svg-icons/faCircleArrowRight';
import {FontAwesomeIcon, FontAwesomeIconStyle} from '@fortawesome/react-native-fontawesome';

interface AddItemInputProps extends Omit<TextInputProps, 'onChangeText' | 'value' | 'style'> {
  inputValue: string;
  onInputChange: (text: string) => void;
  onAddItem: () => void;
  placeholder: string;
  buttonIcon: IconDefinition;
  inputLabel?: string;
  // Adicione quaisquer outras props de estilo que você queira passar para os containers ou ícone
  iconSize?: number;
  iconStyle?: FontAwesomeIconStyle;
}

const AddItemInput: React.FC<AddItemInputProps> = ({
  inputValue,
  onInputChange,
  onAddItem,
  placeholder,
  inputLabel,
  ...textInputProps // Restantes das props do TextInput
}) => {
  const {theme} = useTheme(); // Para estilização consistente
  const styles = getAddItemInputStyles(theme);

  return (
    <View>
      {inputLabel && <Text style={styles.label}>{inputLabel}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          value={inputValue}
          onChangeText={onInputChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondaryText} // Cor do placeholder do tema
          style={styles.input}
          onSubmitEditing={onAddItem} // Permite adicionar com "Enter"
          {...textInputProps}
        />
        <TouchableOpacity style={styles.button} onPress={onAddItem} activeOpacity={0.7}>
          <FontAwesomeIcon
            icon={faCircleArrowRight}
            size={20}
            style={styles.submitIcon as FontAwesomeIconStyle}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Estilos para AddItemInput (podem ser movidos para um arquivo separado AddItemInputStyles.tsx)
const getAddItemInputStyles = (theme: any) =>
  StyleSheet.create({
    label: {
      // Estilo copiado/adaptado de EditScreenStyles
      ...theme.typography.mediumTitle,
      fontSize: 20,
      marginBottom: 4,
      marginTop: 12,
      color: theme.colors.secondaryText,
    },
    inputContainer: {
      // Estilo copiado/adaptado de EditScreenStyles (tagContainer)
      flexDirection: 'row',
      alignItems: 'center', // Para alinhar o TextInput e o botão verticalmente
      backgroundColor: theme.colors.secondaryBg,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      paddingHorizontal: 2, // Pequeno padding para não colar o botão na borda
      width: '100%', // Para ocupar toda a largura disponível
    },
    input: {
      // Estilo copiado/adaptado de EditScreenStyles
      flex: 1, // Para o TextInput ocupar o espaço disponível
      paddingHorizontal: 15, // Padding interno do TextInput
      paddingVertical: 12,
      ...theme.typography.regular,
      color: theme.colors.mainText,
      width: '100%', // Para ocupar toda a largura disponível
    },
    button: {
      // Estilo copiado/adaptado de EditScreenStyles (buttonArrow)
      padding: 12, // Área de toque para o botão
    },
    submitIcon: {
      color: theme.colors.secondaryAccent,
    },
  });

export default AddItemInput;
