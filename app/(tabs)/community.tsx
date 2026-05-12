import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Community Screen - Social Feed
 * 
 * Exibe o feed de conquistas dos alunos, permitindo:
 * - Visualizar posts de outros alunos
 * - Publicar conquistas (foto + texto)
 * - Marcar profissionais em posts
 * - Filtrar por privacidade (público/privado)
 */
export default function CommunityScreen() {
  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Comunidade</Text>
            <Text className="text-base text-muted">
              Compartilhe suas conquistas e inspire outros
            </Text>
          </View>

          {/* Empty State */}
          <View className="flex-1 items-center justify-center gap-4 py-12">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Text className="text-3xl">👥</Text>
            </View>
            <Text className="text-lg font-semibold text-foreground">Nenhum post ainda</Text>
            <Text className="text-center text-sm text-muted">
              Comece a compartilhar suas conquistas com a comunidade
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
