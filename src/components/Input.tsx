import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/Theme';


interface InputProps {
  enable?:boolean,
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | null;
  placeholder?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const Input: React.FC<InputProps> = ({
  enable,
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {

  const { theme } = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        editable={enable}
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        secureTextEntry={isPassword}
        keyboardType={keyboardType}
        placeholderTextColor={theme.colors.mainText}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const getStyles = (theme: Theme) =>StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color:theme.colors.mainText,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: theme.colors.secondaryBg,
    width: '100%',
    color:theme.colors.mainText,
  },
  inputError: {
    color:theme.colors.mainText,
    borderColor: theme.colors.error,
  },
  errorText: {
    color:theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
