import { useState } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  Platform,
} from "react-native";

import { router } from "expo-router";

import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

import { styles } from "@/styles/login.styles";
import { useToast } from "@/context/ToastContext";

import { sumbitUserSnapshotForm } from "@/services/user";

export default function UserSnapshotFormScreen() {
  const [mood, setMood] = useState("");
  const [stress, setStress] = useState("");
  const [anxiety, setAnxiety] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [screenTimeHours, setScreenTimeHours] = useState("");

  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const logo = Platform.select({
    ios: require("@/assets/images/just_circle.png"),
    android: require("@/assets/images/just_circle.png"),
    web: require("@/assets/images/logo_final_web.svg"),
  });

  const logoStyle = isMobile ? styles.mobileLogo : styles.webLogo;

  async function handleSubmit() {
    if (loading) return;

    try {
      setLoading(true);

      const data = await sumbitUserSnapshotForm(Number(mood), Number(stress), Number(anxiety), Number(sleepHours), Number(screenTimeHours));

      showToast(data?.message || "Snapshot saved", "success");

      router.replace("/");
    } catch (error: any) {
      console.log("Snapshot save failed", error);

      showToast(
        error?.message || "Failed to save snapshot",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        <View style={[styles.form, isMobile && styles.formMobile]}>
          {isMobile && (
            <Image source={logo} style={logoStyle} resizeMode="contain" />
          )}

          <Text style={[styles.title, isMobile && styles.titleMobile]}>
            Daily Snapshot
          </Text>

          <AuthInput
            label="Mood"
            placeholder="0 - 10"
            value={mood}
            onChangeText={setMood}
            keyboardType="numeric"
          />

          <AuthInput
            label="Stress"
            placeholder="0 - 10"
            value={stress}
            onChangeText={setStress}
            keyboardType="numeric"
          />

          <AuthInput
            label="Anxiety"
            placeholder="0 - 10"
            value={anxiety}
            onChangeText={setAnxiety}
            keyboardType="numeric"
          />

          <AuthInput
            label="Sleep Hours"
            placeholder="e.g. 8"
            value={sleepHours}
            onChangeText={setSleepHours}
            keyboardType="numeric"
          />

          <AuthInput
            label="Screen Time Hours"
            placeholder="e.g. 4"
            value={screenTimeHours}
            onChangeText={setScreenTimeHours}
            keyboardType="numeric"
          />

          <AuthButton
            title={loading ? "Saving..." : "Save"}
            onPress={handleSubmit}
          />
        </View>

        {!isMobile && (
          <View style={styles.logoSection}>
            <Image source={logo} style={logoStyle} resizeMode="contain" />
          </View>
        )}
      </View>
    </View>
  );
}