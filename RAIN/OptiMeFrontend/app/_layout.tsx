import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import PedometerTracker from "@/components/PedometerTracker";
import MqttHeartbeatTracker from "@/components/MqttHeartbeatTracker";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function AuthGuard() {
  const { isAuthenticated, user, pendingUser, authLoading } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || authLoading) return;

    const firstSegment = segments[0];

    const isAuthRoute = firstSegment === "auth";
    const isUserRoute = firstSegment === "user";
    const isTabsRoute = firstSegment === "(tabs)";
    const is2FARoute = firstSegment === "2fa";

    const hasFinishedForm = user?.formFinished === true;

    // Če ima user login uspešen, ampak mora še narediti 2FA,
    // ga držimo na /2fa.
    if (pendingUser && !is2FARoute) {
      router.replace("/2fa");
      return;
    }

    // Če ni prijavljen in nima pending 2FA userja, gre na login.
    if (!isAuthenticated && !pendingUser && !isAuthRoute) {
      router.replace("/auth/login");
      return;
    }

    // Če je že prijavljen in gre na auth strani, ga vržemo naprej.
    if (isAuthenticated && isAuthRoute) {
      router.replace(hasFinishedForm ? "/(tabs)/home" : "/user/startingForm");
      return;
    }

    // Če ima izpolnjen starting form, ne sme več na starting form.
    if (isAuthenticated && isUserRoute && hasFinishedForm) {
      router.replace("/(tabs)/home");
      return;
    }

    // Če še nima izpolnjenega starting forma, ne sme na tabs.
    if (isAuthenticated && isTabsRoute && !hasFinishedForm) {
      router.replace("/user/startingForm");
      return;
    }
  }, [
    isReady,
    authLoading,
    isAuthenticated,
    user,
    pendingUser,
    segments,
    router,
  ]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "web" ? "fade" : "slide_from_right",
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="auth" />

      <Stack.Screen
        name="user/startingForm"
        options={{
          animation: Platform.OS === "web" ? "fade" : "fade_from_bottom",
          animationDuration: 350,
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          animation: Platform.OS === "web" ? "fade" : "fade_from_bottom",
          animationDuration: 250,
        }}
      />

      <Stack.Screen
        name="2fa"
        options={{
          animation: Platform.OS === "web" ? "fade" : "slide_from_right",
          animationDuration: 300,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PedometerTracker />
        <MqttHeartbeatTracker />
        <AuthGuard />
      </ToastProvider>
    </AuthProvider>
  );
}
