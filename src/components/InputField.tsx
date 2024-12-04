import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import {Colors} from "@/constants/Colors";
const InputField = ({
  value,
  onChangeText,
  placeHolder,
  secureTextEntry = false,
  editable = true,
  style = {},
  ref,
  ...rest
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeHolder: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: StyleSheet.NamedStyles<any>;
  ref?: React.RefObject<TextInput>;
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeHolder}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        editable={editable}
        autoCorrect={false}
        autoCapitalize="none"
        {...rest}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 50,
    backgroundColor: Colors.light.lightGrey100,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  input: {
    fontSize: 14,
    color: Colors.light.primary800,
  },
});
