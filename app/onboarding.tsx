import { useState, useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: "Bem-vindo ao Fit_Evolve",
    description: "Sua jornada de evolucao visual e saude comeca aqui",
    icon: "💪",
    color: "#0a7ea4",
  },
  {
    id: 2,
    title: "Capture Sua Evolucao",
    description: "Tire fotos padronizadas e acompanhe seu progresso visual",
    icon: "📸",
    color: "#22c55e",
  },
  {
    id: 3,
    title: "Conecte com Profissionais",
    description: "Trabalhe com personal, nutricionista e fisioterapeuta",
    icon: "👥",
    color: "#f59e0b",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userType, setUserType] = useState<"student" | "professional" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const updateProfileMutation = trpc.profile.updateProfile.useMutation();

  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Request camera permission
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      console.log("Camera permission:", cameraStatus.status);

      // Request media library permission
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Media library permission:", mediaStatus.status);

      // Request notification permission
      const notificationStatus = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      console.log("Notification permission:", notificationStatus.status);

      // Update user profile with onboarding completed
      if (userType) {
        await updateProfileMutation.mutateAsync({
          name: userType === "student" ? "Aluno" : "Profissional",
        });
      }

      Alert.alert("Sucesso", "Onboarding concluido! Bem-vindo ao Fit_Evolve");
      // Navigate to home
      // router.replace("/(tabs)");
    } catch (error) {
      console.error("[Onboarding] Permission error:", error);
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Erro ao solicitar permissoes"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Show user type selection
      setUserType(null);
    }
  };

  const handleSelectUserType = (type: "student" | "professional") => {
    setUserType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (userType === null && currentSlide === SLIDES.length) {
    // User type selection screen
    return (
      <ScreenContainer className="flex-1 justify-center p-6">
        <View className="gap-6">
          <View className="items-center gap-3">
            <Text className="text-5xl">🎯</Text>
            <Text className="text-3xl font-bold text-foreground">
              Qual seu perfil?
            </Text>
            <Text className="text-sm text-muted text-center">
              Escolha como voce vai usar o Fit_Evolve
            </Text>
          </View>

          <View className="gap-3">
            {/* Student Option */}
            <Pressable
              onPress={() => handleSelectUserType("student")}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.8 : 1,
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              className="rounded-2xl p-6 gap-3"
            >
              <Text className="text-4xl">🏋️</Text>
              <Text className="text-xl font-bold text-foreground">Aluno</Text>
              <Text className="text-sm text-muted">
                Acompanhe sua evolucao visual e trabalhe com profissionais
              </Text>
            </Pressable>

            {/* Professional Option */}
            <Pressable
              onPress={() => handleSelectUserType("professional")}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.8 : 1,
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              className="rounded-2xl p-6 gap-3"
            >
              <Text className="text-4xl">👨‍⚕️</Text>
              <Text className="text-xl font-bold text-foreground">
                Profissional
              </Text>
              <Text className="text-sm text-muted">
                Gerencie seus alunos e acesse seus dados de evolucao
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (userType) {
    // Permissions screen
    return (
      <ScreenContainer className="flex-1 justify-between p-6">
        <View className="gap-6 flex-1 justify-center">
          <View className="items-center gap-3">
            <Text className="text-5xl">🔐</Text>
            <Text className="text-3xl font-bold text-foreground">
              Permissoes Necessarias
            </Text>
            <Text className="text-sm text-muted text-center">
              Precisamos de algumas permissoes para que o Fit_Evolve funcione
              perfeitamente
            </Text>
          </View>

          <View className="gap-4">
            {/* Camera Permission */}
            <View
              className="rounded-xl p-4 flex-row items-start gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl">📷</Text>
              <View className="flex-1 gap-1">
                <Text className="font-semibold text-foreground">Camera</Text>
                <Text className="text-xs text-muted">
                  Para capturar fotos de evolucao
                </Text>
              </View>
            </View>

            {/* Gallery Permission */}
            <View
              className="rounded-xl p-4 flex-row items-start gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl">🖼️</Text>
              <View className="flex-1 gap-1">
                <Text className="font-semibold text-foreground">Galeria</Text>
                <Text className="text-xs text-muted">
                  Para acessar fotos e exames
                </Text>
              </View>
            </View>

            {/* Notifications Permission */}
            <View
              className="rounded-xl p-4 flex-row items-start gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl">🔔</Text>
              <View className="flex-1 gap-1">
                <Text className="font-semibold text-foreground">
                  Notificacoes
                </Text>
                <Text className="text-xs text-muted">
                  Para receber atualizacoes importantes
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Pressable
            onPress={handleRequestPermissions}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed || isLoading ? 0.8 : 1,
              },
            ]}
            className="rounded-lg p-4 items-center"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="font-semibold text-background text-base">
                Permitir Tudo
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => setUserType(null)}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            className="rounded-lg p-4 items-center"
          >
            <Text className="font-semibold text-foreground text-base">
              Voltar
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // Slides screen
  const slide = SLIDES[currentSlide];
  const progress = (currentSlide + 1) / SLIDES.length;

  return (
    <ScreenContainer className="flex-1 justify-between p-6">
      <View className="gap-6 flex-1 justify-center">
        {/* Progress Bar */}
        <View className="gap-2">
          <View
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.border }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: `${progress * 100}%`,
              }}
            />
          </View>
          <Text className="text-xs text-muted text-center">
            {currentSlide + 1} de {SLIDES.length}
          </Text>
        </View>

        {/* Slide Content */}
        <View className="items-center gap-6">
          <Text className="text-6xl">{slide.icon}</Text>
          <View className="gap-3 items-center">
            <Text className="text-3xl font-bold text-foreground text-center">
              {slide.title}
            </Text>
            <Text className="text-base text-muted text-center">
              {slide.description}
            </Text>
          </View>
        </View>

        {/* Slide Indicators */}
        <View className="flex-row justify-center gap-2">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className="rounded-full"
              style={{
                width: index === currentSlide ? 24 : 8,
                height: 8,
                backgroundColor:
                  index === currentSlide ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View className="gap-3">
        <Pressable
          onPress={handleNextSlide}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          className="rounded-lg p-4 items-center"
        >
          <Text className="font-semibold text-background text-base">
            {currentSlide === SLIDES.length - 1 ? "Proximo" : "Proximo"}
          </Text>
        </Pressable>

        {currentSlide > 0 && (
          <Pressable
            onPress={() => {
              setCurrentSlide(currentSlide - 1);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
            className="rounded-lg p-4 items-center"
          >
            <Text className="font-semibold text-foreground text-base">
              Voltar
            </Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}
