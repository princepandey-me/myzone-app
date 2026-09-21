import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, font, FontWeightName } from '../theme';

/** Text with the app font. React Native needs a separate font file per weight, so pick it with `w`. */
export function Txt({ w = 'regular', style, ...rest }: TextProps & { w?: FontWeightName }) {
  return <Text {...rest} style={[{ fontFamily: font[w], color: colors.ink }, style]} />;
}
