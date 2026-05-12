import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Reports Screen - Monthly Reports & Analytics
 * 
 * Exibe relatórios mensais consolidados, permitindo:
 * - Visualizar relatório do mês atual
 * - Histórico de relatórios anteriores
 * - Gráficos de progresso (fotos, exames, badges)
 * - Download/compartilhamento em PDF
 */
export default function ReportsScreen() {
  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Relatórios</Text>
            <Text className="text-base text-muted">
              Acompanhe seu progresso mensal
            </Text>
          </View>

          {/* Empty State */}
          <View className="flex-1 items-center justify-center gap-4 py-12">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Text className="text-3xl">📊</Text>
            </View>
            <Text className="text-lg font-semibold text-foreground">Nenhum relatório disponível</Text>
            <Text className="text-center text-sm text-muted">
              Seus relatórios mensais aparecerão aqui
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
