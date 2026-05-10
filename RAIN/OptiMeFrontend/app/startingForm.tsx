import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import { Platform } from "react-native";

export default function startingForm() {
  const [username, setUsername] = useState("");
  const [education, setEducation] = useState("");
  const [employment, setEmployment] = useState("");

  const API_URL =
    Platform.OS === "android"
      ? "http://10.0.2.2:3000"
      : "http://localhost:3000";

  const handleStartingForm = async () => {
    try {
      const response = await fetch(`${API_URL}/user/startingForm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          education,
          employment
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        console.log("Register successful:", data.message);
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
        console.log("Register Error:", data.message);
      }
    } catch (error) {
      Alert.alert("Network Error:", "Could not connect to backend");
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Form</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Education"
        value={education}
        onChangeText={setEducation}
      />


      <TextInput
        style={styles.input}
        placeholder="Employement"
        value={employment}
        onChangeText={setEmployment}
      />

      <Pressable style={styles.button} onPress={handleStartingForm}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});