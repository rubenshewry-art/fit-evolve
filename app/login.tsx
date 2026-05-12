import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function LoginScreen() {
  const colors = useColors();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      Alert.alert("Em desenvolvimento", "Login com email/senha em breve");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Falha ao fazer login";
      setError(errorMsg);
      Alert.alert("Erro de Login", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      Alert.alert("Em desenvolvimento", "Login OAuth em breve");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Falha ao fazer login com OAuth";
      setError(errorMsg);
      Alert.alert("Erro de Login", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between p-6">
          {/* Header */}
          <View className="gap-6">
            <View className="items-center gap-3 mt-12">
              <Text className="text-5xl">💪</Text>
              <Text className="text-3xl font-bold text-foreground">Fit_Evolve</Text>
              <Text className="text-sm text-muted text-center">
                Sua jornada de evolucao visual e saude
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4 mt-8">
              {/* Email Input */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  editable={!isLoading}
                  className="border rounded-lg p-3"
                  style={{
                    borderColor: colors.border,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Password Input */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Senha</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Sua senha"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  editable={!isLoading}
                  className="border rounded-lg p-3"
                  style={{
                    borderColor: colors.border,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Error Message */}
              {error && (
                <View
                  className="rounded-lg p-3"
                  style={{ backgroundColor: colors.error + "20" }}
                >
                  <Text className="text-sm text-error">{error}</Text>
                </View>
              )}

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
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
                    Entrar
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3">
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: colors.border }}
              />
              <Text className="text-xs text-muted">OU</Text>
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: colors.border }}
              />
            </View>

            {/* OAuth Button */}
            <Pressable
              onPress={handleOAuthLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed || isLoading ? 0.8 : 1,
                },
              ]}
              className="rounded-lg p-4 items-center border flex-row justify-center gap-2"
            >
              <Text className="text-xl">🔐</Text>
              <Text className="font-semibold text-foreground text-base">
                Entrar com Manus
              </Text>
            </Pressable>

            {/* Forgot Password */}
            <Pressable onPress={() => Alert.alert("Em breve", "Recuperacao de senha em desenvolvimento")}>
              <Text className="text-center text-sm text-primary font-semibold">
                Esqueceu a senha?
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="gap-3 items-center pb-6">
            <Text className="text-sm text-muted">Nao tem conta?</Text>
            <Pressable
              onPress={() => Alert.alert("Em breve", "Registro em desenvolvimento")}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Text className="font-semibold text-primary text-base">
                Criar conta
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
