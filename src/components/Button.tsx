import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled = false,
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      disabled={disabled || loading}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' ? styles.primaryText : styles.secondaryText,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 16,
    width: '100%',
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: '#5B3CC4',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5B3CC4',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#5B3CC4',
  },
});

export default Button;
