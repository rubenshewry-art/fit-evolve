import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

export interface LoadingIndicatorProps {
  /**
   * Size of the spinner in pixels
   */
  size?: number;
  /**
   * Color of the spinner
   */
  color?: string;
  /**
   * Duration of one rotation in milliseconds
   */
  duration?: number;
  /**
   * Text to display below spinner
   */
  text?: string;
  /**
   * Whether to show the indicator
   */
  visible?: boolean;
}

/**
 * LoadingIndicator component with smooth rotation animation
 *
 * Usage:
 * ```tsx
 * <LoadingIndicator
 *   size={50}
 *   text="Carregando..."
 *   visible={isLoading}
 * />
 * ```
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 50,
  color,
  duration = 1000,
  text = 'Carregando...',
  visible = true,
}) => {
  const colors = useColors();
  const spinValue = useSharedValue(0);
  const finalColor = color || colors.primary;

  useEffect(() => {
    if (visible) {
      spinValue.value = withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      spinValue.value = 0;
    }
  }, [visible, duration, spinValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      spinValue.value,
      [0, 1],
      [0, 360],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 4,
            borderColor: `${finalColor}20`, // 20% opacity
            borderTopColor: finalColor,
            borderRightColor: finalColor,
          },
          animatedStyle,
        ]}
      />
      {text && (
        <Text className="text-muted text-center text-base">{text}</Text>
      )}
    </View>
  );
};

/**
 * Animated dots indicator (alternative to spinner)
 */
export const DotsIndicator: React.FC<{
  visible?: boolean;
  text?: string;
}> = ({ visible = true, text = 'Carregando' }) => {
  const colors = useColors();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      dot1.value = withRepeat(
        withTiming(1, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );

      dot2.value = withRepeat(
        withTiming(1, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );

      dot3.value = withRepeat(
        withTiming(1, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [visible, dot1, dot2, dot3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1], Extrapolate.CLAMP),
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1], Extrapolate.CLAMP),
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1], Extrapolate.CLAMP),
  }));

  if (!visible) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <View className="flex-row gap-2">
        <Animated.View
          style={[
            {
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.primary,
            },
            animatedStyle1,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.primary,
            },
            animatedStyle2,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.primary,
            },
            animatedStyle3,
          ]}
        />
      </View>
      {text && (
        <Text className="text-muted text-center text-base">{text}</Text>
      )}
    </View>
  );
};
