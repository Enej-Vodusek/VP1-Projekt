import { Animated, StyleSheet, View } from "react-native";
import { colors, radius } from "@/constants/theme";

const theme = colors.light;

type Props = {
  progress: Animated.Value;
};

export default function ProgressBar({ progress }: Props) {
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: radius.full,
  },
});
