import React, { useCallback, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import {
  Block,
  HeadingBlock,
  ImageBlock,
  MAX_IMAGE_BLOCKS_PER_DAY,
  TextBlock,
  countImageBlocks,
  emptyTextBlock,
  newHeadingBlock,
  newImageBlock,
} from '@/lib/blocks';
import { pickPostImage, uploadPostImage } from '@/lib/postImages';
import { ImageBlockView } from './ImageBlockView';
import { TextBlockReader, TextBlockView } from './TextBlockView';

type Props = {
  blocks: Block[];
  onChange: (next: Block[]) => void;
  readOnly?: boolean;
  placeholder?: string;
  allocateImagePath?: () => string;
};

// Continuous Google-Docs-style editing surface for a day. Renders text and
// image blocks in order, with a small "insert" row at the bottom.
export function DocEditor({
  blocks,
  onChange,
  readOnly = false,
  placeholder,
  allocateImagePath,
}: Props) {
  const effective = useMemo(
    () => (blocks.length > 0 ? blocks : readOnly ? [] : [emptyTextBlock()]),
    [blocks, readOnly],
  );

  const replaceAt = useCallback(
    (idx: number, next: Block) => {
      const out = effective.slice();
      out[idx] = next;
      onChange(out);
    },
    [effective, onChange],
  );

  const removeAt = useCallback(
    (idx: number) => {
      const out = effective.filter((_, i) => i !== idx);
      // Keep at least one editable text block when authoring.
      if (out.length === 0 && !readOnly) {
        onChange([]);
        return;
      }
      onChange(out);
    },
    [effective, onChange, readOnly],
  );

  const insertAfter = useCallback(
    (idx: number, b: Block) => {
      const out = [...effective.slice(0, idx + 1), b, ...effective.slice(idx + 1)];
      onChange(out);
    },
    [effective, onChange],
  );

  const insertEnd = useCallback(
    (b: Block) => {
      onChange([...effective, b]);
    },
    [effective, onChange],
  );

  const insertImage = useCallback(async () => {
    if (!allocateImagePath) return;
    if (countImageBlocks(effective) >= MAX_IMAGE_BLOCKS_PER_DAY) {
      Alert.alert('Photo limit', `Up to ${MAX_IMAGE_BLOCKS_PER_DAY} photos per day.`);
      return;
    }
    try {
      const picked = await pickPostImage();
      if (!picked) return;
      const path = allocateImagePath();
      await uploadPostImage(path, picked.uri, picked.mimeType);
      insertEnd(newImageBlock(path));
    } catch (e) {
      Alert.alert('Could not add photo', e instanceof Error ? e.message : 'Try again.');
    }
  }, [allocateImagePath, effective, insertEnd]);

  if (readOnly) {
    if (effective.length === 0) return null;
    return (
      <View style={styles.column}>
        {effective.map((b) => (
          <View key={b.id} style={styles.readBlock}>
            {b.type === 'image' ? (
              <ImageBlockView block={b} readOnly />
            ) : (
              <TextBlockReader block={b} />
            )}
          </View>
        ))}
      </View>
    );
  }

  const imageCount = countImageBlocks(effective);
  const canAddImage = !!allocateImagePath && imageCount < MAX_IMAGE_BLOCKS_PER_DAY;

  return (
    <View style={styles.column}>
      {effective.map((b, i) => (
        <View key={b.id} style={styles.editBlock}>
          {b.type === 'image' ? (
            <ImageBlockView
              block={b}
              onChange={(next) => replaceAt(i, next as ImageBlock)}
              onRemove={() => removeAt(i)}
            />
          ) : (
            <TextBlockView
              block={b}
              onChange={(next) => replaceAt(i, next as TextBlock | HeadingBlock)}
              onEnterAfter={() => insertAfter(i, emptyTextBlock())}
              onBackspaceAtStart={
                effective.length > 1 && (b.type === 'text' || b.type === 'heading') && !b.text
                  ? () => removeAt(i)
                  : undefined
              }
              placeholder={i === 0 ? placeholder : undefined}
            />
          )}
        </View>
      ))}

      <View style={styles.insertRow}>
        <InsertPill
          label="+ paragraph"
          onPress={() => insertEnd(emptyTextBlock())}
        />
        <InsertPill
          label="+ heading"
          onPress={() => insertEnd(newHeadingBlock(''))}
        />
        {canAddImage ? (
          <InsertPill label={`+ photo (${imageCount}/${MAX_IMAGE_BLOCKS_PER_DAY})`} onPress={insertImage} />
        ) : allocateImagePath ? (
          <InsertPill label={`max ${MAX_IMAGE_BLOCKS_PER_DAY} photos`} onPress={() => {}} disabled />
        ) : null}
      </View>
    </View>
  );
}

function InsertPill({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={6}
      style={[styles.pill, disabled && styles.pillDisabled]}
    >
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  column: { gap: spacing.sm },
  editBlock: {},
  readBlock: {},
  insertRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassDeep,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
  },
});
