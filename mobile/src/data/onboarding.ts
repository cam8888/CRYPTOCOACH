/**
 * The 3 intro pages shown the very first time the app is opened.
 * Edit the texts here to make them sound like you.
 */
export type OnboardingPage = {
  icon: { ios: string; android: string; web: string };
  title: string;
  text: string;
};

export const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
    title: 'Pourquoi CryptoCoach ?',
    text: "On a pu créer cette app dans le but de rendre la crypto accessible à tout le monde, sans jargon et sans risquer ton argent. Étant nous-mêmes étudiantes et débutantes il n'y a pas si longtemps, on sait ce que c'est : les mots compliqués, la peur de se tromper, les conseils douteux sur les réseaux. On a voulu créer l'outil qu'on aurait aimé avoir. On espère que ça te plaira !",
  },
  {
    icon: { ios: 'lightbulb.fill', android: 'lightbulb', web: 'lightbulb' },
    title: 'Comment ça fonctionne ?',
    text: "Eh bien, c'est simple ! Tu reçois 10 000 $ fictifs et tu achètes ou vends de vraies cryptos, au vrai prix du marché. Après chaque trade, ton coach t'explique si tu as gagné ou perdu, et pourquoi. Et pour progresser, des leçons de 3 minutes façon Duolingo t'attendent dans l'onglet Apprendre.",
  },
  {
    icon: { ios: 'person.2.fill', android: 'group', web: 'group' },
    title: 'Fait pour toi si…',
    text: "Tu es curieux·se de la crypto mais tu n'y connais rien, tu as peur de perdre ton argent, ou tu veux juste comprendre de quoi tout le monde parle. On part de zéro, ensemble.",
  },
];
