/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

// Couleurs générales GeneralColors
export const GeneralColors = {
  primary: "#DC0A2D",
  darkNeutral: "#212121",
  medium: "#666666",
  light: "#E0E0E0",
  background: "#EFEFEF",
  white: "#FFFFFF",
} as const;

// Couleurs des types de pokémon PokemonColors
export const PokemonColors = {
  bug: "#A7B723",
  dark: "#75574C",
  dragon: "#7037FF",
  electric: "#F9CF30",
  fairy: "#E69EAC",
  fighting: "#C12239",
  fire: "#F57D31",
  flying: "#A891EC",
  ghost: "#70559B",
  grass: "#74CB48",
  ground: "#DEC16B",
  ice: "#9AD6DF",
  normal: "#AAA67F",
  poison: "#A43E9E",
  psychic: "#FB5584",
  rock: "#B69E31",
  steel: "#B7B9D0",
  water: "#6493EB",
} as const;

// Couleurs sémantiques SemanticColors
export const SemanticColors = {
  primary: GeneralColors.primary,
  background: GeneralColors.background,
  surface: GeneralColors.white,
  text: GeneralColors.darkNeutral,
  textSecondary: GeneralColors.medium,
  border: GeneralColors.light,
  success: "#74CB48",
  warning: "#F9CF30",
  error: "#C12239",
} as const;

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Familles de polices
export const FontFamilies = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

export const Fonts = {
  mono: "monospace",
} as const;

// Taille de texte
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// Poids de police
export const Typography = {
  title: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.xxl,
  },

  subtitle: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.lg,
  },

  body: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },

  caption: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
  },

  button: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.md,
  },
} as const;

// Espacements

// Rayons

// Dimensions communes
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  screenHorizontal: 20,
  contentGap: 16,
  cardGap: 12,
  sectionGap: 24,
  inputHeight: 48,
  buttonHeight: 48,
} as const;

export const Cards = {
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
} as const;

export const Buttons = {
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
} as const;

export const Inputs = {
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
