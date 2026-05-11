import { StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";

const theme = colors.light;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    paddingVertical: 28,
  },

  keyboardView: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    overflow: "hidden",
  },

  card: {
    width: "100%",
    maxWidth: 1100,
    minHeight: 640,

    backgroundColor: theme.card,

    borderRadius: radius.xl,

    paddingHorizontal: 48,
    paddingVertical: 40,

    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 12,
    },

    elevation: 8,
  },

  cardMobile: {
    flex: 1,
    minHeight: "auto",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  form: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
  },

  formMobile: {
    maxWidth: "100%",
  },

  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },

  backButtonDisabled: {
    opacity: 0,
  },

  mobileLogo: {
    width: 190,
    height: 145,
    alignSelf: "center",
    marginTop: spacing.lg,
  },

  webLogo: {
    width: 400,
    height: 320,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },

  title: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  titleMobile: {
    marginTop: spacing.md,
  },

  introCenter: {
    alignItems: "center",

    paddingHorizontal: spacing.md,

    maxWidth: 520,
    alignSelf: "center",

    marginTop: 24,
    marginBottom: 64,
  },

  introTitle: {
    color: theme.primary,

    fontSize: 52,
    lineHeight: 58,

    fontWeight: "900",

    textAlign: "center",

    letterSpacing: -1,
  },

  introTitleMobile: {
    fontSize: 32,
    lineHeight: 38,
  },

  introDescription: {
    color: theme.muted,

    fontSize: 15,
    lineHeight: 22,

    textAlign: "center",

    marginTop: 18,
    maxWidth: 420,
  },

  header: {
    minHeight: 46,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: spacing.md,
  },

  backButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: theme.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  backButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  backText: {
    color: theme.white,

    fontSize: 30,

    marginTop: -3,
  },

  headerCenter: {
    alignItems: "center",
    flex: 1,
  },

  headerTitle: {
    color: theme.primary,

    fontWeight: "900",

    fontSize: 15,
  },

  headerSubtitle: {
    color: theme.muted,

    fontSize: 11,

    marginTop: 2,
  },

  headerRightPlaceholder: {
    width: 38,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },

  questionNumber: {
    color: theme.accent,

    fontSize: 13,

    fontWeight: "900",

    textAlign: "center",

    marginBottom: spacing.sm,
  },

  question: {
    fontSize: 42,
    lineHeight: 48,

    fontWeight: "900",

    textAlign: "center",

    color: theme.text,

    letterSpacing: -0.8,
  },

  questionMobile: {
    fontSize: 28,
    lineHeight: 34,
  },

  button: {
    backgroundColor: theme.primary,

    paddingVertical: 17,

    borderRadius: radius.lg,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 56,

    width: "100%",
    maxWidth: 680,

    alignSelf: "center",
  },

  buttonPressed: {
    backgroundColor: theme.primaryDark,

    transform: [{ scale: 0.98 }],
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: theme.white,

    fontWeight: "900",

    fontSize: 15,
  },
});
