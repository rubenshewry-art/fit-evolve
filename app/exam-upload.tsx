/**
 * Exam Upload Screen
 * 
 * Allows students to upload lab exams via camera or file picker.
 * Includes preview, exam type selection, and OCR analysis integration.
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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import {
  validateExamFile,
  getFileSize,
  getFileName,
  guessExamType,
  formatExamType,
} from "@/lib/exam-upload";

type ExamType =
  | "blood_test"
  | "metabolic_panel"
  | "lipid_panel"
  | "hormone_panel"
  | "thyroid"
  | "other";

export default function ExamUploadScreen() {
  const colors = useColors();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [examType, setExamType] = useState<ExamType>("other");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showExamTypeModal, setShowExamTypeModal] = useState(false);
  const [fileSize, setFileSize] = useState<number>(0);

  const examTypes: ExamType[] = [
    "blood_test",
    "metabolic_panel",
    "lipid_panel",
    "hormone_panel",
    "thyroid",
    "other",
  ];

  // Mutations
  const uploadAndAnalyzeMutation =
    trpc.exam.uploadAndAnalyze.useMutation();

  // Request permissions
  useEffect(() => {
    (async () => {
      const cameraStatus =
        await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        cameraStatus.status !== "granted" ||
        mediaLibraryStatus.status !== "granted"
      ) {
        Alert.alert(
          "Permissões Necessárias",
          "Precisamos de permissão para acessar câmera e galeria"
        );
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const validation = await validateExamFile(asset.uri);

        if (!validation.valid) {
          Alert.alert("Arquivo Inválido", validation.error);
          return;
        }

        const size = await getFileSize(asset.uri);
        const name = getFileName(asset.uri);
        const type = guessExamType(name);

        setSelectedImage(asset.uri);
        setFileName(name);
        setExamType(type as ExamType);
        setFileSize(size);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("[ExamUpload] Error taking photo:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePickFile = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const validation = await validateExamFile(asset.uri);

        if (!validation.valid) {
          Alert.alert("Arquivo Inválido", validation.error);
          return;
        }

        const size = await getFileSize(asset.uri);
        const name = getFileName(asset.uri);
        const type = guessExamType(name);

        setSelectedImage(asset.uri);
        setFileName(name);
        setExamType(type as ExamType);
        setFileSize(size);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("[ExamUpload] Error picking file:", error);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSelectExamType = (type: ExamType) => {
    setExamType(type);
    setShowExamTypeModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert("Erro", "Selecione um arquivo primeiro");
      return;
    }

    try {
      setAnalyzing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // In a real app, would upload to S3 first and get URL
      // For now, using the local URI as placeholder
      const result = await uploadAndAnalyzeMutation.mutateAsync({
        examImageUrl: selectedImage,
        examType,
        examDate: new Date(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Sucesso!",
        `Exame analisado com sucesso! ${result.biomarkers.length} biomarcadores encontrados.`,
        [
          {
            text: "Ver Resultados",
            onPress: () => router.push("/(tabs)"),
          },
          {
            text: "Fazer Upload Novo",
            onPress: () => {
              setSelectedImage(null);
              setFileName("");
              setExamType("other");
            },
          },
        ]
      );
    } catch (error) {
      console.error("[ExamUpload] Error uploading exam:", error);
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível analisar o exame"
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedImage(null);
    setFileName("");
    setExamType("other");
    setFileSize(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Upload de Exame
            </Text>
            <Text className="text-base text-muted">
              Compartilhe seus exames para análise de IA
            </Text>
          </View>

          {selectedImage ? (
            <>
              {/* Preview Section */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">
                  Visualização
                </Text>
                <View
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: colors.border }}
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: "100%", height: 300 }}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* File Info */}
              <View
                className="rounded-lg p-4 gap-2"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Arquivo:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {fileName}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Tamanho:</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {fileSize.toFixed(2)} MB
                  </Text>
                </View>
              </View>

              {/* Exam Type Selection */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">
                  Tipo de Exame
                </Text>
                <Pressable
                  onPress={() => setShowExamTypeModal(true)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className="rounded-lg p-4 border flex-row justify-between items-center"
                >
                  <Text className="text-base font-semibold text-foreground">
                    {formatExamType(examType)}
                  </Text>
                  <Text className="text-xl text-muted">›</Text>
                </Pressable>
              </View>

              {/* Exam Type Modal */}
              <Modal
                visible={showExamTypeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowExamTypeModal(false)}
              >
                <View
                  className="flex-1 justify-end"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <View
                    className="rounded-t-3xl p-6 gap-3"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Text className="text-xl font-bold text-foreground">
                      Selecione o Tipo de Exame
                    </Text>

                    {examTypes.map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => handleSelectExamType(type)}
                        style={({ pressed }) => [
                          {
                            backgroundColor:
                              examType === type ? colors.primary : colors.surface,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        className="rounded-lg p-4"
                      >
                        <Text
                          className="text-base font-semibold"
                          style={{
                            color:
                              examType === type
                                ? colors.background
                                : colors.foreground,
                          }}
                        >
                          {formatExamType(type)}
                        </Text>
                      </Pressable>
                    ))}

                    <Pressable
                      onPress={() => setShowExamTypeModal(false)}
                      className="rounded-lg p-4 mt-2"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Text className="text-base font-semibold text-foreground text-center">
                        Cancelar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>

              {/* Action Buttons */}
              <View className="gap-3">
                <Pressable
                  onPress={handleUploadAndAnalyze}
                  disabled={analyzing}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed || analyzing ? 0.8 : 1,
                    },
                  ]}
                  className="rounded-lg py-4 items-center flex-row justify-center gap-2"
                >
                  {analyzing && (
                    <ActivityIndicator
                      size="small"
                      color={colors.background}
                    />
                  )}
                  <Text className="text-base font-semibold text-background">
                    {analyzing ? "Analisando..." : "Analisar Exame"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleClearSelection}
                  disabled={analyzing}
                  style={({ pressed }) => [
                    {
                      borderColor: colors.border,
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                  className="rounded-lg py-3 items-center border"
                >
                  <Text className="text-base font-semibold text-foreground">
                    Selecionar Outro
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              {/* Upload Options */}
              <View className="gap-3">
                <Pressable
                  onPress={handleTakePhoto}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="rounded-lg py-6 items-center gap-2"
                >
                  <Text className="text-2xl">📷</Text>
                  <Text className="text-base font-semibold text-background">
                    Tirar Foto
                  </Text>
                  <Text className="text-xs text-background opacity-70">
                    Usar câmera do celular
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePickFile}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  className="rounded-lg py-6 items-center gap-2 border"
                >
                  <Text className="text-2xl">📁</Text>
                  <Text className="text-base font-semibold text-foreground">
                    Selecionar Arquivo
                  </Text>
                  <Text className="text-xs text-muted">
                    Imagem ou PDF da galeria
                  </Text>
                </Pressable>
              </View>

              {/* Info Section */}
              <View
                className="rounded-lg p-4 gap-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-sm font-semibold text-foreground">
                  ℹ️ Formatos Aceitos
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  • Imagens: JPG, PNG, GIF, WebP
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  • Documentos: PDF
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  • Tamanho máximo: 10 MB
                </Text>
              </View>

              {/* Features Section */}
              <View className="gap-3">
                <Text className="text-lg font-semibold text-foreground">
                  O que acontece depois?
                </Text>

                <View className="gap-2">
                  <View className="flex-row gap-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-sm font-bold text-background">
                        1
                      </Text>
                    </View>
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-foreground">
                        Extração Automática
                      </Text>
                      <Text className="text-xs text-muted">
                        IA extrai dados do exame
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-sm font-bold text-background">
                        2
                      </Text>
                    </View>
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-foreground">
                        Análise Inteligente
                      </Text>
                      <Text className="text-xs text-muted">
                        Gera insights personalizados
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-sm font-bold text-background">
                        3
                      </Text>
                    </View>
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-foreground">
                        Compartilhamento Seguro
                      </Text>
                      <Text className="text-xs text-muted">
                        Controle quem acessa
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
