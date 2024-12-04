import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardTypeOptions } from 'react-native';
import {Colors} from "@/constants/Colors";
import {ThemedInput} from "@/components/ThemedInput";

export const FormInput = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  keyboardType = "default",
  placeholder,
  autoCapitalize = "none"
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <ThemedInput
      value={value}
      containerStyle={styles.input}
      onChangeText={onChangeText}
      style={styles.inputText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      placeholder={placeholder}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

export const FormButton = ({ 
  title, 
  onPress, 
  backgroundColor = Colors.light.primary600
}: {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
}) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor }]} 
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
  },
  labelContainer: {
    marginVertical: 8,
  },
  labelText: {
    fontSize: 14,
    color: Colors.light.primary200,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f2f2f2',
  },
  inputText: {
    color: Colors.light.primary600,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 