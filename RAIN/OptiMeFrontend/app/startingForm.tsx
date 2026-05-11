import {
  View,
  Text,
  Animated,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_URL } from "@/services/api";
import { startingQuestions } from "@/data/startingQuestions";
import ScaleQuestion from "@/components/questions/ScaleQuestion";
import SingleChoiceQuestion from "@/components/questions/SingleChoiceQuestion";
import ProgressBar from "@/components/questions/ProgressBar";
import { colors } from "@/constants/theme";
import { styles } from "@/styles/startingForm.styles";
import { useToast } from "@/context/ToastContext";
import { router } from "expo-router";

const theme = colors.light;

type Answers = Record<string, string | number>;

export default function StartingForm() {
  const { showToast } = useToast();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isIntro = currentIndex === -1;
  const isLastQuestion = currentIndex === startingQuestions.length - 1;
  const currentQuestion = isIntro ? null : startingQuestions[currentIndex];

  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const progressValue = isIntro
    ? 0
    : (currentIndex + 1) / startingQuestions.length;

  const progressPercent = Math.round(progressValue * 100);
  const canGoBack = currentIndex > 0;
  const buttonDisabled = isSubmitting;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [progressValue, progressAnim]);

  useEffect(() => {
    questionAnim.setValue(0);

    Animated.timing(questionAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, questionAnim]);

  const logo = Platform.select({
    ios: require("@/assets/images/just_circle.png"),
    android: require("@/assets/images/just_circle.png"),
    web: require("@/assets/images/logo_final_web.svg"),
  });

  const logoStyle = isMobile ? styles.mobileLogo : styles.webLogo;

  const handleSelect = (value: string | number) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = async () => {
    if (isIntro) {
      setCurrentIndex(0);
      return;
    }

    if (selectedAnswer === undefined || selectedAnswer === "") {
      showToast("Please select an answer before continuing.", "info");
      return;
    }

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    await submitForm();
  };

  const handleBack = () => {
    if (isSubmitting) return;

    if (canGoBack) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);

      console.log("FORM DATA:", answers);

      const response = await fetch(`${API_URL}/user/startingForm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(answers),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || "Form submitted successfully.", "success");

        router.replace("/auth/login"); // home kasneje -> /(tabs)/home
      } else {
        showToast(data.message || "Something went wrong.", "error");
      }
    } catch (error) {
      showToast("Could not connect to backend.", "error");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.card, isMobile && styles.cardMobile]}>
          <View style={[styles.form, isMobile && styles.formMobile]}>
            {isIntro ? (
              <>
                <View style={styles.contentWrapper}>
                  <View style={styles.logoSection}>
                    <Image
                      source={logo}
                      style={logoStyle}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.introCenter}>
                    <Text
                      style={[styles.title, isMobile && styles.titleMobile]}
                    >
                      Personal assessment
                    </Text>

                    <Text
                      style={[
                        styles.introTitle,
                        isMobile && styles.introTitleMobile,
                      ]}
                    >
                      Let’s get to know{"\n"}you better
                    </Text>

                    <Text style={styles.introDescription}>
                      Answer a few quick questions so we can personalize your
                      experience.
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleNext}
                >
                  <Text style={styles.buttonText}>Start assessment</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.header}>
                  <Pressable
                    disabled={!canGoBack}
                    onPress={handleBack}
                    style={({ pressed }) => [
                      styles.backButton,
                      !canGoBack && styles.backButtonDisabled,
                      pressed && canGoBack && styles.backButtonPressed,
                    ]}
                  >
                    <Text style={styles.backText}>‹</Text>
                  </Pressable>

                  <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Assessment</Text>
                    <Text style={styles.headerSubtitle}>
                      Question {currentIndex + 1} of {startingQuestions.length}
                    </Text>
                  </View>
                </View>

                <ProgressBar progress={progressAnim} />

                <Animated.View
                  style={[
                    styles.content,
                    {
                      opacity: questionAnim,
                      transform: [
                        {
                          translateY: questionAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [18, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.questionNumber}>
                    {String(currentIndex + 1).padStart(2, "0")}
                  </Text>

                  <Text
                    style={[styles.question, isMobile && styles.questionMobile]}
                  >
                    {currentQuestion?.question}
                  </Text>

                  {currentQuestion?.type === "scale" ? (
                    <ScaleQuestion
                      options={currentQuestion.options}
                      selected={selectedAnswer as number}
                      onSelect={handleSelect}
                    />
                  ) : (
                    <SingleChoiceQuestion
                      options={currentQuestion?.options ?? []}
                      selected={selectedAnswer as string}
                      onSelect={handleSelect}
                    />
                  )}
                </Animated.View>
                <Pressable
                  disabled={buttonDisabled}
                  style={({ pressed }) => [
                    styles.button,
                    buttonDisabled && styles.buttonDisabled,
                    pressed && !buttonDisabled && styles.buttonPressed,
                  ]}
                  onPress={handleNext}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.white} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLastQuestion ? "Finish" : "Continue"}
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
