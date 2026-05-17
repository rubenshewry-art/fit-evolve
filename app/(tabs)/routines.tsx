import { ScrollView, View, Text, Pressable, RefreshControl, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

interface Routine {
  id: number;
  title: string;
  description?: string | null;
  time?: string | null;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  isActive: boolean;
  reminderEnabled: boolean;
}

export default function RoutinesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);

  // Fetch routines
  const { data: routines = [], isLoading, refetch } = trpc.routines.getMyRoutines.useQuery();
  const { data: completions = [] } = trpc.routines.getTodayCompletions.useQuery();
  const { data: stats } = trpc.routines.getStats.useQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddRoutine = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/routines/form" as any);
  }, [router]);

  const handleEditRoutine = useCallback(
    (routine: Routine) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: "/(tabs)/routines/form" as any,
        params: { routineId: routine.id },
      });
    },
    [router]
  );

  const isRoutineCompleted = (routineId: number) => {
    return completions.some((c: any) => c.routineId === routineId);
  };

  const renderRoutineItem = ({ item: routine }: { item: Routine }) => {
    const completed = isRoutineCompleted(routine.id);

    return (
      <Pressable
        onPress={() => handleEditRoutine(routine)}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View
          className={cn(
            "mb-3 rounded-xl p-4 border",
            completed ? "bg-success/10 border-success" : "bg-surface border-border"
          )}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-foreground flex-1">
              {routine.title}
            </Text>
            {completed && (
              <View className="bg-success rounded-full px-2 py-1">
                <Text className="text-xs font-semibold text-background">✓ Concluída</Text>
              </View>
            )}
          </View>

          {routine.description && (
            <Text className="text-sm text-muted mb-2">{routine.description}</Text>
          )}

          <View className="flex-row items-center gap-3">
            {routine.time && (
              <View className="flex-row items-center gap-1">
                <Text className="text-xs text-muted">🕐</Text>
                <Text className="text-xs text-muted">{routine.time}</Text>
              </View>
            )}
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-muted">📅</Text>
              <Text className="text-xs text-muted capitalize">{routine.frequency}</Text>
            </View>
            {routine.reminderEnabled && (
              <View className="flex-row items-center gap-1">
                <Text className="text-xs text-muted">🔔</Text>
                <Text className="text-xs text-muted">Lembrete</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const emptyState = (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-4xl mb-4">📋</Text>
      <Text className="text-lg font-semibold text-foreground mb-2">Nenhuma rotina</Text>
      <Text className="text-sm text-muted text-center px-4 mb-6">
        Comece a organizar seu dia criando sua primeira rotina
      </Text>
      <Pressable
        onPress={handleAddRoutine}
        className="bg-primary px-6 py-3 rounded-full"
      >
        <Text className="text-background font-semibold">+ Criar Rotina</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={routines}
        renderItem={renderRoutineItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={emptyState}
        ListHeaderComponent={
          routines.length > 0 ? (
            <View className="px-4 pt-4 pb-2">
              <View className="mb-4">
                <Text className="text-2xl font-bold text-foreground mb-1">Minhas Rotinas</Text>
                <View className="flex-row gap-4">
                  <View>
                    <Text className="text-2xl font-bold text-primary">
                      {stats?.completedToday || 0}
                    </Text>
                    <Text className="text-xs text-muted">Concluídas hoje</Text>
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-foreground">
                      {stats?.totalRoutines || 0}
                    </Text>
                    <Text className="text-xs text-muted">Total</Text>
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-foreground">
                      {stats ? Math.round(stats.completionRate) : 0}%
                    </Text>
                    <Text className="text-xs text-muted">Taxa</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null
        }
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        scrollEnabled={routines.length > 0}
      />

      {routines.length > 0 && (
        <Pressable
          onPress={handleAddRoutine}
          className="absolute bottom-6 right-6 bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg"
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Text className="text-2xl text-background">+</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}
