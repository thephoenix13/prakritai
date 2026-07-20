import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Grade = 'A' | 'B' | 'C' | 'D';

const config: Record<Grade, { bg: string; text: string; border: string }> = {
  A: { bg: '#CCFBF1', text: '#00725E', border: '#00B894' },
  B: { bg: '#FEF3C7', text: '#8a5e0a', border: '#D4A017' },
  C: { bg: '#FCE7F3', text: '#be185d', border: '#F472B6' },
  D: { bg: '#FEE2E2', text: '#b91c1c', border: '#EF4444' },
};

interface Props {
  grade: Grade;
  size?: number;
  fontSize?: number;
}

export function GradeBadge({ grade, size = 30, fontSize = 13 }: Props) {
  const { bg, text, border } = config[grade];
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: border,
        },
      ]}
    >
      <Text style={[styles.label, { color: text, fontSize }]}>{grade}</Text>
    </View>
  );
}

export function gradeFromScore(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'SpaceGrotesk-Bold',
  },
});
