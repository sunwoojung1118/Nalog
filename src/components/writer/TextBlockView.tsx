import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import {
  HeadingBlock,
  TextBlock,
  normalizeRuns,
  shiftRuns,
  splitByRuns,
  toggleRunOverSelection,
} from '@/lib/blocks';
import { useSelection } from './SelectionContext';

type Props = {
  block: TextBlock | HeadingBlock;
  onChange: (next: TextBlock | HeadingBlock) => void;
  onEnterAfter?: () => void;
  onBackspaceAtStart?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

// Authoring view for text/heading blocks. The TextInput owns the caret and
// keyboard handling; a transparent-text overlay above paints the
// light-gray background of any private runs so the author can see what is
// hidden from others. Heading blocks share the same overlay path but with
// different typography.
export function TextBlockView({
  block,
  onChange,
  onEnterAfter,
  onBackspaceAtStart,
  placeholder,
  autoFocus,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const wrapperRef = useRef<View>(null);
  const lastTextRef = useRef(block.text);
  const lastSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const { setSelection, clearIf, registerToggle } = useSelection();
  const blockId = block.id;
  const isText = block.type === 'text';
  const runs = isText ? (block as TextBlock).runs : undefined;

  useEffect(() => {
    lastTextRef.current = block.text;
  }, [block.text]);

  const handleChangeText = useCallback(
    (next: string) => {
      const prev = lastTextRef.current;
      lastTextRef.current = next;
      if (block.type === 'heading') {
        onChange({ ...(block as HeadingBlock), text: next });
        return;
      }
      const tb = block as TextBlock;
      const shifted = shiftRuns(tb.runs, prev, next);
      onChange({ ...tb, text: next, runs: shifted.length ? shifted : undefined });
    },
    [block, onChange],
  );

  const updateSelectionInContext = useCallback(
    (start: number, end: number) => {
      if (!isText || end <= start) {
        clearIf(blockId);
        return;
      }
      const node = wrapperRef.current;
      if (!node) return;
      node.measureInWindow((x, y, width) => {
        const norm = normalizeRuns(runs, lastTextRef.current.length);
        const hasRunInside = norm.some(
          (r) => Math.min(r.end, end) > Math.max(r.start, start),
        );
        setSelection({
          blockId,
          start,
          end,
          anchor: { top: y, left: x, width },
          hasRunInside,
        });
      });
    },
    [isText, clearIf, blockId, runs, setSelection],
  );

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const { start, end } = e.nativeEvent.selection;
      lastSelectionRef.current = { start, end };
      updateSelectionInContext(start, end);
    },
    [updateSelectionInContext],
  );

  // Register a per-block toggle handler that the toolbar invokes when the
  // author taps "Private". After toggling we clear the active selection so
  // the toolbar dismisses.
  useEffect(() => {
    if (!isText) return;
    registerToggle(() => {
      const { start, end } = lastSelectionRef.current;
      if (end <= start) return;
      const tb = block as TextBlock;
      const next = toggleRunOverSelection(tb.runs, start, end, tb.text.length);
      onChange({ ...tb, runs: next.length ? next : undefined });
      clearIf(blockId);
    });
  }, [isText, block, onChange, registerToggle, clearIf, blockId]);

  const segments = useMemo(() => {
    if (!isText) return null;
    const tb = block as TextBlock;
    return splitByRuns(tb.text, tb.runs);
  }, [isText, block]);

  const isHeading = block.type === 'heading';
  const inputStyle = [
    styles.body,
    styles.input,
    isHeading && styles.heading,
  ];
  const overlayStyle = [
    styles.body,
    styles.overlay,
    isHeading && styles.heading,
  ];

  return (
    <View ref={wrapperRef} style={styles.wrap} collapsable={false}>
      {isText && segments && segments.some((s) => s.private) ? (
        <Text
          style={overlayStyle}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {segments.map((seg, i) => (
            <Text
              key={`${blockId}-seg-${i}`}
              style={seg.private ? styles.privateSeg : styles.publicSeg}
            >
              {seg.text || ' '}
            </Text>
          ))}
        </Text>
      ) : null}
      <TextInput
        ref={inputRef}
        value={block.text}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        onBlur={() => clearIf(blockId)}
        multiline
        scrollEnabled={false}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={inputStyle}
        selectionColor={colors.accent}
        autoFocus={autoFocus}
        onKeyPress={(e) => {
          if (Platform.OS !== 'web') return;
          const native = e.nativeEvent as unknown as KeyboardEvent;
          if (native.key === 'Enter' && !native.shiftKey && onEnterAfter) {
            e.preventDefault?.();
            onEnterAfter();
            return;
          }
          if (
            native.key === 'Backspace' &&
            onBackspaceAtStart &&
            lastSelectionRef.current.start === 0 &&
            lastSelectionRef.current.end === 0
          ) {
            e.preventDefault?.();
            onBackspaceAtStart();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  body: {
    fontFamily: fonts.serif,
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
  },
  input: {
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 28,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    color: 'transparent',
  },
  heading: {
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700',
  },
  privateSeg: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: 'transparent',
  },
  publicSeg: {
    color: 'transparent',
  },
  privateInline: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: colors.text,
  },
  redactedHint: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 11,
    color: colors.textFaint,
    marginLeft: spacing.xs,
  },
});

// Read-only renderer (e.g. for past days or the reader view). For the author
// looking at their own past entry, private runs render with the same gray
// background. For non-followers the server already removed those characters
// before delivery, so `runs` won't be present on the wire.
export function TextBlockReader({ block }: { block: TextBlock | HeadingBlock }) {
  const isHeading = block.type === 'heading';
  const tb = block as TextBlock;
  const segments = splitByRuns(tb.text, isHeading ? undefined : tb.runs);
  return (
    <Text style={[styles.body, isHeading && styles.heading]}>
      {segments.map((seg, i) => (
        <Text
          key={`${block.id}-seg-${i}`}
          style={seg.private ? styles.privateInline : null}
        >
          {seg.text}
        </Text>
      ))}
      {tb.redacted ? (
        <Text style={styles.redactedHint}>{'  (hidden by author)'}</Text>
      ) : null}
    </Text>
  );
}

