import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#ffffff";

export const colors = {
  light: {
    text: "#11181C",

    background: "#F8FAFC",
    card: "#FFFFFF",

    tint: tintColorLight,

    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,

    primary: "#163B63",
    primaryDark: "#0F2A45",

    accent: "#7E78F1",
    muted: "#64748B",

    border: "#E2E8F0",

    white: "#FFFFFF",
  },

  dark: {
    text: "#ECEDEE",

    background: "#151718",
    card: "#1E293B",

    tint: tintColorDark,

    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,

    primary: "#3B82F6",
    primaryDark: "#1D4ED8",

    accent: "#A78BFA",
    muted: "#94A3B8",

    border: "#334155",

    white: "#FFFFFF",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },

  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },

  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

    serif: "Georgia, 'Times New Roman', serif",

    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",

    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  md: 12,
  lg: 18,
  xl: 28,
  full: 999,
};
