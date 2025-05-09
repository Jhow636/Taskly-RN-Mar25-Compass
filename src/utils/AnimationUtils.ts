import { Animated } from "react-native";

export const calculateProgressBarWidth = (
    animatedProgress: Animated.Value,
    currentProgress: number,
    totalProgress: number,
  ) => {
    const progressPercentage = Math.min(
      1,
      totalProgress === 0 ? 0 : currentProgress / totalProgress,
    );
    Animated.timing(animatedProgress, {
      toValue: progressPercentage,
      duration: 900,
      useNativeDriver: false,
    }).start();

    const widthInterpolation = animatedProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return {widthInterpolation, progressPercentage};
  };