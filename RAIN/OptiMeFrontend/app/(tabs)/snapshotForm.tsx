import { useState, type ReactNode } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";

import { useToast } from "@/context/ToastContext";
import { submitUserSnapshotForm } from "@/services/user";

function DismissKeyboardWrapper({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") {
    return <>{children}</>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  );
}

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

  function validateRange(
    value: number,
    min: number,
    max: number,
    label: string,
  ) {
    if (Number.isNaN(value)) {
      showToast(`${label} must be a number.`, "error");
      return false;
    }

    if (value < min || value > max) {
      showToast(`${label} must be between ${min} and ${max}.`, "error");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (loading) return;

    const moodValue = Number(mood);
    const stressValue = Number(stress);
    const anxietyValue = Number(anxiety);
    const sleepHoursValue = Number(sleepHours);
    const screenTimeHoursValue = Number(screenTimeHours);

    if (
      mood.trim() === "" ||
      stress.trim() === "" ||
      anxiety.trim() === "" ||
      sleepHours.trim() === "" ||
      screenTimeHours.trim() === ""
    ) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    if (!validateRange(moodValue, 1, 5, "Mood")) return;
    if (!validateRange(stressValue, 1, 5, "Stress")) return;
    if (!validateRange(anxietyValue, 1, 5, "Anxiety")) return;
    if (!validateRange(sleepHoursValue, 0, 24, "Sleep hours")) return;
    if (!validateRange(screenTimeHoursValue, 0, 24, "Screen time hours")) {
      return;
    }

    try {
      setLoading(true);

      const data = await submitUserSnapshotForm({
        mood: moodValue,
        stress: stressValue,
        anxiety: anxietyValue,
        sleepHours: sleepHoursValue,
        screenTimeHours: screenTimeHoursValue,
        date: new Date().toISOString(),
      });

      showToast(data?.message || "Snapshot saved", "success");

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("Snapshot save failed", error);

      showToast(error?.message || "Failed to save snapshot", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={localStyles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={localStyles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <DismissKeyboardWrapper>
          <ScrollView
            style={localStyles.scroll}
            contentContainerStyle={[
              localStyles.scrollContent,
              isMobile && localStyles.scrollContentMobile,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[localStyles.card, isMobile && localStyles.cardMobile]}
            >
              {isMobile && (
                <Image
                  source={logo}
                  style={localStyles.mobileLogo}
                  resizeMode="contain"
                />
              )}

              <Text
                style={[localStyles.title, isMobile && localStyles.titleMobile]}
              >
                Daily Snapshot
              </Text>

              <Text style={localStyles.subtitle}>
                Fill in today’s values so your dashboard can update your mental
                health score and tracked metrics.
              </Text>

              <View style={localStyles.form}>
                <AuthInput
                  label="Mood"
                  placeholder="1 - 5"
                  value={mood}
                  onChangeText={setMood}
                  keyboardType="numeric"
                />

                <AuthInput
                  label="Stress"
                  placeholder="1 - 5"
                  value={stress}
                  onChangeText={setStress}
                  keyboardType="numeric"
                />

                <AuthInput
                  label="Anxiety"
                  placeholder="1 - 5"
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

                <View style={localStyles.buttonWrap}>
                  <AuthButton
                    title={loading ? "Saving..." : "Save snapshot"}
                    onPress={handleSubmit}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </DismissKeyboardWrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const colors = {
  background: "#F4F8FC",
  white: "#FFFFFF",
  navy: "#183F68",
  text: "#233548",
  textSoft: "#6E8092",
  border: "rgba(24,63,104,0.10)",
};

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContentMobile: {
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },

  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,

    shadowColor: "#B7D5E5",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  cardMobile: {
    maxWidth: "100%",
    borderRadius: 24,
    padding: 18,
  },

  mobileLogo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    color: colors.navy,
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  titleMobile: {
    fontSize: 24,
  },

  subtitle: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },

  form: {
    gap: 2,
  },

  buttonWrap: {
    marginTop: 14,
  },
});
