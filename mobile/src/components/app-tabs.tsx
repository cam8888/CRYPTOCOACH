import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Brand } from '@/constants/brand';

/** The bottom tab bar: Accueil, Trader, Coach, Apprendre. */
export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Brand.background}
      tintColor={Brand.primary}
      labelStyle={{ selected: { color: Brand.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="trade">
        <NativeTabs.Trigger.Label>Trader</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="arrow.left.arrow.right" md="swap_horiz" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="coach">
        <NativeTabs.Trigger.Label>Coach</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} md="chat" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="learn">
        <NativeTabs.Trigger.Label>Apprendre</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'graduationcap', selected: 'graduationcap.fill' }} md="school" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
