import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import AuthPasswordInput from "@/components/AuthPasswordInput";

import { loginUser } from "@/services/auth";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import { styles } from "@/styles/login.styles";

import { saveAccessToken } from "@/services/authStorage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { user, setUser, setPendingToken, setPendingUser, authLoading } =
    useAuth();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const logo = Platform.select({
    ios: require("@/assets/images/just_circle.png"),
    android: require("@/assets/images/just_circle.png"),
    web: require("@/assets/images/logo_final_web.svg"),
  });

  const logoStyle = isMobile ? styles.mobileLogo : styles.webLogo;

  async function handleLogin() {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showToast("Email is required", "error");
      return;
    }

    if (!cleanEmail.includes("@")) {
      showToast("Invalid email format", "error");
      return;
    }

    if (!password) {
      showToast("Password is required", "error");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(cleanEmail, password);

      console.log("LOGIN RESPONSE:", data);

      if (!data.user) {
        throw new Error("User data missing from login response");
      }

      const accessToken = data.accessToken;

      const requires2FA =
        data.requires2FA === true || data.user?.twoFactorEnabled === true;

      if (requires2FA) {
        console.log("2FA REQUIRED - NAVIGATING TO /2fa");

        if (!accessToken) {
          throw new Error("2FA token missing from login response");
        }

        setPendingUser(data.user);
        setPendingToken(accessToken);

        showToast("Enter your 2FA verification code", "success");
        router.replace("/2fa");
        return;
      }

      if (!accessToken) {
        throw new Error("Access token missing from login response");
      }

      await saveAccessToken(accessToken);
      setUser(data.user);

      showToast(data.message || "Logged in successfully", "success");

      if (data.user.formFinished === true) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/user/startingForm");
      }
    } catch (error: any) {
      console.log("Login failed", error);

      showToast(error?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || user) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        <View style={[styles.form, isMobile && styles.formMobile]}>
          {isMobile && (
            <Image source={logo} style={logoStyle} resizeMode="contain" />
          )}

          <Text style={[styles.title, isMobile && styles.titleMobile]}>
            {isMobile ? "Login" : "Welcome Back!"}
          </Text>

          <AuthInput
            label="Email"
            placeholder="email@gmail.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AuthPasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />

          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <AuthButton
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don’t have an account? </Text>

            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
