import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  Alert,
  Platform,
} from "react-native";
import { loginUser } from "@/services/auth";
import AuthInput from "@/components/AuthInput";
import AuthButton from "@/components/AuthButton";
import { styles } from "@/styles/login.styles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const logo = Platform.select({
    ios: require("@/assets/images/just_circle.png"),
    android: require("@/assets/images/just_circle.png"),
    web: require("@/assets/images/logo_final_web.svg"),
  });

  const logoStyle = Platform.select({
    ios: styles.mobileLogo,
    android: styles.mobileLogo,
    web: styles.webLogo,
  });

  async function handleLogin() {
    try {
      const data = await loginUser(email, password);
      console.log("Login Success", data);
      Alert.alert("Success", "Logged in!");
    } catch (error: any) {
      console.log("Login failed", error);
      Alert.alert("Error", error?.message || "Login failed");
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

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <AuthButton title="Login" onPress={handleLogin} />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don’t have an account? </Text>
            <TouchableOpacity>
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
