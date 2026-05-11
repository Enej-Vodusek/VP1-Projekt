import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";

const theme = colors.light;

type Props = {
  options: readonly number[];
  selected?: number;
  onSelect: (value: number) => void;
};

export default function ScaleQuestion({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = selected === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.circle,
                isSelected && styles.selectedCircle,
                pressed && styles.pressedCircle,
              ]}
            >
              <Text
                style={[styles.number, isSelected && styles.selectedNumber]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>Low</Text>
        <Text style={styles.label}>High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.xl,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },
  selectedCircle: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    transform: [{ scale: 1.08 }],
  },
  pressedCircle: {
    transform: [{ scale: 0.96 }],
  },
  number: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "900",
  },
  selectedNumber: {
    color: theme.white,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});
