import React, { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

export type TransitionType = 'fade' | 'slide-right' | 'slide-left' | 'fade-slide';

export interface TransitionViewProps extends ViewProps {
  /**
   * Type of transition animation
   * - 'fade': Fade in/out
   * - 'slide-right': Slide in from right, out to left
   * - 'slide-left': Slide in from left, out to right
   * - 'fade-slide': Fade + slide combination
   */
  transitionType?: TransitionType;
  /**
   * Duration of animation in milliseconds
   */
  duration?: number;
  /**
   * Delay before animation starts
   */
  delay?: number;
  /**
   * Whether to show the view
   */
  visible?: boolean;
  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;
  /**
   * Easing function for animation
   */
  easing?: (value: number) => number;
}

/**
 * TransitionView component that provides smooth animations for screen transitions
 *
 * Usage:
 * ```tsx
 * <TransitionView
 *   transitionType="fade"
 *   duration={300}
 *   visible={isVisible}
 *   onAnimationComplete={() => console.log('Done')}
 * >
 *   <Text>Content</Text>
 * </TransitionView>
 * ```
 */
export const TransitionView = React.forwardRef<View, TransitionViewProps>(
  (
    {
      children,
      transitionType = 'fade',
      duration = 300,
      delay = 0,
      visible = true,
      onAnimationComplete,
      easing = Easing.inOut(Easing.ease),
      style,
      ...props
    },
    ref
  ) => {
    const opacity = useSharedValue(visible ? 1 : 0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
      if (visible) {
        // Animate in
        if (transitionType === 'fade' || transitionType === 'fade-slide') {
          opacity.value = withTiming(1, {
            duration,
            easing,
          });
        }

        if (transitionType === 'slide-right' || transitionType === 'fade-slide') {
          translateX.value = withTiming(0, {
            duration,
            easing,
          });
        }

        if (transitionType === 'slide-left') {
          translateX.value = withTiming(0, {
            duration,
            easing,
          });
        }
      } else {
        // Animate out
        if (transitionType === 'fade' || transitionType === 'fade-slide') {
          opacity.value = withTiming(0, {
            duration,
            easing,
          });
        }

        if (transitionType === 'slide-right' || transitionType === 'fade-slide') {
          translateX.value = withTiming(100, {
            duration,
            easing,
          });
        }

        if (transitionType === 'slide-left') {
          translateX.value = withTiming(-100, {
            duration,
            easing,
          });
        }
      }
    }, [visible, transitionType, duration, easing, opacity, translateX, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
      const baseStyle: any = {};

      if (transitionType === 'fade' || transitionType === 'fade-slide') {
        baseStyle.opacity = opacity.value;
      }

      if (transitionType === 'slide-right' || transitionType === 'slide-left' || transitionType === 'fade-slide') {
        baseStyle.transform = [{ translateX: translateX.value }];
      }

      return baseStyle;
    });

    return (
      <Animated.View
        ref={ref}
        style={[animatedStyle, style]}
        {...props}
      >
        {children}
      </Animated.View>
    );
  }
);

TransitionView.displayName = 'TransitionView';

/**
 * Preset animation configurations for common transitions
 */
export const transitionPresets = {
  fadeIn: {
    transitionType: 'fade' as const,
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },
  fadeInSlow: {
    transitionType: 'fade' as const,
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  },
  slideInRight: {
    transitionType: 'slide-right' as const,
    duration: 350,
    easing: Easing.out(Easing.cubic),
  },
  slideInLeft: {
    transitionType: 'slide-left' as const,
    duration: 350,
    easing: Easing.out(Easing.cubic),
  },
  fadeSlide: {
    transitionType: 'fade-slide' as const,
    duration: 400,
    easing: Easing.inOut(Easing.ease),
  },
};
