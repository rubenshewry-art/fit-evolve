/**
 * Exam Upload Utilities
 * 
 * Handles uploading exam images to S3 and preparing them for OCR analysis.
 */

import * as FileSystem from "expo-file-system/legacy";

export interface ExamUploadResult {
  uri: string;
  mimeType: string;
  size: number;
  fileName: string;
}

/**
 * Convert file URI to base64 for upload
 */
export async function uriToBase64(uri: string): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    console.error("[ExamUpload] Error converting URI to base64:", error);
    throw new Error("Failed to convert file to uploadable format");
  }
}

/**
 * Get MIME type from file URI
 */
function getMimeType(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    gif: "image/gif",
    webp: "image/webp",
  };

  return mimeTypes[extension || ""] || "application/octet-stream";
}

/**
 * Get file size in MB
 */
export async function getFileSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists || fileInfo.isDirectory) {
      throw new Error("File not found or is a directory");
    }
    return (fileInfo.size || 0) / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error("[ExamUpload] Error getting file size:", error);
    return 0;
  }
}

/**
 * Validate exam file
 */
export async function validateExamFile(uri: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    // Check file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists || fileInfo.isDirectory) {
      return { valid: false, error: "Arquivo não encontrado" };
    }

    // Check file size (max 10MB)
    const sizeMB = (fileInfo.size || 0) / (1024 * 1024);
    if (sizeMB > 10) {
      return {
        valid: false,
        error: `Arquivo muito grande (${sizeMB.toFixed(1)}MB). Máximo: 10MB`,
      };
    }

    // Check file type
    const mimeType = getMimeType(uri);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `Tipo de arquivo não suportado: ${mimeType}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("[ExamUpload] Error validating exam file:", error);
    return {
      valid: false,
      error: "Erro ao validar arquivo",
    };
  }
}

/**
 * Get file name from URI
 */
export function getFileName(uri: string): string {
  const parts = uri.split("/");
  return parts[parts.length - 1] || "exam";
}

/**
 * Generate unique file name for upload
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  return `exam_${timestamp}_${random}.${extension}`;
}

/**
 * Get exam type from file name or extension
 */
export function guessExamType(fileName: string): string {
  const nameLower = fileName.toLowerCase();

  if (
    nameLower.includes("blood") ||
    nameLower.includes("hemograma") ||
    nameLower.includes("cbc")
  ) {
    return "blood_test";
  }

  if (
    nameLower.includes("metabolic") ||
    nameLower.includes("metabólico") ||
    nameLower.includes("comp")
  ) {
    return "metabolic_panel";
  }

  if (
    nameLower.includes("lipid") ||
    nameLower.includes("lipídico") ||
    nameLower.includes("colesterol")
  ) {
    return "lipid_panel";
  }

  if (
    nameLower.includes("hormone") ||
    nameLower.includes("hormonal") ||
    nameLower.includes("testosterona")
  ) {
    return "hormone_panel";
  }

  if (
    nameLower.includes("thyroid") ||
    nameLower.includes("tireóide") ||
    nameLower.includes("tsh")
  ) {
    return "thyroid";
  }

  return "other";
}

/**
 * Format exam type for display
 */
export function formatExamType(examType: string): string {
  const labels: Record<string, string> = {
    blood_test: "Hemograma",
    metabolic_panel: "Painel Metabólico",
    lipid_panel: "Painel Lipídico",
    hormone_panel: "Painel Hormonal",
    thyroid: "Tireoide",
    other: "Outro",
  };

  return labels[examType] || examType;
}
