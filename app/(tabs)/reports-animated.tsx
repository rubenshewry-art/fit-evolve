import React, { useState } from 'react'
import { ScrollView, View, Text, Pressable } from 'react-native'
import { ScreenContainer } from '@/components/screen-container'
import { useColors } from '@/hooks/use-colors'
import {
  AnimatedBarChart,
  AnimatedLineChart,
  AnimatedMetricCard,
} from '@/components/animated-chart'
import {
  LoadingSpinner,
  LoadingSkeleton,
  AnimatedProgress,
} from '@/components/loading-skeleton'
import { FeedbackButton, AnimatedToast } from '@/components/feedback-button'
import * as Haptics from 'expo-haptics'

/**
 * Tela de Relatórios Animada com gráficos interativos
 */
export default function AnimatedReportsScreen() {
  const colors = useColors()
  const [loading, setLoading] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  // Dados simulados de evolução
  const photoData = [
    { label: 'Sem 1', value: 2, date: '2024-01-07' },
    { label: 'Sem 2', value: 3, date: '2024-01-14' },
    { label: 'Sem 3', value: 5, date: '2024-01-21' },
    { label: 'Sem 4', value: 4, date: '2024-01-28' },
  ]

  const examData = [
    { label: 'Jan', value: 65, date: '2024-01-15' },
    { label: 'Fev', value: 72, date: '2024-02-15' },
    { label: 'Mar', value: 78, date: '2024-03-15' },
    { label: 'Abr', value: 85, date: '2024-04-15' },
  ]

  const handleExportPDF = async () => {
    setLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Simular exportação
    setTimeout(() => {
      setLoading(false)
      setToastMessage('Relatório exportado com sucesso!')
      setToastVisible(true)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 2000)
  }

  const handleShareReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setToastMessage('Relatório compartilhado com profissionais!')
    setToastVisible(true)
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            Relatório de Evolução
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Acompanhe seu progresso visual e de saúde
          </Text>
        </View>

        {/* Seletor de Período */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginBottom: 24,
            paddingHorizontal: 4,
          }}
        >
          {['Jan', 'Fev', 'Mar', 'Abr', 'Mai'].map((month, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedMonth(index)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  selectedMonth === index ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor:
                  selectedMonth === index ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color:
                    selectedMonth === index
                      ? colors.background
                      : colors.foreground,
                }}
              >
                {month}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Métricas Principais */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.foreground,
              marginBottom: 12,
            }}
          >
            Resumo do Mês
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <AnimatedMetricCard
              label="Fotos"
              value={18}
              unit="capturadas"
              trend="up"
            />
            <AnimatedMetricCard
              label="Exames"
              value={3}
              unit="enviados"
              trend="neutral"
            />
          </View>
        </View>

        {/* Gráfico de Fotos */}
        <View style={{ marginBottom: 24 }}>
          <AnimatedBarChart
            data={photoData}
            maxValue={6}
            title="Fotos Capturadas por Semana"
            onDataPointPress={(point) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setToastMessage(`${point.label}: ${point.value} fotos`)
              setToastVisible(true)
            }}
          />
        </View>

        {/* Gráfico de Progresso */}
        <View style={{ marginBottom: 24 }}>
          <AnimatedLineChart
            data={examData}
            maxValue={100}
            title="Evolução de Biomarcadores"
          />
        </View>

        {/* Progresso Geral */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.foreground,
              }}
            >
              Conclusão do Mês
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.primary,
              }}
            >
              72%
            </Text>
          </View>
          <AnimatedProgress progress={0.72} />
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 8,
            }}
          >
            Você está indo bem! Continue capturando fotos e enviando exames.
          </Text>
        </View>

        {/* Ações */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          <FeedbackButton
            label={loading ? 'Exportando...' : 'Exportar PDF'}
            onPress={handleExportPDF}
            loading={loading}
            variant="primary"
          />
          <FeedbackButton
            label="Compartilhar com Profissionais"
            onPress={handleShareReport}
            variant="secondary"
          />
        </View>

        {/* Insights */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.background,
              marginBottom: 8,
            }}
          >
            💡 Dica Personalizada
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.background,
              lineHeight: 20,
            }}
          >
            Sua consistência aumentou 15% este mês! Continue capturando fotos
            regularmente para acompanhar melhor sua evolução visual.
          </Text>
        </View>
      </ScrollView>

      {/* Toast de Feedback */}
      <AnimatedToast
        message={toastMessage}
        type="success"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </ScreenContainer>
  )
}
