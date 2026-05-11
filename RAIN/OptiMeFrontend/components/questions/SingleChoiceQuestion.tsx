import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";

const theme = colors.light;

type Props = {
  options: readonly string[];
  selected?: string;
  onSelect: (value: string) => void;
};

export default function SingleChoiceQuestion({
  options,
  selected,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected === option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.selectedOption,
              pressed && styles.pressedOption,
            ]}
          >
            <View style={styles.textWrapper}>
              <Text
                style={[styles.optionText, isSelected && styles.selectedText]}
              >
                {option}
              </Text>
            </View>

            <View
              style={[
                styles.radioOuter,
                isSelected && styles.radioOuterSelected,
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },

  option: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: theme.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: theme.border,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 3,
  },

  selectedOption: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  pressedOption: {
    transform: [{ scale: 0.98 }],
  },

  textWrapper: {
    flex: 1,
    paddingRight: spacing.md,
  },

  optionText: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },

  selectedText: {
    color: theme.white,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: theme.white,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.white,
  },
});
