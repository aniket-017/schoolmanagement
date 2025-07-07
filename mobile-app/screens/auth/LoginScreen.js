import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
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
      await login(email, password);
      // Navigation is handled by AuthContext
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.colors.gradients.primary} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animatable.View animation="fadeInDown" delay={200} style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="school-outline" size={40} color={theme.colors.textLight} />
              </View>
            </View>
            <Text style={styles.title}>School Management</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
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
                  gradient={true}
                  fullWidth={true}
                  size="large"
                  style={styles.loginButton}
                />

                {/* Quick Login Options */}
                <View style={styles.quickLogin}>
                  <Text style={styles.quickLoginTitle}>Quick Login</Text>
                  <View style={styles.quickLoginButtons}>
                    <Button
                      title="Student"
                      variant="outline"
                      size="small"
                      onPress={() => {
                        setEmail("student@school.com");
                        setPassword("password123");
                      }}
                      style={styles.quickButton}
                    />
                    <Button
                      title="Teacher"
                      variant="outline"
                      size="small"
                      onPress={() => {
                        setEmail("teacher@school.com");
                        setPassword("password123");
                      }}
                      style={styles.quickButton}
                    />
                  </View>
                </View>
              </View>
            </Card>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View animation="fadeIn" delay={600} style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Text style={styles.footerLink} onPress={() => navigation.navigate("Register")}>
                Sign Up
              </Text>
            </Text>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.xxl * 2,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textLight,
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    marginBottom: theme.spacing.xl,
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
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  passwordInput: {
    paddingRight: 0,
  },
  passwordToggle: {
    padding: theme.spacing.sm,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    ...theme.typography.body2,
    color: theme.colors.primary,
  },
  loginButton: {
    marginBottom: theme.spacing.lg,
  },
  quickLogin: {
    alignItems: "center",
  },
  quickLoginTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  quickLoginButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  quickButton: {
    minWidth: 80,
  },
  footer: {
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  footerLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
