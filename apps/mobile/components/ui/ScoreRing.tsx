import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { gradeFromScore } from './GradeBadge';

const ringColor: Record<string, string> = {
  A: '#00B894',
  B: '#D4A017',
  C: '#F472B6',
  D: '#EF4444',
};

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  showScore?: boolean;
  showGrade?: boolean;
}

export function ScoreRing({
  score,
  size = 100,
  strokeWidth = 8,
  showScore = true,
  showGrade = false,
}: Props) {
  const grade = gradeFromScore(score);
  const color = ringColor[grade];
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#E4E4E7"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </Svg>
      {showScore && (
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.score, { color, fontSize: size * 0.22 }]}>{score}</Text>
          {showGrade && (
            <Text style={[styles.grade, { color, fontSize: size * 0.12 }]}>{grade}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  score: {
    fontFamily: 'SpaceGrotesk-Bold',
    lineHeight: undefined,
  },
  grade: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    marginTop: -2,
  },
});
