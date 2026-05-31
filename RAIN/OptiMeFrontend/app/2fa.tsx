import React, { useState } from "react";
import { View, Button, Image, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

import axios from "axios";
import { getAccessToken } from "@/services/authStorage";
import { router } from "expo-router";

console.log("ARRIVED AT BEGINNING")
export default function TwoFA() {
  console.log("SCREEN MOUNTED");
  const [image, setImage] = useState<any>(null);
  const [result, setResult] = useState<string>("");

  console.log("ARRIVED AT PICK IMAGE")
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0]);
    }
  };

  console.log("ARRIVED AT SUBMIT")
  const submit = async () => {
    if (!image) return;

    const token = await getAccessToken();

    const formData = new FormData();
    formData.append("image", image.file, "2fa.jpg");

    try {
      const response = await axios.post(
        "http://192.168.1.72:3000/user/2fa",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      console.log("2FA RESULT:", data);

      if (data.verified) {
        setResult("OK");

        setTimeout(() => {
          router.replace("/(tabs)/home");
        }, 500);

      } else {
        setResult("FAILED");

        setTimeout(() => {
          router.replace("/auth/login");
        }, 800);
      }

    } catch (err: any) {
      console.log("2FA ERROR:", err?.response?.data || err.message);

      setResult("ERROR");

      setTimeout(() => {
        router.replace("/auth/login");
      }, 1000);
    }
  };

  return (
    <View>
      <Button title="Choose image" onPress={pickImage} />

      {image?.uri && (<Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />)}

      <Button title="Confirm" onPress={submit} />

      <Text>{result}</Text>
    </View>
  );
}