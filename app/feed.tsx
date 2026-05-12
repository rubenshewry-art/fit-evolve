/**
 * Social Feed Screen
 * 
 * Displays public posts from students and allows creating new posts.
 */

import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface Post {
  id: number;
  studentId: number;
  caption: string;
  photoId?: number;
  isPublic: boolean;
  createdAt: Date;
  markedProfessionalIds: number[];
}

export default function FeedScreen() {
  const colors = useColors();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: feedData, refetch } = trpc.social.getFeed.useQuery({
    limit: 20,
  });

  useEffect(() => {
    if (feedData) {
      setPosts(feedData as any);
      setLoading(false);
    }
  }, [feedData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement create post modal or screen
    Alert.alert("Em desenvolvimento", "Tela de criar post em breve");
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return d.toLocaleDateString("pt-BR");
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View className="gap-4 p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-3xl font-bold text-foreground">
                Comunidade
              </Text>
              <Text className="text-sm text-muted">
                Veja as conquistas de outros alunos
              </Text>
            </View>
            <Pressable
              onPress={handleCreatePost}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Text className="text-xl">+</Text>
            </Pressable>
          </View>

          {/* Posts List */}
          {posts.length > 0 ? (
            <View className="gap-3">
              {posts.map((post) => (
                <View
                  key={post.id}
                  className="rounded-xl p-4 gap-3 border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {/* Post Header */}
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-foreground">
                        Aluno #{post.studentId}
                      </Text>
                      <Text className="text-xs text-muted">
                        {formatDate(new Date(post.createdAt))}
                      </Text>
                    </View>
                    {!post.isPublic && (
                      <View className="px-2 py-1 rounded-full bg-warning">
                        <Text className="text-xs font-semibold text-background">
                          Privado
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Post Caption */}
                  <Text className="text-sm text-foreground leading-relaxed">
                    {post.caption}
                  </Text>

                  {/* Tagged Professionals */}
                  {post.markedProfessionalIds.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                      {post.markedProfessionalIds.map((profId) => (
                        <View
                          key={profId}
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Text className="text-xs font-semibold text-background">
                            Prof #{profId}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Actions */}
                  <View className="flex-row gap-3 pt-2 border-t" style={{ borderTopColor: colors.border }}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="flex-1 py-2 items-center"
                    >
                      <Text className="text-sm font-semibold text-primary">
                        👍 Curtir
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="flex-1 py-2 items-center"
                    >
                      <Text className="text-sm font-semibold text-primary">
                        💬 Comentar
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="flex-1 py-2 items-center"
                    >
                      <Text className="text-sm font-semibold text-primary">
                        📤 Compartilhar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View
              className="rounded-xl p-8 items-center gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-4xl">📭</Text>
              <Text className="text-base font-semibold text-foreground">
                Nenhum post ainda
              </Text>
              <Text className="text-sm text-muted text-center">
                Seja o primeiro a compartilhar sua conquista!
              </Text>
              <Pressable
                onPress={handleCreatePost}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                className="rounded-lg px-6 py-3 mt-2"
              >
                <Text className="text-sm font-semibold text-background">
                  Criar Primeiro Post
                </Text>
              </Pressable>
            </View>
          )}

          {/* Tips Section */}
          <View
            className="rounded-lg p-4 gap-2"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-sm font-semibold text-foreground">
              💡 Dica
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Compartilhe suas conquistas e evolução com a comunidade. Marque
              profissionais para criar uma vitrine do seu progresso!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
