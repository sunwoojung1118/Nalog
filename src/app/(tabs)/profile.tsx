import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { NalogCard } from '@/components/NalogCard';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { fetchFollowerCount, fetchFollowingCount } from '@/lib/followApi';
import { fetchUserPosts, PublishedWeek } from '@/lib/feedApi';
import { fetchProfile, initials, Profile, updateProfile } from '@/lib/profileApi';
import { DayIndex, getDayIndex, getISOWeek, getISOWeekYear } from '@/lib/date';
import { readAllDayBodies } from '@/lib/dayDraft';
import { readDraft } from '@/lib/draft';

function computeStreak(weeks: PublishedWeek[]): number {
  if (weeks.length === 0) return 0;
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = getISOWeekYear(now);

  const sorted = [...weeks].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.week_number - a.week_number;
  });

  let streak = 0;
  let expectedYear = currentYear;
  let expectedWeek = currentWeek;

  for (const w of sorted) {
    if (w.year === expectedYear && w.week_number === expectedWeek) {
      streak++;
      expectedWeek--;
      if (expectedWeek < 1) {
        expectedYear--;
        expectedWeek = 52;
      }
    } else {
      break;
    }
  }
  return streak;
}

// Gradient per user (cycle through cover gradients)
const COVER_GRADIENT = colors.coverGradients[0];

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weeks, setWeeks] = useState<PublishedWeek[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [thisWeekTitle, setThisWeekTitle] = useState('');
  const [thisWeekBodies, setThisWeekBodies] = useState<Record<DayIndex, string>>(
    {} as Record<DayIndex, string>,
  );

  const { currentWeek, currentYear, todayDayIndex } = useMemo(() => {
    const d = new Date();
    return {
      currentWeek: getISOWeek(d),
      currentYear: getISOWeekYear(d),
      todayDayIndex: getDayIndex(d),
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;
    fetchProfile(uid).then(setProfile);
    fetchUserPosts(uid).then(setWeeks);
    fetchFollowerCount(uid).then(setFollowerCount);
    fetchFollowingCount(uid).then(setFollowingCount);
    // Load this week's draft data
    readDraft(currentYear, currentWeek).then((d) => setThisWeekTitle(d.title));
    readAllDayBodies(currentWeek).then(setThisWeekBodies);
  }, [session, currentWeek, currentYear]);

  const nameRef = useRef('');
  const bioRef = useRef('');

  const handleNameChange = useCallback((v: string) => {
    nameRef.current = v;
    setProfile((p) => (p ? { ...p, display_name: v } : p));
  }, []);

  const handleBioChange = useCallback((v: string) => {
    bioRef.current = v;
    setProfile((p) => (p ? { ...p, bio: v } : p));
  }, []);

  const handleBlur = useCallback(async () => {
    if (!session || !profile) return;
    await updateProfile(session.user.id, profile.display_name, profile.bio);
  }, [session, profile]);

  const name = profile?.display_name ?? '';
  const bio = profile?.bio ?? '';
  const streak = useMemo(() => computeStreak(weeks), [weeks]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero cover */}
      <LinearGradient
        colors={[COVER_GRADIENT[0], COVER_GRADIENT[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cover, { paddingTop: insets.top }]}
      >
        {/* Decorative dots */}
        <View style={styles.coverDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.coverDot, i === 0 && styles.coverDotActive]} />
          ))}
        </View>
      </LinearGradient>

      {/* Avatar overlapping cover */}
      <View style={styles.avatarWrap}>
        <Avatar
          initials={initials(name)}
          size={80}
          borderColor="#FFFFFF"
        />
      </View>

      {/* Profile info */}
      <View style={styles.profileInfo}>
        <TextInput
          value={name}
          onChangeText={handleNameChange}
          onBlur={handleBlur}
          placeholder="Your name"
          placeholderTextColor={colors.textFaint}
          style={styles.nameInput}
          selectionColor={colors.accent}
          textAlign="center"
        />
        <TextInput
          value={bio}
          onChangeText={handleBioChange}
          onBlur={handleBlur}
          placeholder="A line about you"
          placeholderTextColor={colors.textFaint}
          style={styles.bioInput}
          selectionColor={colors.accent}
          multiline
          textAlign="center"
        />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>🔥 {streak}</Text>
          <Text style={styles.statLabel}>streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{weeks.length}</Text>
          <Text style={styles.statLabel}>published</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{followerCount}</Text>
          <Text style={styles.statLabel}>followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{followingCount}</Text>
          <Text style={styles.statLabel}>following</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/settings')} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Settings</Text>
        </Pressable>
        <Pressable onPress={signOut} style={[styles.actionBtn, styles.actionBtnOutline]}>
          <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>Sign out</Text>
        </Pressable>
      </View>

      {/* This Week preview card */}
      <ThisWeekCard
        week={currentWeek}
        year={currentYear}
        title={thisWeekTitle}
        dayBodies={thisWeekBodies}
        todayDayIndex={todayDayIndex}
      />

      {/* Journals section */}
      <View style={styles.journalsSection}>
        <Text style={styles.sectionTitle}>Your Journals</Text>
        {weeks.length === 0 ? (
          <Text style={styles.emptyText}>
            Nothing published yet. Tap the ✦ button to start writing.
          </Text>
        ) : (
          <View style={styles.journalsList}>
            {weeks.map((item) => (
              <NalogCard
                key={`${item.year}-${item.week_number}`}
                userId={session?.user.id ?? ''}
                displayName={name}
                weekNumber={item.week_number}
                year={item.year}
                title={item.title}
                body={item.body}
                publishedAt={item.published_at}
                onPress={() =>
                  router.push({
                    pathname: '/n/[id]',
                    params: {
                      id: `${item.user_id}-${item.year}-${item.week_number}`,
                      userId: item.user_id,
                      year: item.year,
                      week: item.week_number,
                    },
                  })
                }
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const DAY_INDICES: DayIndex[] = [1, 2, 3, 4, 5, 6, 7];
const DAY_SHORT: Record<DayIndex, string> = {
  1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun',
};

function ThisWeekCard({
  week,
  year,
  title,
  dayBodies,
  todayDayIndex,
}: {
  week: number;
  year: number;
  title: string;
  dayBodies: Record<DayIndex, string>;
  todayDayIndex: DayIndex;
}) {
  const daysToShow = DAY_INDICES.filter((d) => d <= todayDayIndex);

  return (
    <View style={twStyles.container}>
      <View style={twStyles.cardHeader}>
        <View style={twStyles.draftBadge}>
          <Text style={twStyles.draftBadgeText}>DRAFT</Text>
        </View>
        <Text style={twStyles.weekLabel}>w{week} · {year}</Text>
      </View>

      {title ? (
        <Text style={twStyles.title} numberOfLines={1}>{title}</Text>
      ) : (
        <Text style={twStyles.titleEmpty}>No title yet</Text>
      )}

      <View style={twStyles.divider} />

      {daysToShow.map((day) => {
        const body = dayBodies[day] ?? '';
        const hasContent = body.length > 0;
        const preview = hasContent ? body.slice(0, 60).trimEnd() + (body.length > 60 ? '…' : '') : null;
        return (
          <View key={day} style={twStyles.dayRow}>
            <View style={[twStyles.dayDot, hasContent && twStyles.dayDotFilled]} />
            <Text style={twStyles.dayName}>{DAY_SHORT[day]}</Text>
            {preview ? (
              <Text style={twStyles.dayPreview} numberOfLines={1}>{preview}</Text>
            ) : (
              <Text style={twStyles.dayEmpty}>
                {day === todayDayIndex ? "Today's entry…" : '(no entry)'}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const twStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.tile,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    backgroundColor: colors.bgDeep,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  draftBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  draftBadgeText: {
    fontFamily: fonts.rounded,
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0,
  },
  weekLabel: {
    fontFamily: fonts.rounded,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textFaint,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  titleEmpty: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textFaint,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 3,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  dayDotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayName: {
    fontFamily: fonts.rounded,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
    width: 32,
  },
  dayPreview: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  dayEmpty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textFaint,
    flex: 1,
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {},
  cover: {
    height: 220,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  coverDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  coverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  coverDotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginTop: -40,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  nameInput: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 2,
    minWidth: 120,
    textAlign: 'center',
  },
  bioInput: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textSoft,
    paddingVertical: 2,
    maxWidth: 300,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.tile,
    backgroundColor: colors.bgDeep,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.rounded,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.rounded,
    fontSize: 11,
    color: colors.textFaint,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.bgDeep,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontFamily: fonts.rounded,
    fontSize: 14,
    color: colors.textSoft,
    fontWeight: '600',
  },
  actionBtnOutlineText: {
    color: colors.textFaint,
  },
  journalsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  journalsList: {
    gap: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: spacing.lg,
  },
});
