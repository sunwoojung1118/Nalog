import { Tabs, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { NalogWriteModal } from '@/components/NalogWriteModal';
import { TabBar } from '@/components/TabBar';
import { colors } from '@/constants/theme';

type TabKey = 'index' | 'community' | 'profile';

function pathToTab(pathname: string): TabKey {
  if (pathname.includes('/community')) return 'community';
  if (pathname.includes('/profile')) return 'profile';
  return 'index';
}

export default function TabsLayout() {
  const pathname = usePathname();
  const activeTab = pathToTab(pathname);
  const [writeModalVisible, setWriteModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <TabBar
            activeTab={activeTab}
            onTabPress={(key) => {
              const nav = props.navigation;
              if (key === 'index') nav.navigate('index');
              else if (key === 'community') nav.navigate('community');
              else if (key === 'profile') nav.navigate('profile');
            }}
            onWritePress={() => setWriteModalVisible(true)}
          />
        )}
      >
        <Tabs.Screen name="index"     options={{ title: 'Home' }} />
        <Tabs.Screen name="community" options={{ title: 'Discover' }} />
        <Tabs.Screen name="profile"   options={{ title: 'Profile' }} />
        {/* Keep write & search as valid routes but hide from tab bar */}
        <Tabs.Screen name="write"     options={{ href: null }} />
        <Tabs.Screen name="search"    options={{ href: null }} />
      </Tabs>

      <NalogWriteModal
        visible={writeModalVisible}
        onClose={() => setWriteModalVisible(false)}
      />
    </>
  );
}

export { colors };
