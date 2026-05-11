import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";

const handleLogout = async () => {

  const API_URL = "http://localhost:3000";

  try {
    const response = await fetch(`${API_URL}/user/logout`, {
      method: "GET",
    });

    const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        console.log("logout successfull:", data.message);
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
        console.log("logout failed:", data.message);
      }
    } catch (error) {
      Alert.alert("Network Error:", "Could not connect to backend");
      console.log(error);
    }
};

export default function Index() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Home</Text>

      <Pressable
        onPress={() => router.push("/register")}
        style={{
          backgroundColor: "black",
          padding: 12,
          marginTop: 20,
          marginBottom: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Go to Register</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/login")}
        style={{
          backgroundColor: "black",
          padding: 12,
          marginTop: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Go to Login</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/startingForm")}
        style={{
          backgroundColor: "black",
          padding: 12,
          marginTop: 20,
          marginBottom: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Go to Form</Text>
      </Pressable>

      
      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: "black",
          padding: 12,
          marginTop: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
}


