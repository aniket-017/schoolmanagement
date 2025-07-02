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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { config } from "../../config/environment";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student", // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const requestData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
    };

    const registrationUrl = `${config.API_BASE_URL}/auth/register`;
    console.log("📤 Sending registration request to:", registrationUrl);
    console.log("📋 Request data:", requestData);

    try {
      const response = await fetch(registrationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", response.headers);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        Alert.alert(
          "Registration Successful!",
          "Your account has been created. Please wait for admin approval to login.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert("Registration Failed", data.message || "Please try again");
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      Alert.alert("Error", `Network error: ${error.message}. Please check your connection and try again.`);
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our school community</Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>I am a *</Text>
            <View style={styles.roleContainer}>
              {roleOptions.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[styles.roleOption, formData.role === role.value && styles.roleOptionSelected]}
                  onPress={() => handleInputChange("role", role.value)}
                >
                  <Text style={[styles.roleText, formData.role === role.value && styles.roleTextSelected]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleOption: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  roleOptionSelected: {
    borderColor: "#3498db",
    backgroundColor: "#3498db",
  },
  roleText: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  roleTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  loginLink: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "600",
  },
});

export default RegisterScreen;
