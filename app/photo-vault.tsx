import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable, Image, FlatList, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { getAllPhotos, deletePhoto, getPhotoUri, getVaultStats } from '@/lib/photo-vault';
import { useColors } from '@/hooks/use-colors';

interface PhotoMetadata {
  id: string;
  filename: string;
  angle: 'front' | 'side' | 'back';
  capturedAt: number;
  width: number;
  height: number;
  size: number;
}

/**
 * Photo Vault Screen - Private Photo Gallery
 * 
 * Exibe todas as fotos capturadas no cofre privado, permitindo:
 * - Visualizar fotos por ângulo
 * - Deletar fotos
 * - Ver estatísticas do cofre
 */
export default function PhotoVaultScreen() {
  const router = useRouter();
  const colors = useColors();

  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [stats, setStats] = useState<{
    totalPhotos: number;
    totalSize: number;
    photosByAngle: { front: number; side: number; back: number };
  }>({
    totalPhotos: 0,
    totalSize: 0,
    photosByAngle: { front: 0, side: 0, back: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAngle, setSelectedAngle] = useState<'all' | 'front' | 'side' | 'back'>('all');

  // Carregar fotos quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      loadPhotos();
    }, [])
  );

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const allPhotos = await getAllPhotos();
      const vaultStats = await getVaultStats();

      setPhotos(allPhotos);
      setStats(vaultStats as any);
    } catch (error) {
      console.error('[PhotoVault] Error loading photos:', error);
      Alert.alert('Erro', 'Falha ao carregar fotos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      'Deletar Foto',
      'Tem certeza que deseja deletar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photoId);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadPhotos();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao deletar foto');
            }
          },
        },
      ]
    );
  };

  const filteredPhotos =
    selectedAngle === 'all'
      ? photos
      : photos.filter((p) => p.angle === selectedAngle);

  const angleLabels = {
    front: 'Frente',
    side: 'Lateral',
    back: 'Costas',
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Cofre de Fotos</Text>
            <Text className="text-base text-muted">
              {stats.totalPhotos} foto{stats.totalPhotos !== 1 ? 's' : ''} capturada{stats.totalPhotos !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Statistics */}
          <View className="gap-3 rounded-2xl bg-surface p-4">
            <View className="gap-2">
              <Text className="font-semibold text-foreground">Distribuição por Ângulo</Text>
              <View className="gap-1">
                {(['front', 'side', 'back'] as const).map((angle) => (
                  <View key={angle} className="flex-row items-center justify-between">
                    <Text className="text-sm text-muted">{angleLabels[angle]}</Text>
                    <Text className="font-semibold text-foreground">
                      {stats.photosByAngle[angle]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Angle Filter */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Filtrar por Ângulo</Text>
            <View className="flex-row gap-2">
              {(['all', 'front', 'side', 'back'] as const).map((angle) => (
                <Pressable
                  key={angle}
                  className={`flex-1 rounded-lg py-2 ${
                    selectedAngle === angle
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                  }`}
                  onPress={() => {
                    setSelectedAngle(angle);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    className={`text-center text-xs font-semibold ${
                      selectedAngle === angle
                        ? 'text-background'
                        : 'text-foreground'
                    }`}
                  >
                    {angle === 'all' ? 'Todas' : angleLabels[angle as 'front' | 'side' | 'back']}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Photos Grid */}
          {filteredPhotos.length > 0 ? (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">
                {filteredPhotos.length} foto{filteredPhotos.length !== 1 ? 's' : ''}
              </Text>
              <View className="gap-3">
                {filteredPhotos.map((photo) => (
                  <View
                    key={photo.id}
                    className="gap-2 rounded-lg overflow-hidden bg-surface"
                  >
                    <Image
                      source={{ uri: getPhotoUri(photo) }}
                      style={{ width: '100%', height: 200 }}
                      resizeMode="cover"
                    />
                    <View className="gap-2 p-3">
                      <View className="flex-row items-center justify-between">
                        <View className="gap-1">
                          <Text className="font-semibold text-foreground">
                            {angleLabels[photo.angle]}
                          </Text>
                          <Text className="text-xs text-muted">
                            {new Date(photo.capturedAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Pressable
                          className="rounded-lg bg-error/10 p-2"
                          onPress={() => handleDeletePhoto(photo.id)}
                        >
                          <Text className="text-lg">🗑️</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center gap-4 py-12">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
                <Text className="text-3xl">📸</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">
                Nenhuma foto capturada
              </Text>
              <Text className="text-center text-sm text-muted">
                Comece a capturar fotos de evolução visual
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-2 pt-4">
            <Pressable
              className="rounded-lg bg-primary py-3"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/camera');
              }}
            >
              <Text className="text-center font-semibold text-background">
                Capturar Nova Foto
              </Text>
            </Pressable>

            <Pressable
              className="rounded-lg border border-border py-3"
              onPress={() => router.back()}
            >
              <Text className="text-center font-semibold text-foreground">
                Voltar
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
