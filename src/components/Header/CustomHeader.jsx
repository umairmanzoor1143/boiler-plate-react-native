import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

function CustomHeader({
  leftComponent,
  leftIcon,
  onPressLeft,
  centerComponent,
  rightComponent,
  rightIcon,
  style,
  onPressRight,
  borderShadow,
  title
}) {
 const borderBottom = borderShadow ? styles.borderBottom : {};
  return (
    <View style={[styles.header, borderBottom, style]}>
      <View style={styles.HeaderLeft}>
        {leftComponent && leftComponent}
        {leftIcon && (
          <TouchableOpacity onPress={onPressLeft}>
            <Ionicons name={leftIcon} size={24} color={Colors.light.text} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.HeaderCenter}>
        {centerComponent && centerComponent}
        {title && <Text style={styles.titleText}>{title}</Text>}
      </View>
      <View style={styles.HeaderRight}>
        {rightIcon && (
          <TouchableOpacity onPress={onPressRight}>
            <Ionicons name={rightIcon} size={24} color={Colors.light.text} />
          </TouchableOpacity>
        )}
        {rightComponent && rightComponent}
      </View>
    </View>
  );
}

export default CustomHeader;

const styles = StyleSheet.create({
  header: {
    height: 100,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: "#A1CEDC",
  },
  borderBottom: {
    borderBottomWidth: 0.2222,
    borderBottomColor: "#e1e1e1",
    shadowColor: "#e1e1e1",
    shadowOffset: { width: 0, height: 0.333 },
    shadowOpacity: 0.2,
  },
  HeaderLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  HeaderCenter: {
    flex: 2,
    alignItems: 'center',
  },
  HeaderRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  }
});
