import { Icon } from './Icon';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';
import { getDayIndex, getISOWeek, getISOWeekYear } from '@/lib/date';
import { readDaySubtitle, saveDaySubtitle } from '@/lib/dayDraft';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useWeekDraft } from '@/hooks/useWeekDraft';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const OPEN_Y = 0;
const CLOSED_Y = SCREEN_HEIGHT;
const PREVIEW_H = Math.round(SCREEN_HEIGHT * 0.5);

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NalogWriteModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { week, year, todayIndex } = useMemo(() => {
    const d = new Date();
    return { week: getISOWeek(d), year: getISOWeekYear(d), todayIndex: getDayIndex(d) };
  }, []);

  const { title, setTitle, body, setBody } = useWeekDraft(year, week);
  const [todaySubtitle, setTodaySubtitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  // Mirror body in a ref so append-callbacks don't recapture it on every keystroke
  const bodyRef = useRef(body);
  useEffect(() => { bodyRef.current = body; }, [body]);

  // Reanimated values
  const translateY = useSharedValue(CLOSED_Y);
  const previewH = useSharedValue(0);
  const previewOpen = useRef<boolean>(false);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [debouncedSaveSubtitle, cancelSubtitleSave] = useDebouncedCallback(
    (text: string) => saveDaySubtitle(week, todayIndex, text),
    800,
  );

  useEffect(() => {
    if (visible) {
      readDaySubtitle(week, todayIndex).then(setTodaySubtitle);
      translateY.value = withSpring(OPEN_Y, { damping: 24, stiffness: 200, mass: 0.8 });
    } else {
      translateY.value = withSpring(CLOSED_Y, { damping: 28, stiffness: 300 });
      previewH.value = withSpring(0, { damping: 20, stiffness: 300 });
      previewOpen.current = false;
      setPreviewVisible(false);
    }
  }, [visible, week, todayIndex, translateY, previewH]);

  const handleClose = useCallback(() => {
    cancelSubtitleSave();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    previewH.value = withSpring(0, { damping: 20, stiffness: 300 });
    previewOpen.current = false;
    setPreviewVisible(false);
    translateY.value = withSpring(CLOSED_Y, { damping: 28, stiffness: 300 });
    onClose();
  }, [onClose, translateY, previewH, cancelSubtitleSave]);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(handleClose, 200);
  }, [handleClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleSubtitleChange = useCallback(
    (text: string) => {
      setTodaySubtitle(text);
      debouncedSaveSubtitle(text);
    },
    [debouncedSaveSubtitle],
  );

  const handleTogglePreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !previewOpen.current;
    previewOpen.current = next;
    setPreviewVisible(next);
    if (next) {
      previewH.value = withSpring(PREVIEW_H, { damping: 18, stiffness: 250 });
    } else {
      previewH.value = withSpring(0, { damping: 20, stiffness: 300 });
    }
  }, [previewH]);

  // Stable callbacks — read bodyRef.current so they don't recapture body state
  const handleTableInsert = useCallback(() => {
    const table = '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
    setBody(bodyRef.current + table);
  }, [setBody]);

  const handlePhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setBody(bodyRef.current + `\n![photo](${result.assets[0].uri})\n`);
    }
  }, [setBody]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withSpring(CLOSED_Y, { damping: 28, stiffness: 300 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(OPEN_Y, { damping: 24, stiffness: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const previewStyle = useAnimatedStyle(() => ({
    height: previewH.value,
    overflow: 'hidden',
  }));

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={[styles.sheetInner, { paddingTop: insets.top }]}>

            {/* Drag handle */}
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            {/* Header — week title + Save */}
            <View style={styles.header}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Week title"
                placeholderTextColor={colors.textFaint}
                style={styles.headerTitleInput}
                selectionColor={colors.accent}
                returnKeyType="done"
              />
              <Pressable onPress={handleSave} accessibilityLabel="Save draft">
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>

            {/* Scrollable editor */}
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + 80 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces
              scrollEventThrottle={16}
            >
              {/* Today's subtitle */}
              <TextInput
                value={todaySubtitle}
                onChangeText={handleSubtitleChange}
                placeholder="Title for today"
                placeholderTextColor={colors.textFaint}
                style={styles.titleInput}
                selectionColor={colors.accent}
                returnKeyType="next"
                multiline={false}
              />

              {/* Single continuous body */}
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Write your week here…"
                placeholderTextColor={colors.textFaint}
                style={styles.bodyInput}
                selectionColor={colors.accent}
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Toolbar — icon pill (left) + preview toggle (right) */}
            <View
              style={[
                styles.toolbar,
                { paddingBottom: Math.max(insets.bottom, spacing.sm) },
              ]}
            >
              <View style={styles.toolbarIconPill}>
                <Pressable onPress={handlePhoto} style={styles.iconBtn} accessibilityLabel="Add photo">
                  <Icon name="photo" size={20} color={colors.text} />
                </Pressable>
                <Pressable onPress={handleTableInsert} style={styles.iconBtn} accessibilityLabel="Add table">
                  <Icon name="tablecells" size={20} color={colors.text} />
                </Pressable>
              </View>
              <Pressable onPress={handleTogglePreview} style={styles.iconBtn} accessibilityLabel="Toggle preview">
                <Icon name="chevron.up" size={18} color={colors.textSoft} />
              </Pressable>
            </View>

            {/* Preview panel — slides up from bottom */}
            <Animated.View style={[styles.previewPanel, previewStyle]}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>{"How it'll look"}</Text>
                <Pressable onPress={handleTogglePreview} accessibilityLabel="Close preview">
                  <Icon name="chevron.down" size={18} color={colors.textSoft} />
                </Pressable>
              </View>
              <ScrollView
                style={styles.previewScroll}
                contentContainerStyle={styles.previewScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.previewTitle}>{title || 'Untitled week'}</Text>
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder="Write your week here…"
                  placeholderTextColor={colors.textFaint}
                  style={styles.previewBody}
                  selectionColor={colors.accent}
                  editable={previewVisible}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                />
              </ScrollView>
            </Animated.View>

          </View>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg,
  },
  sheetInner: {
    flex: 1,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.handle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitleInput: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.md,
  },
  saveText: {
    fontFamily: fonts.rounded,
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleInput: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  bodyInput: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    lineHeight: 28,
    paddingVertical: spacing.sm,
    minHeight: 240,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.bg,
  },
  toolbarIconPill: {
    flexDirection: 'row',
    backgroundColor: colors.bgDeep,
    borderRadius: 16,
    padding: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPanel: {
    backgroundColor: colors.bgDeep,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  previewLabel: {
    fontFamily: fonts.rounded,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSoft,
    letterSpacing: 0,
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  previewBody: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
    paddingVertical: 0,
  },
});
