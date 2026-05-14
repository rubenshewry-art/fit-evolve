import React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useColors } from '@/hooks/use-colors'

interface FeedbackButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

/**
 * Botão com feedback visual (escala, haptic, loading)
 */
export function FeedbackButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: FeedbackButtonProps) {
  const colors = useColors()
  const scale = useSharedValue(1)

  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.surface
        : colors.error

  const textColor =
    variant === 'secondary' ? colors.foreground : colors.background

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  const handlePress = () => {
    if (disabled || loading) return

    scale.value = withSpring(0.95, { damping: 10 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10 })
      onPress()
    }, 100)
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={{
          backgroundColor,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {icon && <View>{icon}</View>}
        <Text
          style={{
            color: textColor,
            fontWeight: '600',
            fontSize: 14,
          }}
        >
          {loading ? 'Carregando...' : label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

interface PressableFeedbackProps {
  onPress: () => void
  children: React.ReactNode
  hapticFeedback?: boolean
  scaleFactor?: number
  style?: any
}

/**
 * Wrapper para adicionar feedback visual a qualquer elemento
 */
export function PressableFeedback({
  onPress,
  children,
  hapticFeedback = true,
  scaleFactor = 0.95,
  style,
}: PressableFeedbackProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  })

  const handlePress = () => {
    scale.value = withSpring(scaleFactor, { damping: 10 })
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10 })
      onPress()
    }, 100)
  }

  return (
    <Pressable onPress={handlePress} style={style}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  )
}

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  visible?: boolean
  duration?: number
  onDismiss?: () => void
}

/**
 * Toast com animação de entrada/saída
 */
export function AnimatedToast({
  message,
  type = 'info',
  visible = false,
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const colors = useColors()
  const opacity = useSharedValue(visible ? 1 : 0)
  const translateY = useSharedValue(visible ? 0 : 50)

  React.useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1, { damping: 10 })
      translateY.value = withSpring(0, { damping: 10 })

      const timer = setTimeout(() => {
        opacity.value = withSpring(0, { damping: 10 })
        translateY.value = withSpring(50, { damping: 10 })
        setTimeout(() => onDismiss?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration, opacity, translateY, onDismiss])

  const backgroundColor =
    type === 'success'
      ? colors.success
      : type === 'error'
        ? colors.error
        : type === 'warning'
          ? colors.warning
          : colors.primary

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          backgroundColor,
          borderRadius: 8,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 12,
            fontWeight: '700',
          }}
        >
          {type === 'success'
            ? '✓'
            : type === 'error'
              ? '✕'
              : type === 'warning'
                ? '!'
                : 'ℹ'}
        </Text>
      </View>
      <Text
        style={{
          color: 'white',
          fontSize: 14,
          fontWeight: '500',
          flex: 1,
        }}
      >
        {message}
      </Text>
    </Animated.View>
  )
}
