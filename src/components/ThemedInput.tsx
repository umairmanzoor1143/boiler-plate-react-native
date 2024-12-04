import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'primary' | 'outline' | 'search';
  containerStyle?: object;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  type = 'default',
  containerStyle,
  leftIcon,
  rightIcon,
  ...rest
}: ThemedInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        getContainerStyleByType(type),
        containerStyle,
      ]}>
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
          { color: textColor },
          getInputStyleByType(type),
          leftIcon ? styles.inputWithLeftIcon : null,
          rightIcon ? styles.inputWithRightIcon : null,
          style,
        ].filter(Boolean)}
        placeholderTextColor={useThemeColor({}, 'tabIconDefault')}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
      {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
    </View>
  );
}

const getContainerStyleByType = (type: ThemedInputProps['type']) => {
  switch (type) {
    case 'primary':
      return styles.primaryContainer;
    case 'outline':
      return styles.outlineContainer;
    case 'search':
      return styles.searchContainer;
    default:
      return styles.defaultContainer;
  }
};

const getInputStyleByType = (type: ThemedInputProps['type']) => {
  switch (type) {
    case 'primary':
      return styles.primaryInput;
    case 'outline':
      return styles.outlineInput;
    case 'search':
      return styles.searchInput;
    default:
      return styles.defaultInput;
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  iconContainer: {
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 10,
  },
  inputWithRightIcon: {
    paddingRight: 10,
  },
  // Container variants
  defaultContainer: {
    height: 50,
  },
  primaryContainer: {
    height: 56,
    borderRadius: 16,
  },
  outlineContainer: {
    height: 48,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    height: 40,
    borderRadius: 20,
  },
  // Input variants
  defaultInput: {
    fontSize: 14,
  },
  primaryInput: {
    fontSize: 16,
    fontWeight: '500',
  },
  outlineInput: {
    fontSize: 14,
  },
  searchInput: {
    fontSize: 14,
  },
}); 