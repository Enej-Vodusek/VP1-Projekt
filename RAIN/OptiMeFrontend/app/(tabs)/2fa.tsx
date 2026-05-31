import React, { useState } from "react";
import { View, Button, Image, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function TwoFA() {
  const [image, setImage] = useState<any>(null);
  const [result, setResult] = useState<string>("");

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!res.canceled) {
      setImage(res.assets[0]);
    }
  };

  const submit = async () => {
    const formData = new FormData();

    formData.append("image", {
      uri: image.uri,
      name: "2fa.jpg",
      type: "image/jpeg",
    } as any);

    const response = await fetch("http://HOST:3000/user/2fa", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data.verified ? "OK" : "FAILED");
  };

  return (
    <View>
      <Button title="Choose image" onPress={pickImage} />

      {image && <Image source={{ uri: image.uri }} style={{ width: 200, height: 200 }} />}

      <Button title="Confirm" onPress={submit} />

      <Text>{result}</Text>
    </View>
  );
}