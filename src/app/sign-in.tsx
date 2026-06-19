import * as Haptics from 'expo-haptics';
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
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.container}>
            <Text style={styles.wordmark}>nalog</Text>
            <Text style={styles.subtitle}>
              {mode === 'sign-in' ? 'Welcome back.' : 'Start your weekly journal.'}
            </Text>

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
                style={[styles.cta, busy && styles.ctaBusy]}
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.ctaText}>
                    {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                  </Text>
                )}
              </Pressable>
            </View>

            <Pressable onPress={() => { setError(null); setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); }}>
              <Text style={styles.toggle}>
                {mode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    fontFamily: fonts.sans,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ctaBusy: { opacity: 0.6 },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.rounded,
    fontWeight: '700',
    letterSpacing: 0,
  },
  toggle: {
    textAlign: 'center',
    color: colors.textSoft,
    fontFamily: fonts.sans,
    marginTop: spacing.sm,
  },
  error: {
    color: 'rgba(239,68,68,0.90)',
    textAlign: 'center',
    fontFamily: fonts.sans,
    fontSize: 13,
  },
});
