import { StyleSheet, View } from 'react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { WeekWriter } from '@/components/WeekWriter';
import { WriterStateProvider } from '@/components/WriterStateProvider';
import { SocialShell } from '@/social/SocialShell';
import { colors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <WriterStateProvider>
      <View style={styles.root}>
        <BottomSheet shell={<SocialShell />}>
          <WeekWriter />
        </BottomSheet>
      </View>
    </WriterStateProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.community,
    overflow: 'hidden',
  },
});
