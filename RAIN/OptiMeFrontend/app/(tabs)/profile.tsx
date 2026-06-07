import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { colors, styles } from "@/styles/home.styles";

import { getCurrentUser, toggleTwoFactor } from "@/services/auth";

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isWebLayout = width >= 1000;

  const { logout, user, setUser } = useAuth();
  const { showToast, showConfirmToast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.twoFactorEnabled === true,
  );

  function blurWebFocus() {
    if (Platform.OS !== "web") return;

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
  }

  async function refreshTwoFactorState() {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        return;
      }

      setUser(currentUser);
      setTwoFactorEnabled(currentUser.twoFactorEnabled === true);
    } catch (error) {
      console.log("Failed to refresh profile user:", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      refreshTwoFactorState();
    }, []),
  );

  async function handleToggleTwoFactor() {
    if (isUpdatingTwoFactor) return;

    blurWebFocus();

    const previousValue = twoFactorEnabled;

    try {
      setIsUpdatingTwoFactor(true);

      const res = await toggleTwoFactor();
      const nextValue = res.twoFactorEnabled === true;

      setTwoFactorEnabled(nextValue);

      if (user) {
        setUser({
          ...user,
          twoFactorEnabled: nextValue,
        });
      }

      showToast(
        nextValue
          ? "Two-factor authentication enabled."
          : "Two-factor authentication disabled.",
        "success",
      );
    } catch (error) {
      setTwoFactorEnabled(previousValue);
      showToast("Failed to update 2FA", "error");
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  }

  async function logoutConfirmed() {
    if (isLoggingOut) return;

    blurWebFocus();
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      showToast("Logout failed. Please try again.", "error");
      setIsLoggingOut(false);
    }
  }

  function handleLogout() {
    blurWebFocus();

    showConfirmToast({
      message: "Do you want to log out?",
      type: "info",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: logoutConfirmed,
    });
  }

  if (isWebLayout) {
    return (
      <ScrollView
        style={styles.webContent}
        contentContainerStyle={styles.webContentInner}
        showsVerticalScrollIndicator={false}
      >
        <ProfileContent
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          twoFactorEnabled={twoFactorEnabled}
          isUpdatingTwoFactor={isUpdatingTwoFactor}
          onToggleTwoFactor={handleToggleTwoFactor}
        />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.mobileRoot} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mobileContent}
      >
        <ProfileContent
          mobile
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          twoFactorEnabled={twoFactorEnabled}
          isUpdatingTwoFactor={isUpdatingTwoFactor}
          onToggleTwoFactor={handleToggleTwoFactor}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileContent({
  mobile = false,
  onLogout,
  isLoggingOut,
  twoFactorEnabled,
  isUpdatingTwoFactor,
  onToggleTwoFactor,
}: {
  mobile?: boolean;
  onLogout: () => void;
  isLoggingOut: boolean;
  twoFactorEnabled: boolean;
  isUpdatingTwoFactor: boolean;
  onToggleTwoFactor: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: mobile ? 22 : 24,
        borderWidth: 1,
        borderColor: colors.border,
        padding: mobile ? 18 : 24,
        minHeight: 260,
      }}
    >
      <Text
        style={{
          color: colors.navy,
          fontSize: mobile ? 24 : 30,
          fontWeight: "900",
        }}
      >
        Profile
      </Text>

      <Text
        style={{
          color: colors.textSoft,
          fontSize: 14,
          fontWeight: "700",
          marginTop: 8,
          lineHeight: 21,
        }}
      >
        Manage your account and app settings.
      </Text>

      <View
        style={{
          marginTop: 28,
          padding: 16,
          borderRadius: 18,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Pressable
          onPress={onToggleTwoFactor}
          disabled={isUpdatingTwoFactor}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: twoFactorEnabled }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            opacity: isUpdatingTwoFactor ? 0.65 : 1,
          }}
        >
          {isUpdatingTwoFactor ? (
            <ActivityIndicator size="small" color={colors.navy} />
          ) : (
            <Ionicons
              name={twoFactorEnabled ? "checkbox-outline" : "square-outline"}
              size={26}
              color={twoFactorEnabled ? colors.navy : colors.textSoft}
            />
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.navy,
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              Enable 2FA
            </Text>

            <Text
              style={{
                color: colors.textSoft,
                fontSize: 13,
                fontWeight: "700",
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              {twoFactorEnabled
                ? "Two-factor verification is currently enabled."
                : "Require two-factor verification after login."}
            </Text>
          </View>

          <Text
            style={{
              color: twoFactorEnabled ? colors.navy : colors.textSoft,
              fontSize: 13,
              fontWeight: "900",
            }}
          >
            {twoFactorEnabled ? "On" : "Off"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onLogout}
        disabled={isLoggingOut}
        style={{
          marginTop: 20,
          height: 54,
          borderRadius: 18,
          backgroundColor: "rgba(239,83,80,0.08)",
          borderWidth: 1,
          borderColor: "rgba(239,83,80,0.16)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 10,
          opacity: isLoggingOut ? 0.6 : 1,
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color={isLoggingOut ? "#C9A2A2" : "#EF5350"}
        />

        <Text
          style={{
            color: isLoggingOut ? "#C9A2A2" : "#EF5350",
            fontSize: 15,
            fontWeight: "900",
          }}
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Text>
      </Pressable>
    </View>
  );
}
