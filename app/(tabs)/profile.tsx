import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface Profile {
  id: number;
  name: string;
  bio?: string;
  avatarUrl?: string;
  stats: {
    totalPhotos: number;
    totalExams: number;
    totalPosts: number;
    totalBadges: number;
  };
}

export default function ProfileScreen() {
  const colors = useColors();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState("");
  const [editingBio, setEditingBio] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const { data: profileData } = trpc.profile.getMyProfile.useQuery();
  const { data: completion } = trpc.profile.getCompletion.useQuery();
  const { data: badges } = trpc.profile.getBadges.useQuery();

  // Mutations
  const updateProfileMutation = trpc.profile.updateProfile.useMutation();

  useEffect(() => {
    if (profileData) {
      setProfile(profileData as any);
      setEditingName(profileData.name || "");
      setEditingBio(profileData.bio || "");
      setLoading(false);
    }
  }, [profileData]);

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editingName.trim()) {
      Alert.alert("Erro", "Nome nao pode estar vazio");
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await updateProfileMutation.mutateAsync({
        name: editingName,
        bio: editingBio,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setShowEditModal(false);
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Falha ao atualizar perfil"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer className="items-center justify-center p-4">
        <Text className="text-lg font-semibold text-foreground">
          Perfil nao encontrado
        </Text>
      </ScreenContainer>
    );
  }

  const completionPercent = completion?.completion || 0;

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4 p-4">
          {/* Header */}
          <View className="flex-row justify-between items-start gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-3xl font-bold text-foreground">Perfil</Text>
              <Text className="text-sm text-muted">
                Sua evolucao no Fit_Evolve
              </Text>
            </View>
            <Pressable
              onPress={handleEditProfile}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Text className="text-lg">✏️</Text>
            </Pressable>
          </View>

          {/* Profile Card */}
          <View
            className="rounded-xl p-6 gap-4"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Avatar */}
            <View className="items-center">
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <View
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-4xl">👤</Text>
                </View>
              )}
            </View>

            {/* Name and Bio */}
            <View className="items-center gap-2">
              <Text className="text-2xl font-bold text-foreground">
                {profile.name}
              </Text>
              {profile.bio && (
                <Text className="text-sm text-muted text-center">
                  {profile.bio}
                </Text>
              )}
            </View>

            {/* Profile Completion */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-semibold text-foreground">
                  Perfil Completo
                </Text>
                <Text className="text-xs font-bold text-primary">
                  {completionPercent}%
                </Text>
              </View>
              <View
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${completionPercent}%`,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Statistics Grid */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">
              Estatisticas
            </Text>
            <View className="flex-row gap-3">
              {/* Photos */}
              <View
                className="flex-1 rounded-lg p-4 items-center gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl">📸</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {profile.stats.totalPhotos}
                </Text>
                <Text className="text-xs text-muted text-center">Fotos</Text>
              </View>

              {/* Exams */}
              <View
                className="flex-1 rounded-lg p-4 items-center gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl">📋</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {profile.stats.totalExams}
                </Text>
                <Text className="text-xs text-muted text-center">Exames</Text>
              </View>

              {/* Posts */}
              <View
                className="flex-1 rounded-lg p-4 items-center gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-3xl">📝</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {profile.stats.totalPosts}
                </Text>
                <Text className="text-xs text-muted text-center">Posts</Text>
              </View>
            </View>
          </View>

          {/* Badges Section */}
          {badges && badges.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">
                Badges Conquistadas ({badges.length})
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <View
                    key={index}
                    className="flex-1 min-w-[45%] rounded-lg p-3 items-center gap-2"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-3xl">🏆</Text>
                    <Text className="text-xs font-semibold text-foreground text-center">
                      Badge #{badge.badgeId}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View className="gap-2">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert("Em desenvolvimento", "Compartilhar perfil em breve");
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="rounded-lg p-4 flex-row items-center justify-between"
            >
              <Text className="text-base font-semibold text-foreground">
                📤 Compartilhar Perfil
              </Text>
              <Text className="text-lg">→</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert("Em desenvolvimento", "Configuracoes em breve");
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="rounded-lg p-4 flex-row items-center justify-between"
            >
              <Text className="text-base font-semibold text-foreground">
                ⚙️ Configuracoes
              </Text>
              <Text className="text-lg">→</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View
          className="flex-1 items-center justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="w-full rounded-t-3xl p-6 gap-4"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-foreground">
                Editar Perfil
              </Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <Text className="text-2xl">✕</Text>
              </Pressable>
            </View>

            {/* Name Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                Nome
              </Text>
              <TextInput
                value={editingName}
                onChangeText={setEditingName}
                placeholder="Seu nome"
                placeholderTextColor={colors.muted}
                className="border rounded-lg p-3"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Bio Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                Bio (opcional)
              </Text>
              <TextInput
                value={editingBio}
                onChangeText={setEditingBio}
                placeholder="Conte sobre voce..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                className="border rounded-lg p-3"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                }}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3 pt-4">
              <Pressable
                onPress={() => setShowEditModal(false)}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="flex-1 rounded-lg p-3 items-center"
              >
                <Text className="font-semibold text-foreground">Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveProfile}
                disabled={isSaving}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed || isSaving ? 0.8 : 1,
                  },
                ]}
                className="flex-1 rounded-lg p-3 items-center"
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="font-semibold text-background">Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
