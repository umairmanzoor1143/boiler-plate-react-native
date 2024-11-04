import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from "@/styles/colors";
import {ThemedInput} from "@/components/ThemedInput";

export const FormInput = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  keyboardType = "default",
  placeholder,
  autoCapitalize = "none"
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
  backgroundColor = Colors.primary600 
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
    color: Colors.primary200,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f2f2f2',
  },
  inputText: {
    color: Colors.primary600,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 