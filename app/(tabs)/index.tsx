import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Home Screen - Main Dashboard
 * 
 * Exibe:
 * - Frase motivacional do dia
 * - Progresso visual (fotos recentes)
 * - Dica técnica personalizada
 * - Atalhos para ações principais (Capturar foto, Ver comunidade)
 * - Notificações e insights recentes
 */
export default function HomeScreen() {
  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Bem-vindo!</Text>
            <Text className="text-base text-muted">Seu progresso começa aqui</Text>
          </View>

          {/* Daily Motivation Card */}
          <View className="rounded-2xl bg-primary p-6">
            <Text className="text-sm font-semibold text-background opacity-80">Frase do Dia</Text>
            <Text className="mt-3 text-lg font-bold text-background">
              "A consistência é a chave do sucesso"
            </Text>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Ações Rápidas</Text>
            <View className="gap-2">
              <Pressable
                className="flex-row items-center gap-3 rounded-lg bg-surface p-4"
                onPress={() => {
                  // TODO: Navigate to camera
                }}
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xl">📸</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Capturar Foto</Text>
                  <Text className="text-xs text-muted">Registre seu progresso</Text>
                </View>
              </Pressable>

              <Pressable
                className="flex-row items-center gap-3 rounded-lg bg-surface p-4"
                onPress={() => {
                  // TODO: Navigate to upload exam
                }}
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xl">📋</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Upload Exame</Text>
                  <Text className="text-xs text-muted">Compartilhe seus resultados</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Recent Progress */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Progresso Recente</Text>
            <View className="rounded-lg bg-surface p-4">
              <Text className="text-center text-sm text-muted">
                Nenhuma foto capturada ainda
              </Text>
            </View>
          </View>

          {/* Daily Tip */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Dica do Dia</Text>
            <View className="rounded-lg border border-border bg-surface p-4">
              <Text className="text-sm text-muted leading-relaxed">
                Mantenha a consistência! Capture fotos regularmente para acompanhar melhor seu progresso visual.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
