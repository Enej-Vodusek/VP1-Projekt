import React, { useState } from "react";
import { View, Button, Image, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

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
    if (!image) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();

    formData.append("image", {
      uri: image.uri,
      name: "2fa.jpg",
      type: "image/jpeg",
    } as any);

    const response = await fetch("http://192.168.1.72:3000/user/2fa", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data.verified ? "OK" : "FAILED");
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