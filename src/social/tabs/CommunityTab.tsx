import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { NalogCard } from '@/social/components/NalogCard';
import {
  getCommunityPosts,
  useDiscoverCommunities,
  useMyCommunities,
} from '@/social/data/social-store';
import { Community } from '@/social/data/types';

type Props = {
  contentBottomPadding: number;
};

export function CommunityTab({ contentBottomPadding }: Props) {
  const my = useMyCommunities();
  const discover = useDiscoverCommunities(my.joined);
  const [open, setOpen] = useState<Community | null>(null);
  const [creating, setCreating] = useState(false);

  if (open) {
    const joined = my.joined.some((c) => c.id === open.id);
    return (
      <CommunityDetail
        community={open}
        joined={joined}
        onJoin={() => my.join(open.id)}
        onLeave={() => my.leave(open.id)}
        onBack={() => setOpen(null)}
        contentBottomPadding={contentBottomPadding}
      />
    );
  }

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Communities</Text>
            <Text style={styles.headline}>Quiet rooms with people like you.</Text>
          </View>
          <Pressable hitSlop={12} onPress={() => setCreating(true)}>
            <Text style={styles.action}>Create</Text>
          </Pressable>
        </View>

        <SectionTitle>Communities you{`'`}re in</SectionTitle>
        {my.joined.length === 0 ? (
          <Text style={styles.emptyLine}>None yet. Join one below or create your own.</Text>
        ) : (
          my.joined.map((c) => <CommunityRow key={c.id} community={c} onOpen={() => setOpen(c)} />)
        )}

        <SectionTitle>Discover</SectionTitle>
        {discover.map((c) => (
          <CommunityRow key={c.id} community={c} onOpen={() => setOpen(c)} />
        ))}
      </ScrollView>

      <CreateCommunityModal
        visible={creating}
        onClose={() => setCreating(false)}
        onCreate={async (name, tag) => {
          await my.create(name, tag);
          setCreating(false);
        }}
      />
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function CommunityRow({
  community,
  onOpen,
}: {
  community: Community;
  onOpen: () => void;
}) {
  return (
    <Pressable onPress={onOpen} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{community.name}</Text>
        <Text style={styles.rowBlurb} numberOfLines={1}>{community.blurb}</Text>
      </View>
      <Text style={styles.rowMeta}>{`#${community.tag}  ·  ${community.memberCount}`}</Text>
    </Pressable>
  );
}

function CommunityDetail({
  community,
  joined,
  onJoin,
  onLeave,
  onBack,
  contentBottomPadding,
}: {
  community: Community;
  joined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onBack: () => void;
  contentBottomPadding: number;
}) {
  const posts = getCommunityPosts(community.id);
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailHeader}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.detailName}>{community.name}</Text>
        <Text style={styles.detailMeta}>{`#${community.tag}  ·  ${community.memberCount} members`}</Text>
        <Text style={styles.detailBlurb}>{community.blurb}</Text>
        <Pressable
          onPress={joined ? onLeave : onJoin}
          style={[styles.cta, joined && styles.ctaJoined]}
        >
          <Text style={[styles.ctaLabel, joined && styles.ctaLabelJoined]}>
            {joined ? 'Leave' : 'Join'}
          </Text>
        </Pressable>
      </View>

      <SectionTitle>This week</SectionTitle>
      {posts.length === 0 ? (
        <Text style={styles.emptyLine}>Nothing shared here yet.</Text>
      ) : (
        posts.map((p) => <NalogCard key={p.id} entry={p} />)
      )}
    </ScrollView>
  );
}

function CreateCommunityModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, tag: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalScrim} onPress={onClose} />
      <View style={styles.modalCardWrap}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.modalCardOverlay]} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Start a community</Text>
          <Text style={styles.modalLabel}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. D3 college soccer"
            placeholderTextColor={colors.textFaint}
            style={styles.modalInput}
            selectionColor={colors.accent}
          />
          <Text style={styles.modalLabel}>Tag</Text>
          <TextInput
            value={tag}
            onChangeText={setTag}
            placeholder="e.g. soccer"
            placeholderTextColor={colors.textFaint}
            style={styles.modalInput}
            selectionColor={colors.accent}
            autoCapitalize="none"
          />
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await onCreate(name, tag);
                setName('');
                setTag('');
              }}
              style={styles.modalSubmit}
            >
              <Text style={styles.modalSubmitLabel}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.4,
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
  action: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.accent,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textFaint,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyLine: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.textFaint,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowName: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    fontWeight: '700',
  },
  rowBlurb: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSoft,
    marginTop: 2,
  },
  rowMeta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
  },
  detailHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  back: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: spacing.sm,
  },
  detailName: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.text,
    fontWeight: '700',
  },
  detailMeta: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.textFaint,
  },
  detailBlurb: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.textSoft,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  ctaJoined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  ctaLabel: {
    fontFamily: fonts.serif,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  ctaLabelJoined: {
    color: colors.textSoft,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  modalCardWrap: {
    overflow: 'hidden',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.glassBorder,
  },
  modalCardOverlay: {
    backgroundColor: 'rgba(10,10,15,0.55)',
  },
  modalCard: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  modalLabel: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 12,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: spacing.sm,
  },
  modalInput: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: colors.text,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
    paddingVertical: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  modalCancel: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.textSoft,
  },
  modalSubmit: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  modalSubmitLabel: {
    fontFamily: fonts.serif,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
