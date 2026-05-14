import {
  ScrollView,
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

import * as FileSystem from "expo-file-system/legacy";

type Angle = "front" | "side" | "back";

export default function EvolutionGalleryScreen() {
  const colors = useColors();
  const [selectedAngle, setSelectedAngle] = useState<Angle>("front");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [showTimelapseModal, setShowTimelapseModal] = useState(false);
  const [generatingTimelapse, setGeneratingTimelapse] = useState(false);
  const [shareCaption, setShareCaption] = useState("");

  const utils = trpc.useUtils();

  // Get photos for selected angle
  const photosQuery = trpc.timelapse.getPhotosForTimelapse.useQuery({
    studentId: 1, // TODO: Get from auth context
    angle: selectedAngle,
  });

  // Get timelapse preview
  const previewQuery = trpc.timelapse.getPreview.useQuery({
    studentId: 1,
    angle: selectedAngle,
  });

  // Get statistics
  const statsQuery = trpc.timelapse.calculateStats.useQuery({
    studentId: 1,
    angle: selectedAngle,
  });

  // Share to feed mutation
  const shareToFeedMutation = trpc.timelapse.shareToFeed.useMutation();

  const handleGenerateTimelapse = async () => {
    if (!photosQuery.data || photosQuery.data.length < 2) {
      Alert.alert("Erro", "Você precisa de pelo menos 2 fotos para gerar timelapse");
      return;
    }

    try {
      setGeneratingTimelapse(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate timelapse generation (in production, this would use FFmpeg or similar)
      const timelapseId = `timelapse_${Date.now()}`;
      const videoFileName = `${timelapseId}.mp4`;
      const videoPath = `${FileSystem.cacheDirectory}${videoFileName}`;

      // Create a placeholder video file (in production, generate actual video)
      await FileSystem.writeAsStringAsync(videoPath, "video_placeholder");

      // Create timelapse record
      const createRecordMutation = trpc.timelapse.createRecord.useMutation();
      await createRecordMutation.mutateAsync({
        studentId: 1,
        photoCount: photosQuery.data.length,
        angle: selectedAngle,
        startDate: new Date(photosQuery.data[0].capturedAt),
        endDate: new Date(
          photosQuery.data[photosQuery.data.length - 1].capturedAt
        ),
        videoUrl: videoPath,
      });

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      setShowTimelapseModal(true);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Falha ao gerar timelapse");
      console.error("Error generating timelapse:", error);
    } finally {
      setGeneratingTimelapse(false);
    }
  };

  const handleShareTimelapse = async () => {
    if (!shareCaption.trim()) {
      Alert.alert("Erro", "Adicione uma legenda para compartilhar");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await shareToFeedMutation.mutateAsync({
        studentId: 1,
        timelapseId: `timelapse_${Date.now()}`,
        caption: shareCaption,
        isPublic: true,
      });

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      Alert.alert("Sucesso", "Timelapse compartilhado no feed!");
      setShowTimelapseModal(false);
      setShareCaption("");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Falha ao compartilhar timelapse");
      console.error("Error sharing timelapse:", error);
    }
  };

  const renderPhotoCard = ({ item, index }: { item: any; index: number }) => (
            <View
              style={{
                width: "48%",
                marginRight: index % 2 === 0 ? "4%" : 0,
                marginBottom: 12,
                backgroundColor: colors.surface,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Image
                source={{ uri: item.photoUrl }}
                style={{ width: "100%", aspectRatio: 3 / 4 }}
              />
              <View style={{ padding: 8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    textAlign: "center",
                  }}
                >
                  {new Date(item.capturedAt).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            </View>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              Galeria de Evolução
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              Acompanhe sua transformação visual
            </Text>
          </View>

          {/* Angle Selector */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              Ângulo
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["front", "side", "back"] as const).map((angle) => (
                <Pressable
                  key={angle}
                  onPress={() => {
                    setSelectedAngle(angle);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor:
                        selectedAngle === angle ? colors.primary : colors.surface,
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor:
                        selectedAngle === angle ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedAngle === angle ? "white" : colors.foreground,
                      fontWeight: "600",
                      fontSize: 12,
                      textTransform: "capitalize",
                    }}
                  >
                    {angle === "front"
                      ? "Frente"
                      : angle === "side"
                      ? "Lateral"
                      : "Costas"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Statistics */}
          {statsQuery.data && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    Fotos
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                      marginTop: 4,
                    }}
                  >
                    {statsQuery.data.totalPhotos}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    Dias
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                      marginTop: 4,
                    }}
                  >
                    {statsQuery.data.daysSpanned}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    Média/Dia
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                      marginTop: 4,
                    }}
                  >
                    {statsQuery.data.averagePhotosPerDay}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Before/After Preview */}
          {previewQuery.data && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Antes e Depois
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                <Image
                  source={{ uri: previewQuery.data.before.photoUrl }}
                    style={{
                      width: "100%",
                      aspectRatio: 3 / 4,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      textAlign: "center",
                    }}
                  >
                    Antes
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                <Image
                  source={{ uri: previewQuery.data.after.photoUrl }}
                    style={{
                      width: "100%",
                      aspectRatio: 3 / 4,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      textAlign: "center",
                    }}
                  >
                    Depois
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Generate Timelapse Button */}
          <Pressable
            onPress={handleGenerateTimelapse}
            disabled={generatingTimelapse || !photosQuery.data || photosQuery.data.length < 2}
            style={({ pressed }) => [
              {
                backgroundColor:
                  generatingTimelapse || !photosQuery.data || photosQuery.data.length < 2
                    ? colors.muted + "40"
                    : colors.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 20,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {generatingTimelapse ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                🎬 Gerar Timelapse
              </Text>
            )}
          </Pressable>

          {/* Photos Grid */}
          {photosQuery.isLoading ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : photosQuery.data && photosQuery.data.length > 0 ? (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Todas as Fotos ({photosQuery.data.length})
              </Text>
              <FlatList
                data={photosQuery.data}
                renderItem={renderPhotoCard}
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </View>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.muted }}>
                Nenhuma foto capturada neste ângulo
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Timelapse Share Modal */}
      <Modal
        visible={showTimelapseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimelapseModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 40,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                Compartilhar Timelapse
              </Text>
              <Pressable
                onPress={() => setShowTimelapseModal(false)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                Legenda
              </Text>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  minHeight: 80,
                }}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {shareCaption || "Adicione uma legenda..."}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleShareTimelapse}
              disabled={shareToFeedMutation.isPending}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {shareToFeedMutation.isPending
                  ? "Compartilhando..."
                  : "Compartilhar no Feed"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
