import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface CameraOverlayProps {
  angle: 'front' | 'side' | 'back';
}

/**
 * Camera Overlay Component
 * 
 * Exibe guias visuais padronizadas para captura de fotos de evolução.
 * Mostra:
 * - Guia de posição (frente, lateral, costas)
 * - Área de enquadramento (safe zone)
 * - Instruções de posicionamento
 */
export function CameraOverlay({ angle }: CameraOverlayProps) {
  const colors = useColors();

  const angleLabels = {
    front: 'Frente',
    side: 'Lateral',
    back: 'Costas',
  };

  const angleInstructions = {
    front: 'Fique de frente para a câmera, em pé e relaxado',
    side: 'Fique de lado para a câmera, braços ao lado do corpo',
    back: 'Fique de costas para a câmera, braços ao lado do corpo',
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top instruction */}
      <View style={styles.topSection}>
        <Text style={[styles.angleLabel, { color: colors.foreground }]}>
          {angleLabels[angle]}
        </Text>
      </View>

      {/* Center guide frame */}
      <View style={styles.centerSection}>
        {/* Outer frame */}
        <View
          style={[
            styles.frameOuter,
            {
              borderColor: colors.primary,
            },
          ]}
        >
          {/* Corner markers */}
          <View
            style={[
              styles.corner,
              styles.topLeft,
              { borderTopColor: colors.primary, borderLeftColor: colors.primary },
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.topRight,
              { borderTopColor: colors.primary, borderRightColor: colors.primary },
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.bottomLeft,
              { borderBottomColor: colors.primary, borderLeftColor: colors.primary },
            ]}
          />
          <View
            style={[
              styles.corner,
              styles.bottomRight,
              { borderBottomColor: colors.primary, borderRightColor: colors.primary },
            ]}
          />
        </View>

        {/* Center dot */}
        <View
          style={[
            styles.centerDot,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      {/* Bottom instruction */}
      <View style={styles.bottomSection}>
        <Text style={[styles.instruction, { color: colors.foreground }]}>
          {angleInstructions[angle]}
        </Text>
      </View>

      {/* Dimmed areas (sides) */}
      <View
        style={[
          styles.dimmedArea,
          styles.leftDimmed,
          { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
        ]}
      />
      <View
        style={[
          styles.dimmedArea,
          styles.rightDimmed,
          { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  frameOuter: {
    width: '75%',
    aspectRatio: 0.6,
    borderWidth: 2,
    borderRadius: 12,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
  },
  topLeft: {
    top: -6,
    left: -6,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -6,
    right: -6,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -6,
    left: -6,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -6,
    right: -6,
    borderBottomRightRadius: 8,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -6,
    marginTop: -6,
  },
  angleLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  dimmedArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  leftDimmed: {
    left: 0,
    width: '12.5%',
  },
  rightDimmed: {
    right: 0,
    width: '12.5%',
  },
});
