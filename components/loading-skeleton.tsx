import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import { useColors } from '@/hooks/use-colors'

interface LoadingSkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
}

/**
 * Componente de skeleton loading com animação de shimmer
 * Usado para mostrar placeholders enquanto dados estão carregando
 */
export function LoadingSkeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: LoadingSkeletonProps) {
  const colors = useColors()
  const shimmerAnimation = useSharedValue(0)

  useEffect(() => {
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    )
  }, [shimmerAnimation])

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmerAnimation.value,
      [0, 1],
      [0.3, 0.7],
      Extrapolate.CLAMP
    )

    return {
      opacity,
    }
  })

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          marginBottom: 12,
        },
        animatedStyle,
        style,
      ]}
    />
  )
}

/**
 * Componente de card skeleton para listas
 */
export function CardSkeleton() {
  const colors = useColors()

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <LoadingSkeleton width="60%" height={20} style={{ marginBottom: 12 }} />
      <LoadingSkeleton width="100%" height={12} style={{ marginBottom: 8 }} />
      <LoadingSkeleton width="80%" height={12} />
    </View>
  )
}

/**
 * Componente de spinner com animação de rotação
 */
export function LoadingSpinner({ size = 40 }: { size?: number }) {
  const colors = useColors()
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    )
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    }
  })

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: colors.border,
          borderTopColor: colors.primary,
        },
        animatedStyle,
      ]}
    />
  )
}

/**
 * Componente de progresso com animação
 */
export function AnimatedProgress({ progress = 0.5 }: { progress?: number }) {
  const colors = useColors()
  const progressValue = useSharedValue(0)

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 800 })
  }, [progress, progressValue])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    }
  })

  return (
    <View
      style={{
        width: '100%',
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: colors.primary,
            borderRadius: 3,
          },
          animatedStyle,
        ]}
      />
    </View>
  )
}

/**
 * Componente de loading overlay
 */
export function LoadingOverlay({
  visible = false,
  message = 'Carregando...',
}: {
  visible?: boolean
  message?: string
}) {
  const colors = useColors()
  const opacity = useSharedValue(visible ? 1 : 0)

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 300 })
  }, [visible, opacity])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      pointerEvents: visible ? ('auto' as const) : ('none' as const),
    }
  })

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          gap: 16,
        }}
      >
        <LoadingSpinner size={50} />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.foreground,
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  )
}

/**
 * Componente de lista skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  )
}
