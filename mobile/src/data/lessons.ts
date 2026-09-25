/**
 * CryptoCoach Academy content (French version of lessons.py).
 * Each lesson = a few short cards, then a quiz.
 * "answer" is the index of the right choice (0 = first one).
 * Rewrite freely: the screens adapt automatically.
 */
export type Question = { question: string; choices: string[]; answer: number; explanation: string };
export type Lesson = { id: string; title: string; minutes: number; xp: number; cards: string[]; questions: Question[] };
export type Unit = { id: string; title: string; lessons: Lesson[] };

export const UNITS: Unit[] = [
  {
    id: 'basics',
    title: 'Les bases de la crypto',
    lessons: [
      {
        id: 'basics-1',
        title: "C'est quoi, une crypto ?",
        minutes: 3,
        xp: 10,
        cards: [
          "Une cryptomonnaie, c'est de l'argent 100 % numérique qu'aucune banque ni aucun État ne contrôle.",
          "Toutes les transactions sont notées dans un grand registre public : la blockchain. Tout le monde peut le consulter, personne ne peut le trafiquer.",
          "Son prix dépend uniquement de l'offre et de la demande. C'est pour ça qu'elle peut bouger de 10 % ou plus en une seule journée.",
        ],
        questions: [
          {
            question: 'Qui contrôle le Bitcoin ?',
            choices: ['Une banque centrale', 'Personne en particulier', "Le gouvernement américain"],
            answer: 1,
            explanation: "Le Bitcoin est décentralisé : le réseau tourne grâce à des milliers d'ordinateurs dans le monde.",
          },
          {
            question: "C'est quoi, la blockchain ?",
            choices: ['Un registre public des transactions', 'Un portefeuille crypto', 'Une appli de trading'],
            answer: 0,
            explanation: 'La blockchain garde la trace de chaque transaction, et tout le monde peut la vérifier.',
          },
          {
            question: 'Vrai ou faux : une crypto peut perdre 10 % en une journée.',
            choices: ['Vrai', 'Faux'],
            answer: 0,
            explanation: "Vrai. C'est justement pour ça qu'on n'investit que ce qu'on est prêt·e à perdre.",
          },
        ],
      },
      {
        id: 'basics-2',
        title: 'Bitcoin, Ethereum, Solana',
        minutes: 3,
        xp: 10,
        cards: [
          "Le Bitcoin, c'est un peu l'or numérique : il n'en existera jamais plus de 21 millions.",
          "Ethereum, c'est une plateforme pour créer des applications : contrats intelligents, NFT, finance décentralisée…",
          "Solana est plus rapide et moins chère, mais aussi plus jeune, donc plus risquée.",
        ],
        questions: [
          {
            question: 'Combien de bitcoins existeront au maximum ?',
            choices: ['Une infinité', '21 millions', '100 millions'],
            answer: 1,
            explanation: "Le nombre est limité à 21 millions, d'où la comparaison avec l'or.",
          },
          {
            question: 'Quelle blockchain est connue pour ses contrats intelligents ?',
            choices: ['Bitcoin', 'Ethereum', 'Aucune'],
            answer: 1,
            explanation: "Ethereum a popularisé les contrats intelligents : des programmes qui tournent sur la blockchain.",
          },
          {
            question: 'Vrai ou faux : une crypto récente est forcément plus sûre.',
            choices: ['Vrai', 'Faux'],
            answer: 1,
            explanation: "Faux. Un projet jeune est en général plus risqué, pas moins.",
          },
        ],
      },
    ],
  },
  {
    id: 'trading',
    title: 'Trader sans paniquer',
    lessons: [
      {
        id: 'trading-1',
        title: 'FOMO et vente panique',
        minutes: 3,
        xp: 15,
        cards: [
          "Le FOMO (fear of missing out), c'est acheter parce que tout le monde en parle… souvent juste après que le prix a déjà grimpé.",
          "La vente panique, c'est l'inverse : vendre en catastrophe après une baisse, ce qui rend la perte définitive.",
          "Les deux viennent des émotions. La parade : fixer tes règles AVANT d'acheter.",
        ],
        questions: [
          {
            question: 'Un pote te dit qu\'une crypto va « aller sur la Lune ». Le meilleur réflexe ?',
            choices: ['Tout investir maintenant', 'Faire mes propres recherches', "Emprunter pour en acheter plus"],
            answer: 1,
            explanation: "DYOR : Do Your Own Research. La hype, ce n'est pas une stratégie.",
          },
          {
            question: 'Ta crypto perd 15 % en un jour. La vente panique, c\'est…',
            choices: ['Vendre tout de suite par peur', 'Garder et revoir ton plan', 'En racheter un peu'],
            answer: 0,
            explanation: "Vendre par peur rend la perte définitive. Demande-toi si ta raison d'acheter a vraiment changé.",
          },
          {
            question: 'Quand faut-il fixer ses règles de sortie ?',
            choices: ['Après que le prix a bougé', "Avant d'acheter", 'Jamais'],
            answer: 1,
            explanation: "Décider à l'avance, c'est garder les émotions hors de tes décisions.",
          },
        ],
      },
      {
        id: 'trading-2',
        title: 'Le DCA, pas à pas',
        minutes: 3,
        xp: 15,
        cards: [
          "Le DCA (Dollar Cost Averaging), c'est investir la même somme à intervalles réguliers, par exemple 100 $ chaque mois.",
          "Tu achètes plus quand c'est bas, moins quand c'est haut, sans avoir à deviner le moment parfait.",
          "Ton prix moyen d'achat = total dépensé ÷ quantité achetée. CryptoCoach te l'affiche sur chaque crypto.",
        ],
        questions: [
          {
            question: 'Le DCA, ça veut dire…',
            choices: ["Tout investir d'un coup", 'Investir une somme fixe régulièrement', 'Acheter seulement pendant les baisses'],
            answer: 1,
            explanation: 'Le DCA étale tes achats dans le temps pour lisser les montagnes russes.',
          },
          {
            question: 'Tu as dépensé 2 000 $ pour 0,03 BTC. Ton prix moyen ?',
            choices: ['Environ 66 667 $', 'Environ 60 000 $', '2 000 $'],
            answer: 0,
            explanation: '2 000 ÷ 0,03 ≈ 66 667 $ par bitcoin.',
          },
          {
            question: 'Vrai ou faux : avec le DCA, il faut deviner le meilleur moment pour acheter.',
            choices: ['Vrai', 'Faux'],
            answer: 1,
            explanation: "Faux. C'est tout l'intérêt du DCA : pas besoin de timing.",
          },
        ],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Rester en sécurité',
    lessons: [
      {
        id: 'safety-1',
        title: 'Arnaques et sécurité',
        minutes: 3,
        xp: 15,
        cards: [
          "Ne partage JAMAIS ta phrase secrète (les 12 ou 24 mots de ton portefeuille). Celui qui l'a possède tes cryptos.",
          "Un rendement « garanti », c'est toujours une arnaque, surtout sur les réseaux sociaux ou en message privé.",
          "Active la double authentification (2FA) sur chaque compte de plateforme.",
        ],
        questions: [
          {
            question: 'Le « support » te demande ta phrase secrète. Tu fais quoi ?',
            choices: ['Je l\'envoie pour régler le problème', 'Je refuse : le support ne la demande jamais', "J'en envoie la moitié"],
            answer: 1,
            explanation: 'Aucun service sérieux ne te demandera jamais ta phrase secrète.',
          },
          {
            question: 'Un compte promet « +20 % garantis chaque semaine ». C\'est…',
            choices: ['Une super opportunité', 'Presque sûrement une arnaque', 'Normal en crypto'],
            answer: 1,
            explanation: "Aucun investissement ne peut garantir un gain. « Garanti », c'est le signal d'alarme n°1.",
          },
          {
            question: 'La 2FA, ça ajoute quoi à ton compte ?',
            choices: ['Une deuxième vérification', 'Plus de rendement', 'Moins de frais'],
            answer: 0,
            explanation: "La 2FA demande une deuxième preuve (code, appli) : un mot de passe volé ne suffit plus.",
          },
        ],
      },
    ],
  },
];

/** All lessons in the order they must be completed. */
export const ALL_LESSONS: Lesson[] = UNITS.flatMap((unit) => unit.lessons);

/** At least 2 right answers out of 3 to pass a lesson. */
export const PASS_RATIO = 2 / 3;
