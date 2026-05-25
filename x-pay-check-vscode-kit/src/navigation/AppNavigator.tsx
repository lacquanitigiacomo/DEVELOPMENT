import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

// Screens
import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CaricaCedolinoScreen } from '../screens/CaricaCedolinoScreen';
import { ReportAnalisiScreen } from '../screens/ReportAnalisiScreen';
import { ImpostazioniScreen } from '../screens/ImpostazioniScreen';
import { LicenzaProScreen } from '../screens/LicenzaProScreen';

type Screen =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'carica'
  | 'report'
  | 'impostazioni'
  | 'licenza'
  | 'calendario'
  | 'confronto'
  | 'archivio';

export const AppNavigator: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const { colors } = useTheme();

  // Mock data — replace with real state/context
  const mockUser = {
    name: 'Giacomo',
    ccnl: 'CCNL Commercio',
    livello: '5',
    tier: 'free' as const,
  };

  const mockAnalysis = {
    month: 'Aprile 2026',
    ccnl: 'Commercio',
    livello: '5',
    stato: 'Da verificare',
    critici: 2,
    warning: 5,
    ok: 14,
    anomalie: [
      {
        id: '1',
        titolo: 'Festività lavorata non maggiorata',
        descrizione: '25 Aprile: risulta lavorato ma non risulta maggiorazione. Delta stimato: €32,65',
        severita: 'CRITICO' as const,
        delta: '-€32,65',
      },
      {
        id: '2',
        titolo: 'Maggiorazione notturna inferiore',
        descrizione: 'Ore notturne: 8h. Cedolino riporta €45,00. Atteso: €52,00',
        severita: 'WARNING' as const,
        delta: '-€7,00',
      },
    ],
  };

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return (
          <LandingScreen
            onStart={() => setScreen('login')}
            onLogin={() => setScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLogin={() => setScreen('dashboard')}
            onSocialLogin={() => setScreen('dashboard')}
            onBack={() => setScreen('landing')}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            userName={mockUser.name}
            ccnl={mockUser.ccnl}
            livello={mockUser.livello}
            lastAnalysis={{
              month: 'Aprile 2026',
              critici: 2,
              warning: 5,
              ok: 14,
            }}
            onNavigate={(s) => setScreen(s as Screen)}
            onNavTab={(tab) => {
              if (tab === 'settings') setScreen('impostazioni');
              if (tab === 'calendar') setScreen('calendario');
              if (tab === 'archive') setScreen('archivio');
            }}
          />
        );
      case 'carica':
        return (
          <CaricaCedolinoScreen
            onBack={() => setScreen('dashboard')}
            onScattaFoto={() => {}}
            onCaricaPDF={() => {}}
            onImportaImmagine={() => {}}
            onInserisciManuale={() => {}}
          />
        );
      case 'report':
        return (
          <ReportAnalisiScreen
            onBack={() => setScreen('dashboard')}
            onCorreggiDati={() => {}}
            onGeneraAnalisi={() => {}}
            analysisData={mockAnalysis}
          />
        );
      case 'impostazioni':
        return (
          <ImpostazioniScreen
            onBack={() => setScreen('dashboard')}
            userName={mockUser.name}
            tier={mockUser.tier}
            notifications={true}
            onToggleNotifications={() => {}}
            onNavigate={(s) => {
              if (s === 'licenza') setScreen('licenza');
            }}
          />
        );
      case 'licenza':
        return (
          <LicenzaProScreen
            onBack={() => setScreen('impostazioni')}
            onPurchase={() => {}}
            onRestore={() => {}}
            tier="free"
            trialDaysLeft={7}
          />
        );
      default:
        return <LandingScreen onStart={() => setScreen('login')} onLogin={() => setScreen('login')} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
