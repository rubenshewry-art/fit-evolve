import { ScrollView, View, Text, TextInput, Pressable, Switch } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

type Frequency = "daily" | "weekdays" | "weekends" | "custom";

export default function RoutineFormScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const routineId = params.routineId ? parseInt(params.routineId as string) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch routine if editing
  const { data: routine } = trpc.routines.getRoutine.useQuery(
    { routineId: routineId || 0 },
    { enabled: !!routineId }
  );

  const createMutation = trpc.routines.createRoutine.useMutation();
  const updateMutation = trpc.routines.updateRoutine.useMutation();

  useEffect(() => {
    if (routine) {
      setTitle(routine.title);
      setDescription(routine.description || "");
      setTime(routine.time || "");
      setFrequency(routine.frequency);
      setReminderEnabled(routine.reminderEnabled);
    }
  }, [routine]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, preencha o título da rotina");
      return;
    }

    setIsLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (routineId) {
        await updateMutation.mutateAsync({
          routineId,
          title,
          description: description || undefined,
          time: time || undefined,
          frequency,
          reminderEnabled,
        });
      } else {
        await createMutation.mutateAsync({
          title,
          description: description || undefined,
          time: time || undefined,
          frequency,
          reminderEnabled,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert("Erro ao salvar rotina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground mb-1">
            {routineId ? "Editar Rotina" : "Nova Rotina"}
          </Text>
          <Text className="text-sm text-muted">
            {routineId ? "Atualize os detalhes da sua rotina" : "Crie uma nova rotina diária"}
          </Text>
        </View>

        {/* Title */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-foreground mb-2">Título *</Text>
          <TextInput
            placeholder="Ex: Beber água, Fazer exercício..."
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            editable={!isLoading}
          />
        </View>

        {/* Description */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-foreground mb-2">Descrição</Text>
          <TextInput
            placeholder="Adicione detalhes sobre a rotina..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground h-24"
            multiline
            editable={!isLoading}
          />
        </View>

        {/* Time */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-foreground mb-2">Horário</Text>
          <TextInput
            placeholder="HH:MM"
            value={time}
            onChangeText={setTime}
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
            editable={!isLoading}
          />
        </View>

        {/* Frequency */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-foreground mb-3">Frequência</Text>
          <View className="flex-row gap-2">
            {(["daily", "weekdays", "weekends", "custom"] as const).map((freq) => (
              <Pressable
                key={freq}
                onPress={() => setFrequency(freq)}
                disabled={isLoading}
                className={cn(
                  "flex-1 rounded-lg py-2 px-3 border",
                  frequency === freq
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-semibold text-center capitalize",
                    frequency === freq ? "text-background" : "text-foreground"
                  )}
                >
                  {freq === "daily"
                    ? "Diária"
                    : freq === "weekdays"
                      ? "Seg-Sex"
                      : freq === "weekends"
                        ? "Fim de semana"
                        : "Customizada"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Reminder Toggle */}
        <View className="mb-8 flex-row items-center justify-between bg-surface rounded-lg p-4 border border-border">
          <View>
            <Text className="text-sm font-semibold text-foreground">Lembrete</Text>
            <Text className="text-xs text-muted">Receber notificação para esta rotina</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            disabled={isLoading}
          />
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-surface border border-border rounded-lg py-3"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-center font-semibold text-foreground">Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            className="flex-1 bg-primary rounded-lg py-3"
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <Text className="text-center font-semibold text-background">
              {isLoading ? "Salvando..." : "Salvar"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
