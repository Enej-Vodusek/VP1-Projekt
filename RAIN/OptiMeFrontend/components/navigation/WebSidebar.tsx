import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  mainNavigationItems,
  type NavigationItem,
} from "@/constants/navigationItems";

const colors = {
  background: "#F4F8FC",
  white: "#FFFFFF",
  navy: "#183F68",
  navySoft: "#355C86",
  blue: "#6EC6E8",
  blueSoft: "#D9EEF8",
  text: "#233548",
  textSoft: "#6E8092",
  border: "rgba(24,63,104,0.08)",
  shadow: "#B7D5E5",
  danger: "#EF5350",
};

export default function WebSidebar() {
  const pathname = usePathname();

  const { logout } = useAuth();
  const { showToast, showConfirmToast } = useToast();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function blurWebFocus() {
    if (Platform.OS !== "web") return;

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
  }

  function navigateTo(href: string) {
    blurWebFocus();
    router.replace(href as any);
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

  return (
    <View style={styles.sidebar}>
      <View style={styles.top}>
        <Pressable onPress={() => navigateTo("/(tabs)/home")}>
          <Image
            source={require("@/assets/images/just_circle.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      <View style={styles.center}>
        {mainNavigationItems.map((item) => {
          const active = isRouteActive(pathname, item.activePath);

          return (
            <SidebarNavItem
              key={`${item.label}-${item.activePath}`}
              item={item}
              active={active}
              onPress={() => navigateTo(item.href)}
            />
          );
        })}
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={[styles.logoutItem, isLoggingOut && styles.logoutItemDisabled]}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={isLoggingOut ? "#C9A2A2" : colors.danger}
          />
        </Pressable>
      </View>
    </View>
  );
}

function SidebarNavItem({
  item,
  active,
  onPress,
}: {
  item: NavigationItem;
  active: boolean;
  onPress: () => void;
}) {
  const activeProgress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(activeProgress, {
      toValue: active ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active, activeProgress]);

  function handlePressIn() {
    Animated.spring(pressScale, {
      toValue: 0.92,
      speed: 28,
      bounciness: 6,
      useNativeDriver: false,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 24,
      bounciness: 8,
      useNativeDriver: false,
    }).start();
  }

  const backgroundColor = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(24,63,104,0)", colors.navy],
  });

  const translateY = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  const activeScale = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const iconScale = activeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={10}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.navItem,
          {
            backgroundColor,
            transform: [
              { translateY },
              { scale: activeScale },
              { scale: pressScale },
            ],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: iconScale }],
          }}
        >
          <Ionicons
            name={active ? getActiveIcon(item.icon) : item.icon}
            size={active ? 24 : getSidebarIconSize(item.icon)}
            color={active ? colors.white : colors.navy}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function isRouteActive(pathname: string, activePath: string) {
  if (activePath === "/home") {
    return pathname === "/" || pathname === "/home";
  }

  return pathname === activePath || pathname.startsWith(`${activePath}/`);
}

function getActiveIcon(
  icon: keyof typeof Ionicons.glyphMap,
): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case "home-outline":
      return "home";

    case "stats-chart-outline":
      return "stats-chart";

    case "heart-outline":
      return "heart";

    case "person-outline":
      return "person";

    case "settings-outline":
      return "settings";

    default:
      return icon;
  }
}

function getSidebarIconSize(icon: keyof typeof Ionicons.glyphMap) {
  switch (icon) {
    case "home-outline":
      return 24;

    case "stats-chart-outline":
      return 27;

    case "heart-outline":
      return 28;

    case "person-outline":
      return 28;

    default:
      return 24;
  }
}

const styles = StyleSheet.create({
  sidebar: {
    width: 92,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 34,

    borderWidth: 1,
    borderColor: colors.border,

    paddingVertical: 28,
    alignItems: "center",

    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },

    elevation: 8,
  },

  top: {
    alignItems: "center",
  },

  logo: {
    width: 50,
    height: 50,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 34,
  },

  bottom: {
    alignItems: "center",
    gap: 18,
  },

  pressable: {
    width: 54,
    height: 54,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",
  },

  navItem: {
    width: 50,
    height: 50,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },

  logoutItem: {
    width: 50,
    height: 50,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(239,83,80,0.08)",
  },

  logoutItemDisabled: {
    opacity: 0.6,
  },
});
