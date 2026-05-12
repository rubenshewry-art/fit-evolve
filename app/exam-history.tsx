import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface ExamRecord {
  id: string;
  type: string;
  date: string;
  values: Record<string, number>;
  notes?: string;
}

interface ComparisonData {
  current: ExamRecord | null;
  previous: ExamRecord | null;
  changes: Record<string, { value: number; change: number; trend: "up" | "down" | "stable" }>;
}

export default function ExamHistoryScreen() {
  const colors = useColors();
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [examType, setExamType] = useState<string>("all");

  const examTypes = [
    { id: "all", label: "Todos" },
    { id: "blood", label: "Sangue" },
    { id: "urine", label: "Urina" },
    { id: "imaging", label: "Imagem" },
  ];

  useEffect(() => {
    loadExams();
  }, [examType]);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock exam data
      const mockExams: ExamRecord[] = [
        {
          id: "1",
          type: "blood",
          date: "2024-05-10",
          values: {
            hemoglobin: 14.5,
            hematocrit: 43,
            glucose: 95,
            cholesterol: 180,
          },
          notes: "Exame de rotina",
        },
        {
          id: "2",
          type: "blood",
          date: "2024-04-10",
          values: {
            hemoglobin: 14.2,
            hematocrit: 42,
            glucose: 100,
            cholesterol: 195,
          },
        },
        {
          id: "3",
          type: "blood",
          date: "2024-03-10",
          values: {
            hemoglobin: 13.8,
            hematocrit: 41,
            glucose: 105,
            cholesterol: 210,
          },
        },
      ];

      setExams(mockExams);
      if (mockExams.length > 0) {
        setSelectedExam(mockExams[0]);
        loadComparison(mockExams[0], mockExams[1] || null);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar histórico de exames");
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparison = (current: ExamRecord, previous: ExamRecord | null) => {
    const changes: Record<string, { value: number; change: number; trend: "up" | "down" | "stable" }> = {};

    Object.entries(current.values).forEach(([key, value]) => {
      const previousValue = previous?.values[key] || value;
      const change = value - previousValue;
      const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";

      changes[key] = {
        value,
        change,
        trend,
      };
    });

    setComparisonData({
      current,
      previous,
      changes,
    });
  };

  const handleExportPDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Exportar Histórico",
      "Seu histórico completo de exames será gerado em PDF e enviado por email"
    );
  };

  const handleCompare = (exam: ExamRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExam(exam);
    const previousIndex = exams.indexOf(exam) + 1;
    const previous = previousIndex < exams.length ? exams[previousIndex] : null;
    loadComparison(exam, previous);
  };

  const ValueChange = ({
    label,
    value,
    change,
    trend,
  }: {
    label: string;
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  }) => {
    const trendIcon = trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️";
    const trendColor =
      trend === "up" ? colors.error : trend === "down" ? colors.success : colors.warning;

    return (
      <View className="flex-row justify-between items-center py-2 border-b" style={{ borderColor: colors.border }}>
        <View className="flex-1">
          <Text className="text-sm text-muted">{label}</Text>
          <Text className="text-lg font-semibold text-foreground">{value}</Text>
        </View>
        <View className="items-end gap-1">
          <Text className="text-2xl">{trendIcon}</Text>
          <Text className="text-xs font-semibold" style={{ color: trendColor }}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}
          </Text>
        </View>
      </View>
    );
  };

  const ExamCard = ({ exam, isSelected }: { exam: ExamRecord; isSelected: boolean }) => (
    <Pressable
      onPress={() => handleCompare(exam)}
      style={({ pressed }) => [
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      className="rounded-lg p-4 gap-2 mb-2"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text
            className="text-sm font-semibold"
            style={{ color: isSelected ? colors.background : colors.foreground }}
          >
            {exam.type.toUpperCase()}
          </Text>
          <Text
            className="text-xs"
            style={{ color: isSelected ? colors.background : colors.muted }}
          >
            {new Date(exam.date).toLocaleDateString("pt-BR")}
          </Text>
        </View>
        <Text className="text-lg">{isSelected ? "✓" : ""}</Text>
      </View>
      {exam.notes && (
        <Text
          className="text-xs"
          style={{ color: isSelected ? colors.background : colors.muted }}
        >
          {exam.notes}
        </Text>
      )}
    </Pressable>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6 pb-12">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Histórico de Exames
            </Text>
            <Text className="text-sm text-muted">
              Acompanhe a evolução dos seus resultados
            </Text>
          </View>

          {/* Filter Tabs */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">
              Tipo de Exame
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {examTypes.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => setExamType(type.id)}
                  style={({ pressed }) => [
                    {
                      backgroundColor:
                        examType === type.id ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="px-4 py-2 rounded-full"
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        examType === type.id ? colors.background : colors.foreground,
                    }}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : exams.length > 0 ? (
            <>
              {/* Exams List */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">
                  Exames Anteriores
                </Text>
                {exams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    isSelected={selectedExam?.id === exam.id}
                  />
                ))}
              </View>

              {/* Comparison View */}
              {comparisonData && comparisonData.current && (
                <View className="gap-4">
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-foreground">
                      Comparação de Resultados
                    </Text>
                    <Text className="text-xs text-muted">
                      {comparisonData.previous
                        ? `Comparando com ${new Date(comparisonData.previous.date).toLocaleDateString("pt-BR")}`
                        : "Sem exame anterior para comparação"}
                    </Text>
                  </View>

                  <View
                    className="rounded-xl p-4 gap-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    {Object.entries(comparisonData.changes).map(([key, data]) => (
                      <ValueChange
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={data.value}
                        change={data.change}
                        trend={data.trend}
                      />
                    ))}
                  </View>

                  {/* Insights */}
                  <View
                    className="rounded-xl p-4 gap-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row gap-3 items-start">
                      <Text className="text-2xl">💡</Text>
                      <View className="flex-1 gap-1">
                        <Text className="font-semibold text-foreground text-sm">
                          Análise de Tendência
                        </Text>
                        <Text className="text-xs text-muted">
                          Seus valores estão melhorando! Continue mantendo a consistência
                          com exercícios e alimentação adequada.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Export Buttons */}
              <View className="gap-3">
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
                    Exportar Histórico Completo
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert(
                      "Compartilhar",
                      "Compartilhe seu histórico com seu profissional"
                    );
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
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center gap-4 py-12">
              <View
                className="h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl">🧪</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">
                Nenhum exame encontrado
              </Text>
              <Text className="text-center text-sm text-muted">
                Seus exames aparecerão aqui após o upload
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
