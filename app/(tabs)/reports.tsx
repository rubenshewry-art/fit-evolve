import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface ReportData {
  month: string;
  year: number;
  photoCount: number;
  examCount: number;
  postCount: number;
  consistency: number;
  engagement: number;
  completion: number;
  badges: number;
}

export default function ReportsScreen() {
  const colors = useColors();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const years = Array.from({ length: 5 }, (_, i) =>
    new Date().getFullYear() - i
  );

  useEffect(() => {
    loadReport();
  }, [selectedMonth, selectedYear]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData: ReportData = {
        month: months[selectedMonth],
        year: selectedYear,
        photoCount: Math.floor(Math.random() * 20) + 5,
        examCount: Math.floor(Math.random() * 5) + 1,
        postCount: Math.floor(Math.random() * 10) + 2,
        consistency: Math.floor(Math.random() * 40) + 60,
        engagement: Math.floor(Math.random() * 40) + 50,
        completion: Math.floor(Math.random() * 40) + 60,
        badges: Math.floor(Math.random() * 5) + 1,
      };

      setReportData(mockData);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar relatório");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Exportar PDF",
      "Seu relatório será gerado e enviado por email"
    );
  };

  const ProgressBar = ({ value, label }: { value: number; label: string }) => (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-sm font-bold text-primary">{value}%</Text>
      </View>
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: colors.primary,
            width: `${value}%`,
          }}
        />
      </View>
    </View>
  );

  const StatCard = ({
    icon,
    label,
    value,
    unit,
  }: {
    icon: string;
    label: string;
    value: number;
    unit: string;
  }) => (
    <View
      className="flex-1 rounded-xl p-4 gap-2"
      style={{ backgroundColor: colors.surface }}
    >
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="text-2xl font-bold text-foreground">
        {value}
        <Text className="text-xs text-muted ml-1">{unit}</Text>
      </Text>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6 pb-12">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Relatório Mensal
            </Text>
            <Text className="text-sm text-muted">
              Acompanhe seu progresso e evolução
            </Text>
          </View>

          {/* Month/Year Selector */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">
              Período
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setSelectedMonth((m) => (m - 1 + 12) % 12)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 rounded-lg p-3 items-center"
              >
                <Text className="text-xs text-muted">◀</Text>
              </Pressable>

              <View
                className="flex-2 rounded-lg p-3 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-sm font-semibold text-foreground">
                  {months[selectedMonth]} {selectedYear}
                </Text>
              </View>

              <Pressable
                onPress={() => setSelectedMonth((m) => (m + 1) % 12)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 rounded-lg p-3 items-center"
              >
                <Text className="text-xs text-muted">▶</Text>
              </Pressable>
            </View>
          </View>

          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : reportData ? (
            <>
              {/* Stats Grid */}
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <StatCard
                    icon="📸"
                    label="Fotos"
                    value={reportData.photoCount}
                    unit="capturadas"
                  />
                  <StatCard
                    icon="🧪"
                    label="Exames"
                    value={reportData.examCount}
                    unit="enviados"
                  />
                </View>
                <View className="flex-row gap-3">
                  <StatCard
                    icon="📝"
                    label="Posts"
                    value={reportData.postCount}
                    unit="publicados"
                  />
                  <StatCard
                    icon="🏆"
                    label="Badges"
                    value={reportData.badges}
                    unit="conquistadas"
                  />
                </View>
              </View>

              {/* Progress Metrics */}
              <View className="gap-4">
                <Text className="text-sm font-semibold text-foreground">
                  Métricas de Progresso
                </Text>
                <View
                  className="rounded-xl p-4 gap-4"
                  style={{ backgroundColor: colors.surface }}
                >
                  <ProgressBar
                    label="Consistência"
                    value={reportData.consistency}
                  />
                  <ProgressBar
                    label="Engajamento"
                    value={reportData.engagement}
                  />
                  <ProgressBar
                    label="Conclusão"
                    value={reportData.completion}
                  />
                </View>
              </View>

              {/* Insights */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">
                  Insights
                </Text>
                <View
                  className="rounded-xl p-4 gap-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row gap-3 items-start">
                    <Text className="text-2xl">💡</Text>
                    <View className="flex-1 gap-1">
                      <Text className="font-semibold text-foreground text-sm">
                        Mantenha a consistência
                      </Text>
                      <Text className="text-xs text-muted">
                        Você está no caminho certo! Continue capturando fotos
                        regularmente para manter seu progresso.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Export Button */}
              <Pressable
                onPress={handleExportPDF}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="rounded-lg p-4 items-center flex-row justify-center gap-2"
              >
                <Text className="text-lg">📄</Text>
                <Text className="font-semibold text-background text-base">
                  Exportar como PDF
                </Text>
              </Pressable>

              {/* Share Button */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert("Compartilhar", "Compartilhe seu progresso!");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                    borderWidth: 1,
                  },
                ]}
                className="rounded-lg p-4 items-center flex-row justify-center gap-2"
              >
                <Text className="text-lg">🔗</Text>
                <Text className="font-semibold text-foreground text-base">
                  Compartilhar com Profissional
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
