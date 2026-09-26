/** Phone vibrations, in one place. They never crash the app if unavailable. */
import * as Haptics from 'expo-haptics';

export const vibrate = {
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  lesson: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  bump: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};
