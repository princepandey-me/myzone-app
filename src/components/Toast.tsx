import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Toast as ToastData } from '../state/AppContext';
import { Txt } from './Txt';

export function Toast({ toast, onDismiss, bottom }: { toast: ToastData | null; onDismiss: () => void; bottom: number }) {
  if (!toast) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View style={styles.toast}>
        <Txt w="medium" style={styles.text}>{toast.message}</Txt>
        {toast.actionLabel ? (
          <Pressable
            onPress={() => {
              if (toast.onAction) toast.onAction();
              onDismiss();
            }}
            hitSlop={10}
          >
            <Txt w="bold" style={styles.action}>{toast.actionLabel}</Txt>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: 480,
  },
  text: { color: '#FFFFFF', fontSize: 14, flexShrink: 1 },
  action: { color: '#FFD9A0', fontSize: 14, marginLeft: 16 },
});
