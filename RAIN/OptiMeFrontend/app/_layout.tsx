import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function AuthGuard() {
  const { isAuthenticated } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const firstSegment = segments[0];
    const isAuthRoute = firstSegment === "auth";

    if (!isAuthenticated && !isAuthRoute) {
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace("/user/startingForm");
    }
  }, [isReady, isAuthenticated, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGuard />
      </ToastProvider>
    </AuthProvider>
  );
}
