import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

type AuthInputProps = TextInputProps & {
  label: string;
};

export default function AuthInput({ label, style, ...props }: AuthInputProps) {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>

      <TextInput
        placeholderTextColor="#777"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    marginBottom: 28,
  },
  labelContainer: {
    position: "absolute",
    top: -12,
    left: 22,
    backgroundColor: "#F3FCFF",
    paddingHorizontal: 10,
    zIndex: 2,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6B6B6B",
  },
  input: {
    height: 45,
    borderWidth: 1.5,
    borderColor: "#8B8B8B",
    borderRadius: 32,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 18,
    color: "#555",
  },
});
