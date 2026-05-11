import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3FCFF",
  },

  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F3FCFF",
    flexDirection: "row",
  },

  cardMobile: {
    flex: 1,
    flexDirection: "column",
    borderRadius: 0,
    width: "100%",
    height: "100%",
  },

  form: {
    flex: 1,
    paddingHorizontal: 80,
    justifyContent: "center",
  },

  formMobile: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: 42,
    paddingBottom: 34,
    justifyContent: "flex-start",
  },

  logoSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 60,
    paddingBottom: 100,
  },

  mobileLogo: {
    width: 190,
    height: 145,
    alignSelf: "center",
    marginBottom: 8,
  },

  webLogo: {
    width: 600,
    height: 520,
    alignSelf: "center",
  },

  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#333",
    marginBottom: 50,
  },

  titleMobile: {
    fontSize: 46,
    fontWeight: "700",
    color: "#24364A",
    textAlign: "left",
    marginBottom: 50,
  },

  forgot: {
    alignSelf: "flex-end",
    marginTop: -12,
    marginBottom: 56,
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  signupText: {
    color: "#B3AAA5",
    fontSize: 13,
    fontWeight: "500",
  },

  signupLink: {
    color: "#24364A",
    fontSize: 13,
    fontWeight: "800",
  },
});
