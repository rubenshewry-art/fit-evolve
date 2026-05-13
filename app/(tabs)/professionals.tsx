import { ScrollView, View, Text, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

interface Professional {
  id: number;
  name: string;
  bio: string | null;
  specialties: string[];
  studentCount: number;
  maxStudents: number;
  isVerified: boolean;
  plan: "free" | "pro" | "enterprise";
}

export default function ProfessionalsScreen() {
  const colors = useColors();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const utils = trpc.useUtils();
  const searchQuery = trpc.marketplace.search.useQuery({
    specialty: selectedSpecialty,
    limit: 50,
  });

  const specialtiesQuery = trpc.marketplace.getSpecialties.useQuery();
  const connectMutation = trpc.marketplace.connect.useMutation();

  useEffect(() => {
    if (specialtiesQuery.data) {
      setSpecialties(specialtiesQuery.data);
    }
  }, [specialtiesQuery.data]);

  useEffect(() => {
    if (searchQuery.data) {
      setProfessionals(searchQuery.data);
      setLoading(false);
    }
  }, [searchQuery.data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await utils.marketplace.search.invalidate();
    setRefreshing(false);
  };

  const handleConnect = async (professionalId: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await connectMutation.mutateAsync({ professionalId });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await utils.marketplace.search.invalidate();
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Error connecting with professional:", error);
    }
  };

  const renderProfessionalCard = ({ item }: { item: Professional }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              {item.name}
            </Text>
            {item.isVerified && (
              <Text style={{ fontSize: 14, color: colors.success }}>✓</Text>
            )}
          </View>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
            {item.plan === "free" ? "Plano Gratuito" : item.plan === "pro" ? "Plano Pro" : "Plano Enterprise"}
          </Text>
        </View>
      </View>

      {item.bio && (
        <Text
          style={{
            fontSize: 13,
            color: colors.foreground,
            marginBottom: 12,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {item.bio}
        </Text>
      )}

      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {item.specialties.slice(0, 3).map((specialty, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: colors.primary + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.primary }}>
                {specialty}
              </Text>
            </View>
          ))}
          {item.specialties.length > 3 && (
            <View
              style={{
                backgroundColor: colors.muted + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.muted }}>
                +{item.specialties.length - 3}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Text style={{ fontSize: 12, color: colors.muted }}>Alunos</Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            {item.studentCount}/{item.maxStudents}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, color: colors.muted }}>Disponibilidade</Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color:
                item.studentCount < item.maxStudents
                  ? colors.success
                  : colors.error,
            }}
          >
            {item.studentCount < item.maxStudents ? "Disponível" : "Cheio"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => handleConnect(item.id)}
        disabled={item.studentCount >= item.maxStudents || connectMutation.isPending}
        style={({ pressed }) => [
          {
            backgroundColor:
              item.studentCount >= item.maxStudents
                ? colors.muted + "40"
                : colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text
          style={{
            color:
              item.studentCount >= item.maxStudents
                ? colors.muted
                : "white",
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {connectMutation.isPending
            ? "Conectando..."
            : item.studentCount >= item.maxStudents
            ? "Sem Vagas"
            : "Conectar"}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 16 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
              Marketplace
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              Encontre profissionais qualificados
            </Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              Especialidades
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              <Pressable
                onPress={() => {
                  setSelectedSpecialty(undefined);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: !selectedSpecialty ? colors.primary : colors.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: !selectedSpecialty ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: !selectedSpecialty ? "white" : colors.foreground,
                    fontWeight: "500",
                    fontSize: 12,
                  }}
                >
                  Todos
                </Text>
              </Pressable>
              {specialties.map((specialty) => (
                <Pressable
                  key={specialty}
                  onPress={() => {
                    setSelectedSpecialty(specialty);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor:
                        selectedSpecialty === specialty ? colors.primary : colors.surface,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor:
                        selectedSpecialty === specialty ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedSpecialty === specialty ? "white" : colors.foreground,
                      fontWeight: "500",
                      fontSize: 12,
                    }}
                  >
                    {specialty}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : professionals.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>
                Nenhum profissional encontrado
              </Text>
            </View>
          ) : (
            <FlatList
              data={professionals}
              renderItem={renderProfessionalCard}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
