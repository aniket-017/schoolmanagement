import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const theme = {
  colors: {
    primary: "#2196F3",
    primaryDark: "#1976D2",
    primaryLight: "#BBDEFB",
    secondary: "#FF9800",
    secondaryDark: "#F57C00",
    secondaryLight: "#FFE0B2",
    accent: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
    success: "#4CAF50",

    // Background colors
    background: "#F5F5F5",
    surface: "#FFFFFF",
    card: "#FFFFFF",

    // Text colors
    text: "#212121",
    textSecondary: "#757575",
    textLight: "#FFFFFF",
    placeholder: "#BDBDBD",

    // Border colors
    border: "#E0E0E0",
    divider: "#EEEEEE",

    // Status colors
    online: "#4CAF50",
    offline: "#9E9E9E",
    pending: "#FF9800",
    completed: "#4CAF50",
    grey: "#9E9E9E",

    // Gradient colors
    gradients: {
      primary: ["#2196F3", "#1976D2"],
      secondary: ["#FF9800", "#F57C00"],
      success: ["#4CAF50", "#388E3C"],
      warning: ["#FF9800", "#F57C00"],
      error: ["#F44336", "#D32F2F"],
    },
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "bold",
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: "bold",
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: "600",
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 22,
    },
    body1: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 20,
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 24,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 16,
    },
    button: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
      textTransform: "uppercase",
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 2.0,
      elevation: 2,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 4.0,
      elevation: 4,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 8.0,
      elevation: 8,
    },
  },

  screen: {
    width,
    height,
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
  },

  animations: {
    fast: 200,
    medium: 300,
    slow: 500,
  },

  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
};

export default theme;
