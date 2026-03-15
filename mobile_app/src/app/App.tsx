import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { AppErrorBoundary } from "../components/AppErrorBoundary";
import { BrandLaunchOverlay } from "../components/BrandLaunchOverlay";
import { AuthProvider } from "../contexts/AuthContext";
import { AppNavigator } from "../navigation/AppNavigator";
import { theme } from "../theme/tokens";

export function App() {
  const [showLaunchOverlay, setShowLaunchOverlay] = React.useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <View style={{ flex: 1 }}>
              <StatusBar style="light" />
              <AppNavigator />
              {showLaunchOverlay ? <BrandLaunchOverlay onDone={() => setShowLaunchOverlay(false)} /> : null}
            </View>
          </AuthProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
