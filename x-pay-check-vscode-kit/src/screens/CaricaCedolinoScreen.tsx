import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { Header } from '../components/Header';
import { XCard } from '../components/XCard';
import { XButton } from '../components/XButton';

interface CaricaCedolinoScreenProps {
  onBack: () => void;
  onScattaFoto: () => void;
  onCaricaPDF: () => void;
  onImportaImmagine: () => void;
  onInserisciManuale: () => void;
}

export const CaricaCedolinoScreen: React.FC<CaricaCedolinoScreenProps> = ({
  onBack,
  onScattaFoto,
  onCaricaPDF,
  onImportaImmagine,
  onInserisciManuale,
}) => {
  const { colors, typography, spacing } = useTheme();

  const options = [
    { icon: '📷', title: 'Scatta foto', desc: 'Usa la fotocamera', action: onScattaFoto },
    { icon: '📄', title: 'Carica PDF', desc: 'Dal tuo dispositivo', action: onCaricaPDF },
    { icon: '🖼', title: 'Importa immagine', desc: 'Dalla galleria', action: onImportaImmagine },
    { icon: '✏', title: 'Inserisci dati manualmente', desc: 'Per test o simulazioni', action: onInserisciManuale },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Nuova analisi" subtitle="Scegli come caricare il tuo cedolino" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {options.map((opt, i) => (
          <TouchableOpacity key={i} onPress={opt.action} activeOpacity={0.7}>
            <XCard style={styles.optionCard} elevated>
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>{opt.icon}</Text>
                <View style={styles.optionText}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                    {opt.title}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {opt.desc}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: colors.textTertiary }]}>›</Text>
              </View>
            </XCard>
          </TouchableOpacity>
        ))}

        <Text
          style={[
            typography.bodySmall,
            { color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl },
          ]}
        >
          I tuoi dati restano sul tuo dispositivo.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  optionCard: {
    marginVertical: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
});
