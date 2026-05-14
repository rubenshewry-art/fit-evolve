import React, { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'
import { useColors } from '@/hooks/use-colors'
import * as Haptics from 'expo-haptics'

interface DataPoint {
  label: string
  value: number
  date: string
}

interface AnimatedChartProps {
  data: DataPoint[]
  maxValue?: number
  title?: string
  onDataPointPress?: (point: DataPoint) => void
}

/**
 * Gráfico de barras animado com feedback visual
 */
export function AnimatedBarChart({
  data,
  maxValue = 100,
  title = 'Progresso',
  onDataPointPress,
}: AnimatedChartProps) {
  const colors = useColors()
  const animationValues = data.map(() => useSharedValue(0))

  useEffect(() => {
    animationValues.forEach((value, index) => {
      setTimeout(() => {
        value.value = withSpring(data[index].value / maxValue, {
          damping: 8,
          mass: 1,
          overshootClamping: false,
        })
      }, index * 100)
    })
  }, [data, animationValues, maxValue])

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 16,
        }}
      >
        {title}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        {data.map((point, index) => (
          <BarItem
            key={index}
            point={point}
            animationValue={animationValues[index]}
            colors={colors}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              onDataPointPress?.(point)
            }}
          />
        ))}
      </View>

      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {data.length} pontos de dados
        </Text>
      </View>
    </View>
  )
}

interface BarItemProps {
  point: DataPoint
  animationValue: SharedValue<number>
  colors: any
  onPress: () => void
}

function BarItem({ point, animationValue, colors, onPress }: BarItemProps) {
  const pressScale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${animationValue.value * 100}%`,
    }
  })

  const pressedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    }
  })

  return (
    <Pressable
      onPress={() => {
        pressScale.value = withSpring(0.95, { damping: 10 })
        setTimeout(() => {
          pressScale.value = withSpring(1, { damping: 10 })
        }, 100)
        onPress()
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            minHeight: 40,
            backgroundColor: colors.primary,
            borderRadius: 8,
            marginBottom: 8,
          },
          animatedStyle,
          pressedStyle,
        ]}
      />
      <Text style={{ fontSize: 10, color: colors.muted }}>
        {point.label}
      </Text>
    </Pressable>
  )
}

/**
 * Gráfico de linha animado
 */
export function AnimatedLineChart({
  data,
  maxValue = 100,
  title = 'Evolução',
}: AnimatedChartProps) {
  const colors = useColors()
  const animationValues = data.map(() => useSharedValue(0))

  useEffect(() => {
    animationValues.forEach((value, index) => {
      setTimeout(() => {
        value.value = withTiming(data[index].value / maxValue, {
          duration: 800,
        })
      }, index * 50)
    })
  }, [data, animationValues, maxValue])

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: 16,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          height: 200,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 4,
        }}
      >
        {data.map((point, index) => (
          <LinePoint
            key={index}
            point={point}
            animationValue={animationValues[index]}
            colors={colors}
            isFirst={index === 0}
            isLast={index === data.length - 1}
          />
        ))}
      </View>

      <View
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Mín: {Math.min(...data.map((d) => d.value))}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Máx: {Math.max(...data.map((d) => d.value))}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Média:{' '}
          {(
            data.reduce((sum, d) => sum + d.value, 0) / data.length
          ).toFixed(1)}
        </Text>
      </View>
    </View>
  )
}

interface LinePointProps {
  point: DataPoint
  animationValue: SharedValue<number>
  colors: any
  isFirst: boolean
  isLast: boolean
}

function LinePoint({
  point,
  animationValue,
  colors,
  isFirst,
  isLast,
}: LinePointProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${animationValue.value * 100}%`,
    }
  })

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Animated.View
        style={[
          {
            width: '100%',
            backgroundColor: colors.primary,
            borderRadius: 2,
          },
          animatedStyle,
        ]}
      />
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.primary,
          marginTop: -4,
          zIndex: 10,
        }}
      />
    </View>
  )
}

/**
 * Card de métrica com animação de número
 */
export function AnimatedMetricCard({
  label,
  value,
  unit = '',
  icon,
  trend,
}: {
  label: string
  value: number
  unit?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}) {
  const colors = useColors()
  const animatedValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 8,
      mass: 1,
    })
  }, [value, animatedValue])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(animatedValue.value, [0, value], [0.8, 1]),
        },
      ],
    }
  })

  const trendColor =
    trend === 'up'
      ? colors.success
      : trend === 'down'
        ? colors.error
        : colors.muted

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.muted }}>{label}</Text>
        {icon && <View>{icon}</View>}
      </View>

      <Animated.View style={animatedStyle}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: colors.foreground,
          }}
        >
          {Math.round(animatedValue.value)}
          <Text style={{ fontSize: 14, color: colors.muted }}> {unit}</Text>
        </Text>
      </Animated.View>

      {trend && (
        <Text
          style={{
            fontSize: 12,
            color: trendColor,
            marginTop: 8,
            fontWeight: '600',
          }}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{' '}
          {trend === 'up'
            ? 'Aumentando'
            : trend === 'down'
              ? 'Diminuindo'
              : 'Estável'}
        </Text>
      )}
    </View>
  )
}
