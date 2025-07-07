import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

import { AuthProvider } from "./context/AuthContext";
import AuthNavigator from "./navigation/AuthNavigator";
import MainNavigator from "./navigation/MainNavigator";
import { useAuth } from "./context/AuthContext";
import theme from "./utils/theme";

const Stack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Modern splash screen component
function SplashScreenComponent() {
  return (
    <View style={styles.splashContainer}>
      <Animatable.View animation="fadeIn" duration={1000} style={styles.splashContent}>
        <View style={styles.logoContainer}>
          <Animatable.View animation="bounceIn" delay={500} style={styles.logoCircle}>
            <Ionicons name="school" size={48} color={theme.colors.textLight} />
          </Animatable.View>
        </View>

        <Animatable.Text animation="fadeInUp" delay={800} style={styles.appTitle}>
          School Management
        </Animatable.Text>

        <Animatable.Text animation="fadeInUp" delay={1000} style={styles.appSubtitle}>
          Connecting Education
        </Animatable.Text>

        <Animatable.View animation="fadeInUp" delay={1200} style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animatable.View animation="slideInLeft" delay={1400} duration={1000} style={styles.loadingProgress} />
          </View>
        </Animatable.View>
      </Animatable.View>
    </View>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Hide splash screen when app is ready
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      {user ? <MainNavigator /> : <AuthNavigator />}
      <FlashMessage position="top" />
    </NavigationContainer>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>The app encountered an unexpected error. Please restart the app.</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Paper theme configuration
const paperTheme = {
  colors: {
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    disabled: theme.colors.textSecondary,
    placeholder: theme.colors.placeholder,
    backdrop: "rgba(0, 0, 0, 0.5)",
    notification: theme.colors.error,
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500",
    },
    light: {
      fontFamily: "System",
      fontWeight: "300",
    },
    thin: {
      fontFamily: "System",
      fontWeight: "100",
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <ErrorBoundary>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
        </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  splashContent: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  appTitle: {
    ...theme.typography.h2,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
    fontWeight: "bold",
  },
  appSubtitle: {
    ...theme.typography.body1,
    color: theme.colors.textLight,
    opacity: 0.9,
    marginBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    width: 200,
    alignItems: "center",
  },
  loadingBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingProgress: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    ...theme.typography.h4,
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  errorActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  retryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textLight,
  },
});
