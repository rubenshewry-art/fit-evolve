import { ScrollView, Text, View, Pressable, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { LoadingIndicator } from '@/components/loading-indicator';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const refetchDashboard = async () => {};
  const isLoading = false;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCapturePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/camera');
  };

  const handleUploadExam = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/exam-upload');
  };

  const handleViewCommunity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/feed');
  };

  const handleViewMedications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/medications');
  };

  const handleViewProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/profile');
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingIndicator visible={true} text="Carregando dashboard..." />
      </ScreenContainer>
    );
  }

  const dailyPhrase = 'A consistência é a chave do sucesso';
  const dailyTip = 'Mantenha a consistência! Capture fotos regularmente para acompanhar melhor seu progresso visual.';
  const stats = { photosCount: 0, examsCount: 0, postsCount: 0, streakDays: 0 };
  const recentActivities: any[] = [];

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            enabled={true}
          />
        }
      >
        <View className="flex-1 gap-6 p-6">
          {/* Header com Saudação */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-3xl font-bold text-foreground">Bem-vindo!</Text>
              <Text className="text-base text-muted">Seu progresso começa aqui</Text>
            </View>
            <TouchableOpacity
              onPress={handleViewProfile}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="person" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Daily Motivation Card */}
          <View
            className="rounded-2xl p-6 gap-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-sm font-semibold text-background opacity-80">Frase do Dia</Text>
            <Text className="text-lg font-bold text-background leading-relaxed">
              {'"'}{dailyPhrase}{'"'}
            </Text>
            <TouchableOpacity className="mt-2 flex-row items-center gap-2">
              <Ionicons name="share-social" size={16} color={colors.background} />
              <Text className="text-sm font-semibold text-background">Compartilhar</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Estatísticas</Text>
            <View className="flex-row gap-3">
              {/* Fotos */}
              <View
                className="flex-1 rounded-lg p-4 items-center gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground">{stats.photosCount}</Text>
                <Text className="text-xs text-muted text-center">Fotos</Text>
              </View>

              {/* Exames */}
              <View
                className="flex-1 rounded-lg p-4 items-center gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="document" size={24} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground">{stats.examsCount}</Text>
                <Text className="text-xs text-muted text-center">Exames</Text>
              </View>

              {/* Streak */}
              <View
                className="flex-1 rounded-lg p-4 items-center gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="flame" size={24} color={colors.warning} />
                <Text className="text-2xl font-bold text-foreground">{stats.streakDays}</Text>
                <Text className="text-xs text-muted text-center">Dias</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Ações Rápidas</Text>
            <View className="gap-2">
              <Pressable
                className="flex-row items-center gap-3 rounded-lg p-4 active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={handleCapturePhoto}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons name="camera" size={20} color={colors.background} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Capturar Foto</Text>
                  <Text className="text-xs text-muted">Registre seu progresso</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>

              <Pressable
                className="flex-row items-center gap-3 rounded-lg p-4 active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={handleUploadExam}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons name="document-text" size={20} color={colors.background} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Upload Exame</Text>
                  <Text className="text-xs text-muted">Compartilhe seus resultados</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>

              <Pressable
                className="flex-row items-center gap-3 rounded-lg p-4 active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={handleViewCommunity}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons name="people" size={20} color={colors.background} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Comunidade</Text>
                  <Text className="text-xs text-muted">Veja o progresso de outros</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>

              <Pressable
                className="flex-row items-center gap-3 rounded-lg p-4 active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={handleViewMedications}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.success }}
                >
                  <Ionicons name="medical" size={20} color={colors.background} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Acompanhamento</Text>
                  <Text className="text-xs text-muted">Registre medicações e efeitos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
            </View>
          </View>

          {/* Daily Tip */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Dica do Dia</Text>
            <View
              className="rounded-lg border p-4 gap-2"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="bulb" size={20} color={colors.primary} />
                <Text className="flex-1 font-semibold text-foreground">Dica Técnica</Text>
              </View>
              <Text className="text-sm text-muted leading-relaxed">
                {dailyTip}
              </Text>
            </View>
          </View>

          {/* Recent Activities */}
          {recentActivities.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-foreground">Atividades Recentes</Text>
                <TouchableOpacity>
                  <Text className="text-primary text-sm font-semibold">Ver Tudo</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-2">
                {recentActivities.slice(0, 3).map((activity: any, index: number) => (
                  <View
                    key={index}
                    className="p-3 rounded-lg flex-row items-center gap-3"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Ionicons name="checkmark" size={16} color={colors.background} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{activity.title}</Text>
                      <Text className="text-xs text-muted">{activity.date}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {recentActivities.length === 0 && (
            <View
              className="rounded-lg p-6 items-center gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="mail-outline" size={32} color={colors.muted} />
              <Text className="text-sm font-semibold text-foreground">Comece sua jornada</Text>
              <Text className="text-xs text-muted text-center">
                Capture sua primeira foto ou faça upload de um exame para começar
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
