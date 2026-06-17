import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { WriterHeader } from '@/components/writer/WriterHeader';

type Props = {
  title: string;
  body: string;
  onChangeTitle: (v: string) => void;
  onChangeBody: (v: string) => void;
};

export function LogComposer({ title, body, onChangeTitle, onChangeBody }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <WriterHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Title"
          placeholderTextColor={colors.inkFaint}
          style={styles.title}
          selectionColor={colors.amber}
        />
        <View style={styles.divider} />
        <TextInput
          value={body}
          onChangeText={onChangeBody}
          multiline
          scrollEnabled={false}
          placeholder="Write a Log — anything, anytime. No week, no schedule."
          placeholderTextColor={colors.inkFaint}
          style={styles.body}
          selectionColor={colors.amber}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl * 2 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    fontWeight: '700',
    color: colors.ink,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 28,
    color: colors.ink,
    minHeight: 240,
    paddingTop: spacing.sm,
  },
});
