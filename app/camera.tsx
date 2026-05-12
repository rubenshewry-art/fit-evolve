import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { CameraOverlay } from '@/components/camera-overlay';
import { savePhotoToVault } from '@/lib/photo-vault';
import { useColors } from '@/hooks/use-colors';

type CameraAngle = 'front' | 'side' | 'back';

/**
 * Camera Screen - Photo Capture with Overlay
 * 
 * Permite captura de fotos com overlay padronizado para:
 * - Frente (front)
 * - Lateral (side)
 * - Costas (back)
 * 
 * Fotos são salvas no cofre privado do aplicativo.
 */
export default function CameraScreen() {
  const router = useRouter();
  const colors = useColors();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [currentAngle, setCurrentAngle] = useState<CameraAngle>('front');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Solicitar permissão de câmera ao montar
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="items-center justify-center gap-4">
        <Text className="text-lg font-semibold text-foreground">
          Permissão de câmera necessária
        </Text>
        <Text className="text-center text-sm text-muted">
          Precisamos acessar sua câmera para capturar fotos de evolução
        </Text>
        <Pressable
          className="mt-4 rounded-lg bg-primary px-6 py-3"
          onPress={requestPermission}
        >
          <Text className="font-semibold text-background">Conceder Permissão</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: true,
      });

      setCapturedPhoto(photo.uri);
    } catch (error) {
      console.error('[Camera] Error taking picture:', error);
      Alert.alert('Erro', 'Falha ao capturar foto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const savePhoto = async () => {
    if (!capturedPhoto) return;

    try {
      setIsLoading(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Salvar foto no cofre
      await savePhotoToVault(capturedPhoto, currentAngle, 1080, 1920);

      Alert.alert('Sucesso', 'Foto salva no seu cofre privado!', [
        {
          text: 'Continuar',
          onPress: () => {
            setCapturedPhoto(null);
            // Voltar para a tela anterior ou home
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error('[Camera] Error saving photo:', error);
      Alert.alert('Erro', 'Falha ao salvar foto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Se tem foto capturada, mostrar preview
  if (capturedPhoto) {
    return (
      <ScreenContainer className="gap-4">
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Revisar Foto</Text>
            <Text className="text-sm text-muted">
              Ângulo: {currentAngle === 'front' ? 'Frente' : currentAngle === 'side' ? 'Lateral' : 'Costas'}
            </Text>
          </View>

          {/* Photo Preview */}
          <View className="flex-1 rounded-2xl overflow-hidden bg-surface">
            <Image
              source={{ uri: capturedPhoto }}
              style={{ flex: 1 }}
              resizeMode="cover"
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              className="rounded-lg bg-primary py-4"
              onPress={savePhoto}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-center font-semibold text-background">
                  Salvar Foto
                </Text>
              )}
            </Pressable>

            <Pressable
              className="rounded-lg border border-border py-4"
              onPress={retakePhoto}
              disabled={isLoading}
            >
              <Text className="text-center font-semibold text-foreground">
                Refazer Foto
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Câmera ativa
  return (
    <View className="flex-1">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        enableTorch={false}
      >
        {/* Overlay */}
        <CameraOverlay angle={currentAngle} />

        {/* Controls */}
        <View className="absolute bottom-0 left-0 right-0 gap-4 bg-gradient-to-t from-black/80 to-transparent p-6">
          {/* Angle Selection */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-white">Selecione o ângulo:</Text>
            <View className="flex-row gap-2">
              {(['front', 'side', 'back'] as CameraAngle[]).map((angle) => (
                <Pressable
                  key={angle}
                  className={`flex-1 rounded-lg py-2 ${
                    currentAngle === angle
                      ? 'bg-primary'
                      : 'bg-white/20'
                  }`}
                  onPress={() => {
                    setCurrentAngle(angle);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text className="text-center text-xs font-semibold text-white">
                    {angle === 'front' ? 'Frente' : angle === 'side' ? 'Lateral' : 'Costas'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Capture Button */}
          <Pressable
            className="h-16 rounded-full bg-primary"
            onPress={takePicture}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} size="large" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <View className="h-12 w-12 rounded-full border-2 border-background" />
              </View>
            )}
          </Pressable>

          {/* Close Button */}
          <Pressable
            className="rounded-lg bg-white/20 py-3"
            onPress={() => router.back()}
          >
            <Text className="text-center font-semibold text-white">Fechar</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}
