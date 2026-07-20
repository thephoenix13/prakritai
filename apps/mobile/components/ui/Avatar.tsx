import React from 'react';
import { View, Text } from 'react-native';

const PALETTE = ['#CCFBF1', '#FEF3C7', '#FCE7F3', '#E0E7FF', '#FEE2E2', '#F0FDF4'];
const TEXT_PALETTE = ['#00725E', '#8a5e0a', '#be185d', '#3730a3', '#b91c1c', '#166534'];

function colorIndex(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % PALETTE.length;
}

interface Props {
  name: string;
  size?: number;
  fontSize?: number;
  bg?: string;
  textColor?: string;
}

export function Avatar({ name, size = 44, fontSize, bg, textColor }: Props) {
  const idx = colorIndex(name);
  const bgColor = bg ?? PALETTE[idx];
  const fgColor = textColor ?? TEXT_PALETTE[idx];
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const fs = fontSize ?? Math.round(size * 0.38);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: fs, color: fgColor }}>
        {initials}
      </Text>
    </View>
  );
}
