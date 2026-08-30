import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  ThemeProvider,
  useTheme,
} from "./src/theme/ThemeContext";

function AppContent() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>

        <StatusBar
          animated={true}
          barStyle={theme.barStatus}
          showHideTransition="fade"
          hidden={false}
        />

        <AuthProvider>
          <RootNavigator />
        </AuthProvider>

      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});