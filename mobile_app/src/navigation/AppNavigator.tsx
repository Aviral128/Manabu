import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Loader } from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";
import { AboutAdminScreen } from "../screens/AboutAdminScreen";
import { AdminControlScreen } from "../screens/AdminControlScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { QuizCatalogScreen } from "../screens/QuizCatalogScreen";
import { QuizPlayerScreen } from "../screens/QuizPlayerScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { theme } from "../theme/tokens";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Booting MANABU mobile..." />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
            <Stack.Screen name="QuizCatalog" component={QuizCatalogScreen} options={{ title: "Quiz Catalog" }} />
            <Stack.Screen name="QuizPlayer" component={QuizPlayerScreen} options={({ route }) => ({ title: route.params.title })} />
            <Stack.Screen name="AboutAdmin" component={AboutAdminScreen} options={{ title: "About Admin" }} />
            {user.role === "admin" ? (
              <Stack.Screen name="AdminControl" component={AdminControlScreen} options={{ title: "Admin Control" }} />
            ) : null}
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create Account" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
