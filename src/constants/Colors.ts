/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#007AFF';
const tintColorDark = '#091B4E';

export const baseColors = {
  primary: {
    800: "#091B4E",
    600: "#091B4E",
    200: "#6B7695",
    100: "#C6CAD8",
    50: "#E9F7FF",
  },
  grey: {
    400: "#B4B4B4",
    300: "#DDDFE4",
    200: "#E8E8E8",
    100: "#F5F6FB",
    50: "#F6F9FF",
  },
  accent: {
    link: "#005EFF",
    success: "#00BCB3",
    danger: "#DD0000",
    dangerLight: "#FFE5E5",
    primary: "#23ACFF", 
  },
  white: "#FFF",
  black: "#000",
};

export const Colors = {
  light: {
    
    text: '#11181C',
    background: '#fff',
    inputBackground: '#F6F9FF',
    inputBackgroundDark: '#091B4E',
    disabledInput: '#E5E5E5',
    inputBorder: '#E5E5E5',
    tint: tintColorLight,
    backgroundDark: '#091B4E',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    dangerLight: baseColors.accent.dangerLight,
    danger: baseColors.accent.danger,
    accent: baseColors.accent,
    grey: baseColors.grey,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
