import React, { useEffect, useState } from "react";
import { View, Button, Image, Text, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { deleteAccessToken, saveAccessToken } from "@/services/authStorage";
import { HOST_IP } from "@/src/config/network.generated";

export default function TwoFA() {
  const {
    pendingUser,
    pendingToken,
    setPendingUser,
    setPendingToken,
    setUser,
  } = useAuth();

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pendingUser || !pendingToken) {
      console.log("Missing pendingUser or pendingToken. Redirecting to login.");
      router.replace("/auth/login");
    }
  }, [pendingUser, pendingToken]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0]);
      setResult("");
    }
  }

  async function submit() {
    if (loading) return;

    if (!pendingUser || !pendingToken) {
      router.replace("/auth/login");
      return;
    }

    if (!image) {
      setResult("Choose image first");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      const formData = new FormData();

      if (Platform.OS === "web") {
        if (!image.file) {
          throw new Error("Image file missing");
        }

        formData.append("image", image.file);
      } else {
        formData.append("image", {
          uri: image.uri,
          name: "2fa.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        `http://${HOST_IP}:3000/user/2fa`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${pendingToken}`,
          },
        },
      );

      const data = response.data;

      console.log("2FA RESULT:", data);

      if (data.verified === true) {
        setResult("OK");

        await saveAccessToken(pendingToken);

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

      setResult("FAILED");

      await deleteAccessToken();

      setPendingUser(null);
      setPendingToken(null);

      router.replace("/auth/login");
    } catch (err: any) {
      console.log("2FA ERROR:", err?.response?.data || err.message);

      setResult("ERROR");

      await deleteAccessToken();

      setPendingUser(null);
      setPendingToken(null);

      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>
        Two-Factor Authentication
      </Text>

      <Text>Choose your 2FA image to confirm login.</Text>

      <Button title="Choose image" onPress={pickImage} />

      {image?.uri && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: 200, height: 200 }}
        />
      )}

      <Button
        title={loading ? "Checking..." : "Confirm"}
        onPress={submit}
        disabled={loading}
      />

      {!!result && <Text>{result}</Text>}
    </View>
  );
}
