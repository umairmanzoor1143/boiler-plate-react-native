// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet } from 'react-native';
import { ComponentProps } from 'react';

type IconProps = ComponentProps<typeof Ionicons>;

export function TabBarIcon({ 
  style, 
  ...rest 
}: IconProps & { 
  style?: StyleSheet.NamedStyles<any>
}) {
  return <Ionicons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />;
}
