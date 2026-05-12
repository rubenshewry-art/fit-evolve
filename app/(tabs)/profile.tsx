import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Profile Screen - User Profile & Settings
 * 
 * Exibe perfil do usuário, permitindo:
 * - Visualizar dados pessoais (nome, bio, foto)
 * - Editar perfil
 * - Visualizar badges conquistadas
 * - Configurações de privacidade
 * - Logout
 */
export default function ProfileScreen() {
  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Perfil</Text>
            <Text className="text-base text-muted">
              Gerencie sua conta e preferências
            </Text>
          </View>

          {/* Profile Card */}
          <View className="gap-4 rounded-2xl bg-surface p-6">
            {/* Avatar Placeholder */}
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Text className="text-4xl">👤</Text>
            </View>

            {/* User Info */}
            <View className="gap-1">
              <Text className="text-2xl font-bold text-foreground">Seu Nome</Text>
              <Text className="text-sm text-muted">seu.email@exemplo.com</Text>
            </View>

            {/* Edit Button */}
            <Pressable
              className="items-center rounded-lg bg-primary py-3"
              onPress={() => {
                // TODO: Navigate to edit profile
              }}
            >
              <Text className="font-semibold text-background">Editar Perfil</Text>
            </Pressable>
          </View>

          {/* Badges Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Badges</Text>
            <View className="rounded-lg bg-surface p-4">
              <Text className="text-center text-sm text-muted">
                Nenhuma badge conquistada ainda
              </Text>
            </View>
          </View>

          {/* Settings Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Configurações</Text>
            <View className="gap-2 rounded-lg bg-surface p-4">
              <Pressable className="py-3">
                <Text className="text-base text-foreground">Privacidade</Text>
              </Pressable>
              <View className="border-t border-border" />
              <Pressable className="py-3">
                <Text className="text-base text-foreground">Notificações</Text>
              </Pressable>
              <View className="border-t border-border" />
              <Pressable className="py-3">
                <Text className="text-base text-foreground">Sobre</Text>
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <Pressable
            className="items-center rounded-lg border border-error py-3"
            onPress={() => {
              // TODO: Implement logout
            }}
          >
            <Text className="font-semibold text-error">Sair</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
