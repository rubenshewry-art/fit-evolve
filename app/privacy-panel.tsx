/**
 * Privacy Panel Screen
 * 
 * Allows students to manage professional access to their data.
 * Shows list of professionals with access and toggles for each permission type.
 */

import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface ProfessionalWithAccess {
  professionalId: number;
  name: string;
  specialties: string[];
  permissions: {
    canViewPhotos: boolean;
    canViewExams: boolean;
    canViewTraining: boolean;
    canViewNutrition: boolean;
    canViewSupplements: boolean;
  };
  grantedAt: Date;
}

export default function PrivacyPanelScreen() {
  const colors = useColors();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<ProfessionalWithAccess[]>(
    []
  );
  const [stats, setStats] = useState({
    totalProfessionalsWithAccess: 0,
    professionalsByPermission: {
      photos: 0,
      exams: 0,
      training: 0,
      nutrition: 0,
      supplements: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch professionals with access
  const { data: professionalsData } =
    trpc.privacy.getProfessionalsWithAccess.useQuery();
  const { data: statsData } = trpc.privacy.getPermissionStats.useQuery();

  // Mutations
  const updatePermissionMutation = trpc.privacy.updatePermission.useMutation();
  const revokeAccessMutation = trpc.privacy.revokeAccess.useMutation();

  useEffect(() => {
    if (professionalsData) {
      setProfessionals(professionalsData as any);
      setLoading(false);
    }
  }, [professionalsData]);

  useEffect(() => {
    if (statsData) {
      setStats(statsData as any);
    }
  }, [statsData]);

  const handlePermissionToggle = async (
    professionalId: number,
    permission: string,
    currentValue: boolean
  ) => {
    try {
      setUpdatingId(professionalId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await updatePermissionMutation.mutateAsync({
        professionalId,
        permission: permission as any,
        value: !currentValue,
      });

      // Update local state
      setProfessionals((prev) =>
        prev.map((p) =>
          p.professionalId === professionalId
            ? {
                ...p,
                permissions: {
                  ...p.permissions,
                  [permission]: !currentValue,
                },
              }
            : p
        )
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a permissão");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRevokeAccess = (professionalId: number, name: string) => {
    Alert.alert(
      "Revogar Acesso",
      `Tem certeza que deseja revogar o acesso de ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Revogar",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingId(professionalId);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              await revokeAccessMutation.mutateAsync({
                professionalId,
              });

              setProfessionals((prev) =>
                prev.filter((p) => p.professionalId !== professionalId)
              );

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível revogar o acesso");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const getPermissionLabel = (permission: string): string => {
    const labels: Record<string, string> = {
      canViewPhotos: "Fotos de Evolução",
      canViewExams: "Exames Laboratoriais",
      canViewTraining: "Dados de Treino",
      canViewNutrition: "Dados de Nutrição",
      canViewSupplements: "Suplementação",
    };
    return labels[permission] || permission;
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Privacidade
            </Text>
            <Text className="text-base text-muted">
              Controle quem pode acessar seus dados
            </Text>
          </View>

          {/* Stats Summary */}
          <View
            className="rounded-2xl p-4 gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row justify-between">
              <View className="gap-1">
                <Text className="text-sm text-muted">Profissionais</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {stats.totalProfessionalsWithAccess}
                </Text>
              </View>
              <View className="gap-1 items-end">
                <Text className="text-sm text-muted">Tipos de Dados</Text>
                <View className="flex-row gap-2">
                  {stats.professionalsByPermission.photos > 0 && (
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-xs font-semibold text-background">
                        Fotos
                      </Text>
                    </View>
                  )}
                  {stats.professionalsByPermission.exams > 0 && (
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-xs font-semibold text-background">
                        Exames
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Professionals List */}
          {professionals.length > 0 ? (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Profissionais com Acesso
              </Text>
              {professionals.map((prof) => (
                <View
                  key={prof.professionalId}
                  className="rounded-xl p-4 gap-3 border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {/* Professional Info */}
                  <View className="flex-row justify-between items-start gap-2">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {prof.name}
                      </Text>
                      {prof.specialties.length > 0 && (
                        <Text className="text-sm text-muted">
                          {prof.specialties.join(", ")}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() =>
                        handleRevokeAccess(prof.professionalId, prof.name)
                      }
                      disabled={updatingId === prof.professionalId}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.6 : 1,
                        },
                      ]}
                    >
                      <Text className="text-sm font-semibold text-error">
                        Revogar
                      </Text>
                    </Pressable>
                  </View>

                  {/* Permissions */}
                  <View className="gap-2 border-t pt-3" style={{ borderTopColor: colors.border }}>
                    {Object.entries(prof.permissions).map(
                      ([permission, value]) => (
                        <View
                          key={permission}
                          className="flex-row justify-between items-center"
                        >
                          <Text className="text-sm text-foreground">
                            {getPermissionLabel(permission)}
                          </Text>
                          <Switch
                            value={value as boolean}
                            onValueChange={() =>
                              handlePermissionToggle(
                                prof.professionalId,
                                permission,
                                value as boolean
                              )
                            }
                            disabled={updatingId === prof.professionalId}
                            trackColor={{
                              false: colors.border,
                              true: colors.primary,
                            }}
                            thumbColor={colors.background}
                          />
                        </View>
                      )
                    )}
                  </View>

                  {/* Granted Date */}
                  <Text className="text-xs text-muted">
                    Acesso concedido em{" "}
                    {new Date(prof.grantedAt).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View
              className="rounded-xl p-6 items-center gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base font-semibold text-muted">
                Nenhum profissional com acesso
              </Text>
              <Text className="text-sm text-muted text-center">
                Você pode conceder acesso a profissionais através da tela de
                profissionais
              </Text>
            </View>
          )}

          {/* Add Professional Button */}
          <Pressable
            onPress={() => router.push("/professionals")}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="rounded-lg py-3 items-center"
          >
            <Text className="text-base font-semibold text-background">
              Adicionar Profissional
            </Text>
          </Pressable>

          {/* Privacy Info */}
          <View
            className="rounded-lg p-4 gap-2"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-semibold text-foreground">
              💡 Dica de Privacidade
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Você tem controle total sobre seus dados. Pode revogar acesso a
              qualquer momento e escolher exatamente quais informações cada
              profissional pode visualizar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
