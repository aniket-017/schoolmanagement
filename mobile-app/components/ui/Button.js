import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
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

    // Variant text styles
    switch (variant) {
      case "outline":
      case "ghost":
        baseStyle.push({ color: theme.colors.primary });
        break;
      default:
        baseStyle.push({ color: theme.colors.textLight });
    }

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return [...baseStyle, textStyle];
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconSize = size === "small" ? 16 : size === "large" ? 22 : 20;
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
    <>
      {iconPosition === "left" && !loading && renderIcon()}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? theme.colors.primary : theme.colors.textLight}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
      {iconPosition === "right" && !loading && renderIcon()}
    </>
  );

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={getButtonStyle()}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },
  // Size styles
  small: {
    height: 40,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: theme.spacing.xl,
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
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  ghost: {
    backgroundColor: "transparent",
    ...theme.shadows.none,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  disabled: {
    backgroundColor: theme.colors.border,
    ...theme.shadows.none,
  },
  fullWidth: {
    width: "100%",
  },
  // Text styles
  text: {
    ...theme.typography.button,
    textAlign: "center",
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  // Layout styles
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
});

export default Button;
