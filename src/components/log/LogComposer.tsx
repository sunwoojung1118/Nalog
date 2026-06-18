import { Image } from 'expo-image';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { WriterHeader } from '@/components/writer/WriterHeader';

type Props = {
  title: string;
  body: string;
  caption: string;
  imageUrl: string | null;
  imageBusy: boolean;
  onChangeTitle: (v: string) => void;
  onChangeBody: (v: string) => void;
  onChangeCaption: (v: string) => void;
  onPickImage: () => void;
  onClearImage: () => void;
};

export function LogComposer({
  title,
  body,
  caption,
  imageUrl,
  imageBusy,
  onChangeTitle,
  onChangeBody,
  onChangeCaption,
  onPickImage,
  onClearImage,
}: Props) {
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
          placeholderTextColor={colors.textFaint}
          style={styles.title}
          selectionColor={colors.accent}
        />
        <View style={styles.divider} />
        <TextInput
          value={body}
          onChangeText={onChangeBody}
          multiline
          scrollEnabled={false}
          placeholder="Write a Log — anything, anytime. No week, no schedule."
          placeholderTextColor={colors.textFaint}
          style={styles.body}
          selectionColor={colors.accent}
          textAlignVertical="top"
        />

        <View style={styles.media}>
          {imageUrl ? (
            <View>
              <Image source={imageUrl} style={styles.image} contentFit="cover" transition={120} />
              {imageBusy ? (
                <View style={styles.imageBusy}>
                  <ActivityIndicator color={colors.paper} />
                </View>
              ) : null}
              <View style={styles.mediaActions}>
                <Pressable onPress={onPickImage} hitSlop={8} disabled={imageBusy}>
                  <Text style={styles.mediaLink}>Replace</Text>
                </Pressable>
                <Text style={styles.mediaSep}>·</Text>
                <Pressable onPress={onClearImage} hitSlop={8} disabled={imageBusy}>
                  <Text style={styles.mediaLink}>Remove</Text>
                </Pressable>
              </View>
              <TextInput
                value={caption}
                onChangeText={onChangeCaption}
                placeholder="Caption"
                placeholderTextColor={colors.textFaint}
                style={styles.caption}
                selectionColor={colors.accent}
              />
            </View>
          ) : (
            <Pressable onPress={onPickImage} hitSlop={8} disabled={imageBusy} style={styles.addBtn}>
              {imageBusy ? (
                <ActivityIndicator color={colors.inkSoft} />
              ) : (
                <Text style={styles.addBtnText}>＋ Add photo</Text>
              )}
            </Pressable>
          )}
        </View>
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
    color: colors.text,
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
    color: colors.text,
    minHeight: 240,
    paddingTop: spacing.sm,
  },
  media: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 240,
    borderRadius: radius.tile,
    backgroundColor: colors.paperDeep,
  },
  imageBusy: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44,44,44,0.25)',
    borderRadius: radius.tile,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  mediaSep: {
    color: colors.inkFaint,
  },
  mediaLink: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.inkSoft,
  },
  addBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassDeep,
  },
  addBtnText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.textSoft,
  },
  caption: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.inkSoft,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
});
