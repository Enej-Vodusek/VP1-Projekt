import { Stack } from "expo-router";
import { Platform, View, useWindowDimensions } from "react-native";

import WebSidebar from "@/components/navigation/WebSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { styles } from "@/styles/home.styles";

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isWebLayout = width >= 1000;

  if (isWebLayout) {
    return (
      <View style={styles.webRoot}>
        <View style={styles.webSidebarShell}>
          <WebSidebar />
        </View>

        <View style={styles.webContent}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: Platform.OS === "web" ? "fade" : "fade",
              animationDuration: 180,
              contentStyle: {
                backgroundColor: "#F4F8FC",
              },
            }}
          >
            <Stack.Screen name="home" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="snapshotForm" />
          </Stack>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F8FC" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 160,
          contentStyle: {
            backgroundColor: "#F4F8FC",
          },
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="snapshotForm" />
      </Stack>

      <MobileBottomNav />
    </View>
  );
}
