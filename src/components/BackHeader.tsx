import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Txt } from './Txt';

export function BackHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </Pressable>
      <Txt w="extrabold" style={styles.title}>{title}</Txt>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 12,
  },
  title: { flex: 1, fontSize: 24, letterSpacing: -0.3 },
});
