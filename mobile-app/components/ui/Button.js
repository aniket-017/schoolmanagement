import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../utils/theme";

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  gradient = false,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    // Size styles
    switch (size) {
      case "small":
        baseStyle.push(styles.small);
        break;
      case "large":
        baseStyle.push(styles.large);
        break;
      default:
        baseStyle.push(styles.medium);
    }

    // Variant styles
    switch (variant) {
      case "secondary":
        baseStyle.push(styles.secondary);
        break;
      case "outline":
        baseStyle.push(styles.outline);
        break;
      case "ghost":
        baseStyle.push(styles.ghost);
        break;
      case "danger":
        baseStyle.push(styles.danger);
        break;
      default:
        baseStyle.push(styles.primary);
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];

    // Size text styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallText);
        break;
      case "large":
        baseStyle.push(styles.largeText);
        break;
      default:
        baseStyle.push(styles.mediumText);
    }

    // Variant text styles
    switch (variant) {
      case "outline":
        baseStyle.push(styles.outlineText);
        break;
      case "ghost":
        baseStyle.push(styles.ghostText);
        break;
      default:
        baseStyle.push(styles.primaryText);
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return [...baseStyle, textStyle];
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconSize = size === "small" ? 16 : size === "large" ? 24 : 20;
    const iconColor = variant === "outline" || variant === "ghost" ? theme.colors.primary : theme.colors.textLight;

    return (
      <Ionicons
        name={icon}
        size={iconSize}
        color={disabled ? theme.colors.textSecondary : iconColor}
        style={iconPosition === "right" ? styles.iconRight : styles.iconLeft}
      />
    );
  };

  const renderContent = () => (
    <View style={styles.content}>
      {iconPosition === "left" && renderIcon()}
      {loading ? (
        <ActivityIndicator
          size={size === "small" ? "small" : "small"}
          color={variant === "outline" || variant === "ghost" ? theme.colors.primary : theme.colors.textLight}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
      {iconPosition === "right" && renderIcon()}
    </View>
  );

  if (gradient && variant === "primary" && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyle(), { padding: 0 }]}
      >
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={[styles.gradient, { borderRadius: theme.borderRadius.lg }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={getButtonStyle()}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },

  // Size styles
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 52,
  },

  // Variant styles
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: theme.colors.error,
  },

  disabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },

  fullWidth: {
    width: "100%",
  },

  // Text styles
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },

  primaryText: {
    color: theme.colors.textLight,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },

  // Layout styles
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  gradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Button;
