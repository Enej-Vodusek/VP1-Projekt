import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type NavigationItem = {
  label: string;
  href: string;
  activePath: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

export const mainNavigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/(tabs)/home",
    activePath: "/home",
    icon: "home-outline",
  },
  {
    label: "UserSnapshot",
    href: "/(tabs)/snapshotForm",
    activePath: "/snapshotForm",
    icon: "list-outline",
  },
  {
    label: "Profile",
    href: "/(tabs)/profile",
    activePath: "/profile",
    icon: "person-outline",
  },
];
