import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Professionals Screen - Marketplace
 * 
 * Exibe marketplace de profissionais, permitindo:
 * - Visualizar profissionais disponíveis
 * - Filtrar por especialidade (Personal, Nutricionista, Fisioterapeuta)
 * - Visualizar vitrine do profissional
 * - Conectar com profissional
 */
export default function ProfessionalsScreen() {
  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Profissionais</Text>
            <Text className="text-base text-muted">
              Conecte-se com especialistas em saúde
            </Text>
          </View>

          {/* Empty State */}
          <View className="flex-1 items-center justify-center gap-4 py-12">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Text className="text-3xl">👨‍⚕️</Text>
            </View>
            <Text className="text-lg font-semibold text-foreground">Nenhum profissional conectado</Text>
            <Text className="text-center text-sm text-muted">
              Explore o marketplace e conecte-se com profissionais
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
