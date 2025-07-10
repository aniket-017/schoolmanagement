import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import theme from "../../utils/theme";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    // Simple email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await register({ name, email, password, role });
      if (result.success) {
        Alert.alert(
          "Registration Successful",
          "Your account has been created. Please wait for admin approval to login.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      // Error is already shown by flash message in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { label: "Student", value: "student" },
    { label: "Teacher", value: "teacher" },
    { label: "Parent", value: "parent" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            {/* Header */}
            <Animatable.View animation="fadeInDown" delay={200} style={styles.header}>
              <Ionicons name="person-add" size={60} color={theme.colors.primary} />
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start your journey with us</Text>
            </Animatable.View>

            {/* Register Form */}
            <Animatable.View animation="fadeInUp" delay={400} style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={theme.colors.placeholder}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Role Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>I am a...</Text>
                <View style={styles.roleContainer}>
                  {roleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.roleOption, role === option.value && styles.roleOptionSelected]}
                      onPress={() => setRole(option.value)}
                    >
                      <Text style={[styles.roleText, role === option.value && styles.roleTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                fullWidth={true}
                size="large"
                style={styles.registerButton}
              />
            </Animatable.View>

            {/* Footer */}
            <Animatable.View animation="fadeIn" delay={600} style={styles.footer}>
              <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.text,
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  passwordToggle: {
    paddingLeft: theme.spacing.md,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
  },
  roleOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleText: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
  },
  roleTextSelected: {
    color: theme.colors.textLight,
  },
  registerButton: {
    marginTop: theme.spacing.md,
    height: 56,
  },
  footer: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
  },
  signInButton: {},
  signInText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  signInLink: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});

