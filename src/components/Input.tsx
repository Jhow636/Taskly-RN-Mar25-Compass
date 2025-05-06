import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';

interface InputProps {
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
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        secureTextEntry={isPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: '#1D1D1D',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#5B3CC4',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  inputError: {
    borderColor: '#FF1D1D',
  },
  errorText: {
    color: '#FF1D1D',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
