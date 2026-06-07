import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { deleteAccessToken, saveAccessToken } from "@/services/authStorage";
import { HOST_IP } from "@/src/config/network.generated";

export default function TwoFAScreen() {
  const {
    pendingUser,
    pendingToken,
    setPendingUser,
    setPendingToken,
    setUser,
  } = useAuth();

  const { showToast } = useToast();
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768;
  const isSmallHeight = height < 760;

  const apiUrl = useMemo(() => `http://${HOST_IP}:3000`, []);

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isCompletingLogin, setIsCompletingLogin] = useState(false);

  const [resultText, setResultText] = useState("");
  const [resultType, setResultType] = useState<"info" | "error" | "success">(
    "info",
  );

  useEffect(() => {
    if (isCompletingLogin) return;

    if (!pendingUser || !pendingToken) {
      showToast("Please login again to continue.", "error");
      router.replace("/auth/login");
      return;
    }

    setCheckingAuth(false);
  }, [pendingUser, pendingToken, isCompletingLogin]);

  async function pickImage() {
    try {
      if (loading) return;

      setResultText("");
      setResultType("info");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showToast("Gallery permission is required.", "error");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: false,
      });

      if (!res.canceled && res.assets?.length > 0) {
        setImage(res.assets[0]);
        setResultText("");
        setResultType("info");
      }
    } catch (error: any) {
      console.log("Image picker error:", error?.message || error);
      showToast("Failed to choose image.", "error");
    }
  }

  async function submit2FA() {
    if (loading) return;

    if (!pendingUser || !pendingToken) {
      showToast("Session expired. Please login again.", "error");
      await clearPendingAndGoLogin();
      return;
    }

    if (!image) {
      setResultType("error");
      setResultText("Please choose your 2FA image first.");
      showToast("Please choose your 2FA image first.", "error");
      return;
    }

    try {
      setLoading(true);
      setResultType("info");
      setResultText("Checking image...");

      const formData = new FormData();

      if (Platform.OS === "web") {
        const webFile = (image as any).file;

        if (!webFile) {
          throw new Error("Image file missing. Please choose the image again.");
        }

        formData.append("image", webFile);
      } else {
        formData.append("image", {
          uri: image.uri,
          name: "2fa.jpg",
          type: image.mimeType || "image/jpeg",
        } as any);
      }

      const response = await axios.post(`${apiUrl}/user/2fa`, formData, {
        headers: {
          Authorization: `Bearer ${pendingToken}`,
        },
      });

      const data = response.data;

      console.log("2FA RESULT:", data);

      if (data.verified === true) {
        setIsCompletingLogin(true);

        await saveAccessToken(pendingToken);

        setResultType("success");
        setResultText("Image verified successfully.");
        showToast("2FA verified successfully.", "success");

        setUser(pendingUser);
        setPendingUser(null);
        setPendingToken(null);

        if (pendingUser.formFinished === true) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/user/startingForm");
        }

        return;
      }

      setImage(null);
      setResultType("error");
      setResultText("Wrong image. Please choose another one.");
      showToast("Wrong 2FA image. Please try again.", "error");
    } catch (error: any) {
      console.log("2FA ERROR:", error?.response?.data || error.message);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "2FA verification failed.";

      setResultType("error");
      setResultText(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function clearPendingAndGoLogin() {
    await deleteAccessToken();

    setPendingUser(null);
    setPendingToken(null);

    router.replace("/auth/login");
  }

  if (checkingAuth) {
    return (
      <View style={styles.screen}>
        <View style={[styles.loadingCard, isMobile && styles.cardMobile]}>
          <ActivityIndicator size="large" color={colors.navy} />
          <Text style={styles.loadingText}>Preparing verification...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        isMobile && styles.scrollContentMobile,
        isSmallHeight && styles.scrollContentSmallHeight,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.iconBubble}>
            <Ionicons
              name="shield-checkmark-outline"
              size={isMobile ? 24 : 28}
              color={colors.navy}
            />
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>
              Two-Factor Authentication
            </Text>

            <Text style={styles.subtitle}>
              Choose your verification image to finish logging in.
            </Text>
          </View>
        </View>

        <View style={[styles.infoBox, isMobile && styles.infoBoxMobile]}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.textSoft}
          />

          <Text style={styles.infoText}>
            Select the correct image connected to your account. If the image is
            wrong, you can choose another one.
          </Text>
        </View>

        <View style={[styles.previewBox, isMobile && styles.previewBoxMobile]}>
          {image?.uri ? (
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="image-outline"
                size={isMobile ? 36 : 42}
                color={colors.textMuted}
              />

              <Text style={styles.placeholderTitle}>No image selected</Text>

              <Text style={styles.placeholderText}>
                Choose an image from your gallery.
              </Text>
            </View>
          )}
        </View>

        {!!resultText && (
          <View
            style={[
              styles.resultBox,
              resultType === "error" && styles.resultBoxError,
              resultType === "success" && styles.resultBoxSuccess,
            ]}
          >
            <Ionicons
              name={
                resultType === "error"
                  ? "alert-circle-outline"
                  : resultType === "success"
                    ? "checkmark-circle-outline"
                    : "time-outline"
              }
              size={19}
              color={
                resultType === "error"
                  ? colors.danger
                  : resultType === "success"
                    ? colors.success
                    : colors.textSoft
              }
            />

            <Text
              style={[
                styles.resultText,
                resultType === "error" && styles.resultTextError,
                resultType === "success" && styles.resultTextSuccess,
              ]}
            >
              {resultText}
            </Text>
          </View>
        )}

        <View style={[styles.actions, isMobile && styles.actionsMobile]}>
          <TouchableOpacity
            style={[styles.secondaryButton, loading && styles.disabledButton]}
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="image-outline" size={19} color={colors.navy} />

            <Text style={styles.secondaryButtonText}>
              {image ? "Choose another image" : "Choose image"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!image || loading) && styles.disabledButton,
            ]}
            onPress={submit2FA}
            disabled={!image || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.white}
                />

                <Text style={styles.primaryButtonText}>Confirm</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={clearPendingAndGoLogin}
          disabled={loading}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back-outline" size={17} color={colors.danger} />

          <Text style={styles.cancelButtonText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const colors = {
  navy: "#143A5A",
  navySoft: "#ECF3FA",
  background: "#F4F7FB",
  white: "#FFFFFF",
  text: "#17324D",
  textSoft: "#6E7C8F",
  textMuted: "#9AA8B7",
  border: "#DCE5EF",
  borderSoft: "#EDF2F7",
  danger: "#F05A5A",
  dangerBg: "#FFF1F1",
  dangerBorder: "#FFD3D3",
  success: "#39B878",
  successBg: "#ECFFF5",
  successBorder: "#BFEFD7",
};

const webShadow =
  Platform.OS === "web"
    ? ({
        boxShadow: "0px 16px 40px rgba(20, 58, 90, 0.08)",
      } as any)
    : {
        shadowColor: "#143A5A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.09,
        shadowRadius: 24,
        elevation: 5,
      };

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContentMobile: {
    padding: 16,
  },

  scrollContentSmallHeight: {
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingBottom: 24,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 760,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 30,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...webShadow,
  },

  cardMobile: {
    maxWidth: "100%",
    padding: 18,
    borderRadius: 24,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...webShadow,
  },

  loadingText: {
    marginTop: 12,
    color: colors.textSoft,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },

  headerMobile: {
    alignItems: "flex-start",
  },

  iconBubble: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.navySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextWrap: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 5,
  },

  titleMobile: {
    fontSize: 23,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSoft,
    fontWeight: "700",
  },

  infoBox: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FBFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
  },

  infoBoxMobile: {
    paddingHorizontal: 14,
  },

  infoText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  previewBox: {
    width: "100%",
    height: 260,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
    marginBottom: 16,
  },

  previewBoxMobile: {
    height: 210,
    borderRadius: 20,
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  placeholderTitle: {
    marginTop: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  placeholderText: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  resultBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },

  resultBoxError: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },

  resultBoxSuccess: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },

  resultText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "800",
  },

  resultTextError: {
    color: colors.danger,
  },

  resultTextSuccess: {
    color: colors.success,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },

  actionsMobile: {
    flexDirection: "column",
  },

  primaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  primaryButtonText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 15,
  },

  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FBFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  secondaryButtonText: {
    color: colors.navy,
    fontWeight: "900",
    fontSize: 15,
  },

  cancelButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  cancelButtonText: {
    color: colors.danger,
    fontWeight: "900",
    fontSize: 14,
  },

  disabledButton: {
    opacity: 0.55,
  },
});
