import React, { useEffect, useState } from "react";
import { View, Button, Image, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

import axios from "axios";
import { getAccessToken } from "@/services/authStorage";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { deleteAccessToken, saveAccessToken } from "@/services/authStorage";

import { HOST_IP } from "@/src/config/network.generated";

console.log("ARRIVED AT BEGINNING")
export default function TwoFA() {
  console.log("SCREEN MOUNTED");

  const { pendingUser, pendingToken, setPendingUser, setPendingToken, setUser, } = useAuth();
  console.log("PENDING USER:", pendingUser);
  console.log("PENDING TOKEN:", pendingToken);

  useEffect(() => {
    if (!pendingUser || !pendingToken) {
      router.replace("/auth/login");
    }
  }, []);

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

    //const token = await getAccessToken();

    const formData = new FormData();
    formData.append("image", image.file, "2fa.jpg");

    try {
      console.log("ARRIVED AT RESPONSE")
      console.log("TOKEN:", pendingToken);
      const response = await axios.post(
        `http://${HOST_IP}:3000/user/2fa`,
        formData,
        {
          headers: {
            //Authorization: `Bearer ${token}`
            Authorization: `Bearer ${pendingToken}`
          },
        }
      );

      const data = response.data;

      console.log("2FA RESULT:", data);

      if (data.verified)
      {
        setResult("OK");
        if (!pendingToken) {
          console.log("PENDING TOKEN DOES NOT EXIST!");
          router.replace("/auth/login");
          return;
        }
        await saveAccessToken(pendingToken);

        setUser(pendingUser);

        setPendingUser(null);
        setPendingToken(null);

        router.replace("/(tabs)/home");
      }
      else
      {
        setResult("FAILED");
        await deleteAccessToken();

        setPendingUser(null);
        setPendingToken(null);

        router.replace("/auth/login");
      }

    } catch (err: any) {
      console.log("2FA ERROR:", err?.response?.data || err.message);

      setResult("ERROR");
      router.replace("/auth/login");
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