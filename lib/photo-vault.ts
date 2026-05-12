import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

/**
 * Photo Vault - Secure private photo storage
 * 
 * Gerencia o armazenamento privado de fotos de evolução visual.
 * As fotos são salvas em um diretório privado do aplicativo e não aparecem
 * na galeria do celular.
 */

const VAULT_DIRECTORY = `${FileSystem.documentDirectory}photo-vault/`;
const METADATA_FILE = `${VAULT_DIRECTORY}metadata.json`;

interface PhotoMetadata {
  id: string;
  filename: string;
  angle: 'front' | 'side' | 'back';
  capturedAt: number;
  width: number;
  height: number;
  size: number;
}

interface VaultMetadata {
  photos: PhotoMetadata[];
  lastUpdated: number;
}

/**
 * Inicializa o cofre de fotos criando o diretório se não existir
 */
export async function initializeVault(): Promise<void> {
  try {
    const vaultInfo = await FileSystem.getInfoAsync(VAULT_DIRECTORY);
    if (!vaultInfo.exists) {
      await FileSystem.makeDirectoryAsync(VAULT_DIRECTORY, { intermediates: true });
    }

    // Criar arquivo de metadados se não existir
    const metadataInfo = await FileSystem.getInfoAsync(METADATA_FILE);
    if (!metadataInfo.exists) {
      const initialMetadata: VaultMetadata = {
        photos: [],
        lastUpdated: Date.now(),
      };
      await FileSystem.writeAsStringAsync(
        METADATA_FILE,
        JSON.stringify(initialMetadata, null, 2)
      );
    }
  } catch (error) {
    console.error('[PhotoVault] Error initializing vault:', error);
    throw error;
  }
}

/**
 * Gera um ID único para a foto
 */
function generatePhotoId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Salva uma foto no cofre privado
 */
export async function savePhotoToVault(
  photoUri: string,
  angle: 'front' | 'side' | 'back',
  width: number,
  height: number
): Promise<PhotoMetadata> {
  try {
    await initializeVault();

    const photoId = generatePhotoId();
    const filename = `${photoId}.jpg`;
    const destinationUri = `${VAULT_DIRECTORY}${filename}`;

    // Copiar foto para o cofre
    await FileSystem.copyAsync({
      from: photoUri,
      to: destinationUri,
    });

    // Obter informações do arquivo
    const fileInfo = await FileSystem.getInfoAsync(destinationUri);
    const size = (fileInfo as any).size || 0;

    // Criar metadados da foto
    const photoMetadata: PhotoMetadata = {
      id: photoId,
      filename,
      angle,
      capturedAt: Date.now(),
      width,
      height,
      size,
    };

    // Atualizar arquivo de metadados
    await addPhotoMetadata(photoMetadata);

    return photoMetadata;
  } catch (error) {
    console.error('[PhotoVault] Error saving photo:', error);
    throw error;
  }
}

/**
 * Adiciona metadados de foto ao arquivo de metadados
 */
async function addPhotoMetadata(photoMetadata: PhotoMetadata): Promise<void> {
  try {
    const metadataContent = await FileSystem.readAsStringAsync(METADATA_FILE);
    const metadata: VaultMetadata = JSON.parse(metadataContent);

    metadata.photos.push(photoMetadata);
    metadata.lastUpdated = Date.now();

    await FileSystem.writeAsStringAsync(
      METADATA_FILE,
      JSON.stringify(metadata, null, 2)
    );
  } catch (error) {
    console.error('[PhotoVault] Error adding photo metadata:', error);
    throw error;
  }
}

/**
 * Obtém todas as fotos do cofre
 */
export async function getAllPhotos(): Promise<PhotoMetadata[]> {
  try {
    await initializeVault();

    const metadataContent = await FileSystem.readAsStringAsync(METADATA_FILE);
    const metadata: VaultMetadata = JSON.parse(metadataContent);

    return metadata.photos.sort((a, b) => b.capturedAt - a.capturedAt);
  } catch (error) {
    console.error('[PhotoVault] Error getting all photos:', error);
    return [];
  }
}

/**
 * Obtém fotos por ângulo
 */
export async function getPhotosByAngle(
  angle: 'front' | 'side' | 'back'
): Promise<PhotoMetadata[]> {
  try {
    const allPhotos = await getAllPhotos();
    return allPhotos.filter((photo) => photo.angle === angle);
  } catch (error) {
    console.error('[PhotoVault] Error getting photos by angle:', error);
    return [];
  }
}

/**
 * Obtém a URI local de uma foto
 */
export function getPhotoUri(photoMetadata: PhotoMetadata): string {
  return `${VAULT_DIRECTORY}${photoMetadata.filename}`;
}

/**
 * Deleta uma foto do cofre
 */
export async function deletePhoto(photoId: string): Promise<void> {
  try {
    // Obter metadados
    const metadataContent = await FileSystem.readAsStringAsync(METADATA_FILE);
    const metadata: VaultMetadata = JSON.parse(metadataContent);

    // Encontrar foto
    const photoIndex = metadata.photos.findIndex((p) => p.id === photoId);
    if (photoIndex === -1) {
      throw new Error(`Photo with id ${photoId} not found`);
    }

    const photo = metadata.photos[photoIndex];

    // Deletar arquivo
    const photoUri = getPhotoUri(photo);
    await FileSystem.deleteAsync(photoUri, { idempotent: true });

    // Atualizar metadados
    metadata.photos.splice(photoIndex, 1);
    metadata.lastUpdated = Date.now();

    await FileSystem.writeAsStringAsync(
      METADATA_FILE,
      JSON.stringify(metadata, null, 2)
    );
  } catch (error) {
    console.error('[PhotoVault] Error deleting photo:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas do cofre
 */
export async function getVaultStats(): Promise<{
  totalPhotos: number;
  totalSize: number;
  photosByAngle: Record<string, number>;
}> {
  try {
    const photos = await getAllPhotos();

    const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0);
    const photosByAngle = {
      front: photos.filter((p) => p.angle === 'front').length,
      side: photos.filter((p) => p.angle === 'side').length,
      back: photos.filter((p) => p.angle === 'back').length,
    };

    return {
      totalPhotos: photos.length,
      totalSize,
      photosByAngle,
    };
  } catch (error) {
    console.error('[PhotoVault] Error getting vault stats:', error);
    return {
      totalPhotos: 0,
      totalSize: 0,
      photosByAngle: { front: 0, side: 0, back: 0 },
    };
  }
}

/**
 * Limpa o cofre (deleta todas as fotos)
 */
export async function clearVault(): Promise<void> {
  try {
    const photos = await getAllPhotos();

    // Deletar todos os arquivos de foto
    for (const photo of photos) {
      const photoUri = getPhotoUri(photo);
      await FileSystem.deleteAsync(photoUri, { idempotent: true });
    }

    // Resetar metadados
    const initialMetadata: VaultMetadata = {
      photos: [],
      lastUpdated: Date.now(),
    };

    await FileSystem.writeAsStringAsync(
      METADATA_FILE,
      JSON.stringify(initialMetadata, null, 2)
    );
  } catch (error) {
    console.error('[PhotoVault] Error clearing vault:', error);
    throw error;
  }
}
