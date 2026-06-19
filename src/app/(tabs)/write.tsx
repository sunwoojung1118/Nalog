import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useWeekDraft } from '@/hooks/useWeekDraft';
import { useAuth } from '@/lib/auth';
import { getISOWeek, getISOWeekYear } from '@/lib/date';
import { publishWeek } from '@/lib/feedApi';

export default function WriteScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const week = getISOWeek(now);
  const year = getISOWeekYear(now);

  const { title, setTitle, body, setBody, saveState } = useWeekDraft(year, week);
  const [publishing, setPublishing] = useState(false);

  const saveLabel = saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : '';

  const handlePublish = async () => {
    if (!session) return;
    if (!title.trim() && !body.trim()) {
      Alert.alert('Nothing to publish', 'Write something first.');
      return;
    }
    setPublishing(true);
    try {
      await publishWeek(session.user.id, year, week, title.trim(), body.trim());
      Alert.alert('Published!', `Week ${week} is live.`);
    } catch {
      Alert.alert('Error', 'Could not publish. Try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace('/')} hitSlop={10} accessibilityRole="button">
          <Text style={styles.backText}>← Home</Text>
        </Pressable>
        <Text style={styles.saveIndicator}>{saveLabel}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 48}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>{`Week ${week} · ${year}`}</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="This week, in one line"
            placeholderTextColor={colors.textFaint}
            style={styles.titleInput}
            selectionColor={colors.accent}
            returnKeyType="next"
            multiline={false}
          />

          <View style={styles.divider} />

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write your week…"
            placeholderTextColor={colors.textFaint}
            style={styles.bodyInput}
            selectionColor={colors.accent}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Pressable
            onPress={handlePublish}
            disabled={publishing}
            style={[styles.publishBtn, publishing && styles.publishBtnBusy]}
            accessibilityRole="button"
          >
            {publishing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.publishText}>Publish week {week}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgSurface },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backText: {
    fontFamily: fonts.serif,
    fontSize: 13,
    color: colors.textFaint,
    fontWeight: '600',
  },
  saveIndicator: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  eyebrow: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  titleInput: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
    paddingVertical: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  bodyInput: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    lineHeight: 28,
    paddingVertical: 0,
    minHeight: 200,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bgSurface,
  },
  publishBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  publishBtnBusy: { opacity: 0.6 },
  publishText: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
