import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import theme from "../../utils/theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requirePasswordChange) {
        // Navigate to change password screen if it's a first-time login
        navigation.navigate("ChangePassword");
      }
      // Navigation for regular login is handled by AuthContext
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <LinearGradient colors={theme.colors.gradients.primary} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          {/* Header */}
          <Animatable.View animation="fadeInDown" delay={200} style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="school-outline" size={50} color={theme.colors.textLight} />
              </View>
            </View>
            <Text style={styles.title}>School Management</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </Animatable.View>

          {/* Login Form */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
            <Card padding="xl" shadow="xl">
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={theme.colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={theme.colors.placeholder}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={theme.colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Enter your password"
                      placeholderTextColor={theme.colors.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth={true}
                  size="large"
                  style={styles.loginButton}
                />
              </View>
            </Card>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View animation="fadeIn" delay={600} style={styles.footer}>
            <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signUpText}>
                Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.xxl,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.h5,
    color: theme.colors.textLight,
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {
    width: "100%",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.text,
    height: "100%",
  },
  passwordInput: {
    paddingRight: theme.spacing.xl,
  },
  passwordToggle: {
    padding: theme.spacing.sm,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    ...theme.typography.subtitle2,
    color: theme.colors.primary,
  },
  loginButton: {
    // marginTop: theme.spacing.md,
    height: 50, // Adjust the height as needed
    paddingVertical: 10, // Adjust the padding vertically
  },
  footer: {
    width: "100%",
    paddingVertical: theme.spacing.xl,
  },
  signUpButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  signUpText: {
    ...theme.typography.body1,
    color: theme.colors.textLight,
  },
  signUpLink: {
    ...theme.typography.subtitle1,
    color: theme.colors.textLight,
    textDecorationLine: "underline",
  },
});
