import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { useBarFootprint } from '@/lib/useBarFootprint';
import { useSheetSnap } from '@/components/SheetStateContext';
import { TabBar, TabKey } from './TabBar';
import { HomeTab } from './tabs/HomeTab';
import { SearchTab } from './tabs/SearchTab';
import { CommunityTab } from './tabs/CommunityTab';
import { ProfileTab } from './tabs/ProfileTab';

export function SocialShell() {
  const insets = useSafeAreaInsets();
  const barFootprint = useBarFootprint();
  const { requestSnap } = useSheetSnap();
  const [active, setActive] = useState<TabKey>('home');

  // Tab bar sits flush above the sheet bar; tab content reserves space for both.
  const contentBottomPadding = barFootprint + 96;

  return (
    <View style={styles.root}>
      <View style={[styles.topInset, { height: insets.top }]} />
      <View style={styles.body}>
        {active === 'home' && <HomeTab contentBottomPadding={contentBottomPadding} />}
        {active === 'search' && <SearchTab contentBottomPadding={contentBottomPadding} />}
        {active === 'community' && <CommunityTab contentBottomPadding={contentBottomPadding} />}
        {active === 'profile' && <ProfileTab contentBottomPadding={contentBottomPadding} />}
      </View>
      <View style={[styles.tabBarWrap, { bottom: barFootprint }]}>
        <TabBar
          active={active}
          onChange={setActive}
          onNalog={() => requestSnap('full')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.community,
  },
  topInset: {
    backgroundColor: colors.community,
  },
  body: {
    flex: 1,
  },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
