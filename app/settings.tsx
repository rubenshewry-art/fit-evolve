import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colors = useColors();

  // Estados de notificações
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Mutations
  const resetOnboardingMutation = trpc.profile.completeOnboarding.useMutation();

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao fazer logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Resetar Onboarding',
      'Isso fará você refazer o onboarding na próxima vez que abrir o app.',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Resetar',
          onPress: async () => {
            try {
              await resetOnboardingMutation.mutateAsync();
              Alert.alert('Sucesso', 'Onboarding resetado. Reinicie o app para começar novamente.');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao resetar onboarding');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/profile');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Política de Privacidade', 'Política de privacidade em breve');
  };

  const handleTermsOfService = () => {
    Alert.alert('Termos de Serviço', 'Termos de serviço em breve');
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b" style={{ borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Configurações</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Seção de Perfil */}
        <View className="p-6 gap-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-bold text-foreground">Perfil</Text>

          <TouchableOpacity
            onPress={handleEditProfile}
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="person" size={20} color={colors.primary} />
              <View>
                <Text className="font-semibold text-foreground">Editar Perfil</Text>
                <Text className="text-xs text-muted">Nome, foto, bio</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
              <View>
                <Text className="font-semibold text-foreground">Privacidade</Text>
                <Text className="text-xs text-muted">Controlar acesso aos dados</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Seção de Notificações */}
        <View className="p-6 gap-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-bold text-foreground">Notificações</Text>

          <View
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <View>
                <Text className="font-semibold text-foreground">Notificações</Text>
                <Text className="text-xs text-muted">Ativar/desativar todas</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notificationsEnabled ? colors.background : colors.muted}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View
                className="p-4 rounded-lg flex-row items-center justify-between"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="mail" size={20} color={colors.primary} />
                  <View>
                    <Text className="font-semibold text-foreground">Email</Text>
                    <Text className="text-xs text-muted">Notificações por email</Text>
                  </View>
                </View>
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={emailNotifications ? colors.background : colors.muted}
                />
              </View>

              <View
                className="p-4 rounded-lg flex-row items-center justify-between"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="notifications-circle" size={20} color={colors.primary} />
                  <View>
                    <Text className="font-semibold text-foreground">Push</Text>
                    <Text className="text-xs text-muted">Notificações push</Text>
                  </View>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={pushNotifications ? colors.background : colors.muted}
                />
              </View>
            </>
          )}
        </View>

        {/* Seção de Dados */}
        <View className="p-6 gap-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-bold text-foreground">Dados</Text>

          <TouchableOpacity
            onPress={handleResetOnboarding}
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="refresh" size={20} color={colors.warning} />
              <View>
                <Text className="font-semibold text-foreground">Resetar Onboarding</Text>
                <Text className="text-xs text-muted">Refazer tutorial inicial</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="download" size={20} color={colors.primary} />
              <View>
                <Text className="font-semibold text-foreground">Exportar Dados</Text>
                <Text className="text-xs text-muted">Baixar seus dados</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Seção de Informações */}
        <View className="p-6 gap-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-bold text-foreground">Informações</Text>

          <TouchableOpacity
            onPress={handlePrivacyPolicy}
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <View>
                <Text className="font-semibold text-foreground">Política de Privacidade</Text>
                <Text className="text-xs text-muted">Leia nossas políticas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTermsOfService}
            className="p-4 rounded-lg flex-row items-center justify-between"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <View>
                <Text className="font-semibold text-foreground">Termos de Serviço</Text>
                <Text className="text-xs text-muted">Leia os termos</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <View
            className="p-4 rounded-lg gap-1"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted">Versão do App</Text>
            <Text className="font-semibold text-foreground">1.0.0</Text>
          </View>
        </View>

        {/* Seção de Logout */}
        <View className="p-6 gap-4 pb-12">
          <TouchableOpacity
            onPress={handleLogout}
            className="p-4 rounded-lg flex-row items-center justify-center gap-3"
            style={{ backgroundColor: colors.error }}
          >
            <Ionicons name="log-out" size={20} color={colors.background} />
            <Text className="font-semibold text-background">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
