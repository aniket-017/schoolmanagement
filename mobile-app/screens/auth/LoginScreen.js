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
  ScrollView,
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
  const [userType, setUserType] = useState("teacher"); // "teacher" or "student"
  const { login } = useAuth();
  


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password, userType);
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
      <LinearGradient colors={[theme.colors.primary, theme.colors.primary]} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <Animatable.View animation="fadeInDown" delay={200} style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Ionicons name="school-outline" size={48} color="#fff" />
                </View>
              </View>
              <Text style={styles.title}>School Management</Text>
              <Text style={styles.subtitle}>Welcome back!</Text>
            </Animatable.View>

            {/* Login Form */}
            <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
              <Card style={styles.form}>
                <View style={styles.form}>
                  {/* User Type Selector */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Login As</Text>
                    <View style={styles.userTypeButtons}>
                      <TouchableOpacity
                        style={[
                          styles.userTypeButton,
                          userType === "teacher" && styles.userTypeButtonActive,
                        ]}
                        onPress={() => setUserType("teacher")}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={userType === "teacher" ? theme.colors.white : theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.userTypeButtonText,
                            userType === "teacher" && styles.userTypeButtonTextActive,
                          ]}
                        >
                          Teacher
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.userTypeButton,
                          userType === "student" && styles.userTypeButtonActive,
                        ]}
                        onPress={() => setUserType("student")}
                      >
                        <Ionicons
                          name="school-outline"
                          size={20}
                          color={userType === "student" ? theme.colors.white : theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.userTypeButtonText,
                            userType === "student" && styles.userTypeButtonTextActive,
                          ]}
                        >
                          Student
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

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
                  New user? <Text style={styles.signUpLink}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
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
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  logoContainer: {
    marginBottom: theme.spacing.md,
  },
  logo: {
    width: 64, // Reduced from 100
    height: 64, // Reduced from 100
    borderRadius: 32, // Adjusted for new size
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textLight,
    textAlign: "center",
    marginBottom: theme.spacing.xs,
    fontSize: 22, // Reduced
  },
  subtitle: {
    ...theme.typography.h5,
    color: theme.colors.textLight,
    textAlign: "center",
    opacity: 0.9,
    fontSize: 14, // Reduced
  },
  formContainer: {
    width: "100%",
    marginBottom: theme.spacing.sm,
  },
  form: {
    width: "100%",
    padding: theme.spacing.md, // Reduced padding
  },
  inputContainer: {
    marginBottom: theme.spacing.md, // Reduced
  },
  userTypeButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  userTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  userTypeButtonText: {
    ...theme.typography.subtitle2,
    color: theme.colors.primary,
  },
  userTypeButtonTextActive: {
    color: theme.colors.white,
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
    paddingHorizontal: theme.spacing.sm, // Reduced
    height: 44, // Reduced from 56
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.text,
    height: "100%",
    fontSize: 14, // Reduced
  },
  passwordInput: {
    paddingRight: theme.spacing.lg, // Reduced
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
    height: 40, // Reduced from 50
    paddingVertical: 6, // Reduced
    marginTop: theme.spacing.sm,
  },
  footer: {
    width: "100%",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: 24,
  },
  signUpButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
    marginHorizontal: 0,
  },
  signUpText: {
    ...theme.typography.body2,
    color: theme.colors.textLight,
    textAlign: "center",
    flexWrap: "wrap",
    fontSize: 16,
  },
  signUpLink: {
    ...theme.typography.subtitle2,
    color: "#fff",
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontSize: 16,
  },
});
