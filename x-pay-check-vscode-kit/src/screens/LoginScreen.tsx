import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { XButton } from '../components/XButton';
import { XInput } from '../components/XInput';

interface LoginScreenProps {
  onLogin: (email: string) => void;
  onSocialLogin: (provider: 'google' | 'apple') => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSocialLogin, onBack }) => {
  const { colors, typography, spacing } = useTheme();
  const [email, setEmail] = useState('');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.logoX, { color: colors.primary }]}>X</Text>
      <Text style={[typography.h2, { color: colors.text, marginTop: spacing.lg }]}>
        Accedi a{' '}
        <Text style={{ color: colors.primary }}>X-PAY CHECK</Text>
      </Text>

      <Text
        style={[
          typography.body,
          { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl },
        ]}
      >
        Ti serve solo per licenze, aggiornamenti CCNL e sincronizzazione sicura.
      </Text>

      {/* Social Buttons */}
      <XButton
        title="Continua con Google"
        variant="secondary"
        onPress={() => onSocialLogin('google')}
        size="lg"
        icon={<Text style={{ fontSize: 16 }}>🔍</Text>}
      />
      <XButton
        title="Continua con Apple"
        variant="secondary"
        onPress={() => onSocialLogin('apple')}
        size="lg"
        style={{ marginTop: spacing.md }}
        icon={<Text style={{ fontSize: 16 }}>🍎</Text>}
      />

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text style={[typography.bodySmall, { color: colors.textTertiary, marginHorizontal: 12 }]}>
          oppure
        </Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>

      <XInput
        label="Email"
        placeholder="nome@esempio.it"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        icon={<Text style={{ fontSize: 16, color: colors.textSecondary }}>✉</Text>}
      />

      <XButton
        title="Accedi con email"
        onPress={() => onLogin(email)}
        size="lg"
        style={{ marginTop: spacing.lg }}
      />

      <Text
        style={[
          typography.bodySmall,
          { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
        ]}
      >
        I tuoi cedolini non vengono mai caricati online.
      </Text>

      <XButton
        title="← Indietro"
        variant="ghost"
        onPress={onBack}
        size="sm"
        style={{ marginTop: spacing.xl, alignSelf: 'center' }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoX: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
  },
});
