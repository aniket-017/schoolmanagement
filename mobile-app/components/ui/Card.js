import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import theme from "../../utils/theme";

const Card = ({
  children,
  style,
  gradient,
  onPress,
  animation = "fadeInUp",
  delay = 0,
  disabled = false,
  shadow = "md",
  borderRadius = "lg",
  padding = "md",
}) => {
  const cardStyle = [
    styles.card,
    {
      borderRadius: theme.borderRadius[borderRadius],
      padding: theme.spacing[padding],
      ...theme.shadows[shadow],
    },
    style,
  ];

  const cardContent = <View style={cardStyle}>{children}</View>;

  const content = gradient ? (
    <LinearGradient
      colors={theme.colors.gradients[gradient] || gradient}
      style={[cardStyle, { padding: 0 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={{ padding: theme.spacing[padding] }}>{children}</View>
    </LinearGradient>
  ) : (
    cardContent
  );

  if (onPress) {
    return (
      <Animatable.View animation={animation} delay={delay} duration={theme.animations.medium}>
        <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7} style={styles.touchable}>
          {content}
        </TouchableOpacity>
      </Animatable.View>
    );
  }

  return (
    <Animatable.View animation={animation} delay={delay} duration={theme.animations.medium}>
      {content}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  touchable: {
    borderRadius: theme.borderRadius.lg,
  },
});

export default Card;
