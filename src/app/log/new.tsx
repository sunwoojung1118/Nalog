import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';
import { LogComposer } from '@/components/log/LogComposer';
import { createLog, profileInitials, useMyProfile } from '@/social/data/social-store';

export default function NewLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useMyProfile();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [publishing, setPublishing] = useState(false);

  const hasContent = title.trim().length > 0 || body.trim().length > 0;

  const onPublish = async () => {
    if (publishing) return;
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle && !trimmedBody) {
      router.back();
      return;
    }
    setPublishing(true);
    const name = profile.name?.trim() || 'You';
    await createLog(trimmedTitle, trimmedBody, {
      id: 'me',
      name,
      initials: profileInitials(name),
    });
    router.back();
  };

  const onCancel = () => {
    if (!hasContent) {
      router.back();
      return;
    }
    Alert.alert('Discard this Log?', 'Your draft will not be saved.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.heading}>New Log</Text>
        <Pressable onPress={onPublish} hitSlop={12} disabled={publishing}>
          <Text style={[styles.publish, publishing && styles.publishDisabled]}>Publish</Text>
        </Pressable>
      </View>
      <LogComposer
        title={title}
        body={body}
        onChangeTitle={setTitle}
        onChangeBody={setBody}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  cancel: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.inkSoft,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  publish: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: '700',
    color: colors.amber,
  },
  publishDisabled: {
    color: colors.inkFaint,
  },
});
