import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G } from 'react-native-svg';

import { colors } from '../../theme';

interface VennDiagramProps {
  /** Size of the diagram (width and height) */
  size?: number;
  /** Which step to highlight: 1 (top), 2 (bottom-right), 3 (bottom-left), 'center' (overlapping area) */
  step?: 1 | 2 | 3 | 'center';
}

/**
 * Venn diagram with 3 overlapping circles.
 * Matches the Figma design for idol onboarding screens with progress indication.
 */
export function VennDiagram({ size = 156, step }: VennDiagramProps) {
  // Circle radius - 26% of size provides good proportions for 3-circle overlap
  const radius = size * 0.26;
  const strokeWidth = 1;
  const padding = strokeWidth + 2;

  const totalWidth = size;
  const totalHeight = size * 0.9;

  const centerX = totalWidth / 2;
  const centerY = radius + padding;

  // Offset controls how far circles are from center (0.8 = 80% of radius for moderate overlap)
  const offset = radius * 0.8;

  // Position circles in equilateral triangle arrangement:
  // - 0.866 = cos(30°) = √3/2, horizontal offset for 60° spacing
  // - 1.5 = vertical offset ratio for equilateral triangle geometry
  const topCircle = { cx: centerX, cy: centerY };
  const bottomLeftCircle = { cx: centerX - offset * 0.866, cy: centerY + offset * 1.5 };
  const bottomRightCircle = { cx: centerX + offset * 0.866, cy: centerY + offset * 1.5 };

  const fillColor = colors.surfaceAlt;
  const strokeColor = colors.text;

  return (
    <View style={[styles.container, { width: totalWidth, height: totalHeight }]}>
      <Svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`}>
        <Defs>
          {/* Define clipping paths for the center intersection */}
          <ClipPath id="clip-top">
            <Circle cx={topCircle.cx} cy={topCircle.cy} r={radius} />
          </ClipPath>
          <ClipPath id="clip-bottom-left">
            <Circle cx={bottomLeftCircle.cx} cy={bottomLeftCircle.cy} r={radius} />
          </ClipPath>
          <ClipPath id="clip-bottom-right">
            <Circle cx={bottomRightCircle.cx} cy={bottomRightCircle.cy} r={radius} />
          </ClipPath>
        </Defs>

        {/* Filled circles based on step */}
        {step === 1 && <Circle cx={topCircle.cx} cy={topCircle.cy} r={radius} fill={fillColor} />}
        {step === 2 && (
          <Circle cx={bottomRightCircle.cx} cy={bottomRightCircle.cy} r={radius} fill={fillColor} />
        )}
        {step === 3 && (
          <Circle cx={bottomLeftCircle.cx} cy={bottomLeftCircle.cy} r={radius} fill={fillColor} />
        )}

        {/* Center intersection for confirmation screen */}
        {step === 'center' && (
          <>
            {/* Use nested clipping to get the intersection of all 3 circles */}
            <G clipPath="url(#clip-top)">
              <G clipPath="url(#clip-bottom-left)">
                <Circle
                  cx={bottomRightCircle.cx}
                  cy={bottomRightCircle.cy}
                  r={radius}
                  fill={fillColor}
                />
              </G>
            </G>
          </>
        )}

        {/* Circle outlines - always visible */}
        <Circle
          cx={topCircle.cx}
          cy={topCircle.cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={bottomLeftCircle.cx}
          cy={bottomLeftCircle.cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={bottomRightCircle.cx}
          cy={bottomRightCircle.cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
