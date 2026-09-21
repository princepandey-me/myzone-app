import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar, TabName } from './src/components/TabBar';
import { Toast } from './src/components/Toast';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { EditDayScreen } from './src/screens/EditDayScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SubjectsScreen } from './src/screens/SubjectsScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { AppProvider, useApp } from './src/state/AppContext';
import { colors } from './src/theme';

type Route = { name: 'editDay'; weekday: number } | { name: 'subjects' };

function Shell() {
  const { ready, toast, dismissToast } = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabName>('home');
  const [stack, setStack] = useState<Route[]>([]);
  const top = stack.length > 0 ? stack[stack.length - 1] : null;

  const push = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  // Android back button: close the open screen first, then go back to Home, then exit.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 0) {
        setStack((s) => s.slice(0, -1));
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, tab]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const editDay = (weekday: number) => push({ name: 'editDay', weekday });
  const screens: Record<TabName, React.ReactNode> = {
    home: <HomeScreen />,
    timetable: <TimetableScreen onEditDay={editDay} />,
    attendance: <AttendanceScreen />,
    settings: <SettingsScreen onOpenSubjects={() => push({ name: 'subjects' })} onEditDay={editDay} />,
  };
  const tabNames = Object.keys(screens) as TabName[];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {tabNames.map((name) => (
          <View key={name} style={{ flex: 1, display: name === tab && !top ? 'flex' : 'none' }}>
            {screens[name]}
          </View>
        ))}
        {top && top.name === 'editDay' ? <EditDayScreen weekday={top.weekday} onBack={pop} /> : null}
        {top && top.name === 'subjects' ? <SubjectsScreen onBack={pop} /> : null}
      </View>
      {!top ? <TabBar tab={tab} onChange={setTab} bottomInset={insets.bottom} /> : null}
      <Toast toast={toast} onDismiss={dismissToast} bottom={top ? insets.bottom + 20 : insets.bottom + 80} />
    </View>
  );
}

export default function App() {
  const [loaded, error] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
