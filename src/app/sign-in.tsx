import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientBackground } from '@/components/AmbientBackground';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result =
      mode === 'sign-in'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, displayName.trim());
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace('/');
  };

  return (
    <View style={styles.safe}>
      <AmbientBackground />
      <SafeAreaView style={styles.safeInner}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Nalog</Text>
            <Text style={styles.subtitle}>
              {mode === 'sign-in' ? 'Welcome back.' : 'Start your weekly journal.'}
            </Text>

            <View style={styles.cardWrap}>
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, styles.cardOverlay]} />
              <View style={styles.card}>
                {mode === 'sign-up' ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Display name"
                    placeholderTextColor={colors.textFaint}
                    autoCapitalize="words"
                    value={displayName}
                    onChangeText={setDisplayName}
                    selectionColor={colors.accent}
                  />
                ) : null}

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  selectionColor={colors.accent}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.textFaint}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  selectionColor={colors.accent}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  onPress={submit}
                  disabled={busy}
                  style={[styles.primaryWrap, busy && styles.primaryBusy]}
                >
                  <LinearGradient
                    colors={[colors.accent, colors.accentDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primary}
                  >
                    {busy ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryText}>
                        {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() => {
                setError(null);
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              }}
            >
              <Text style={styles.switch}>
                {mode === 'sign-in'
                  ? 'New here? Create an account'
                  : 'Already have an account? Sign in'}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  safeInner: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 48,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cardWrap: {
    borderRadius: radius.sheet,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardOverlay: {
    backgroundColor: 'rgba(10,10,15,0.50)',
    borderRadius: radius.sheet,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.glassDeep,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.serif,
  },
  primaryWrap: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  primary: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBusy: { opacity: 0.6 },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.serif,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switch: {
    textAlign: 'center',
    color: colors.textSoft,
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  error: {
    color: 'rgba(239,68,68,0.90)',
    textAlign: 'center',
    fontFamily: fonts.serif,
    fontSize: 13,
  },
});
