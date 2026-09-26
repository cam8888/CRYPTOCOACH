/**
 * CryptoCoach Academy content (French version of lessons.py).
 * Each lesson = a few short cards, then a quiz.
 * "answer" is the index of the right choice (0 = first one).
 * Rewrite freely: the screens adapt automatically.
 */
export type Question = { question: string; choices: string[]; answer: number; explanation: string };
export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  xp: number;
  cards: string[];
  questions: Question[];
  kind?: 'lesson' | 'exam'; // 'exam' = the bigger quiz at the end of a unit
};
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
      {
        id: 'basics-exam',
        kind: 'exam',
        title: "Défi de l'unité : les bases",
        minutes: 4,
        xp: 30,
        cards: [],
        questions: [
          {
            question: "Ta cousine te dit : « Le Bitcoin, c'est la banque de France qui le gère. » Tu lui réponds…",
            choices: ["Oui, comme l'euro", 'Non, aucune banque ni aucun État ne le contrôle', 'Non, c\'est Elon Musk', 'Oui, depuis 2020'],
            answer: 1,
            explanation: 'Le Bitcoin est décentralisé : il tourne sur des milliers d\'ordinateurs, sans patron.',
          },
          {
            question: "Pourquoi dit-on que la blockchain est difficile à trafiquer ?",
            choices: ['Parce qu\'elle est secrète', 'Parce qu\'elle est publique et vérifiée par tout le réseau', 'Parce qu\'elle est stockée dans une banque', 'Parce qu\'elle est gratuite'],
            answer: 1,
            explanation: 'Tout le monde a une copie du registre : modifier une ligne, ce serait devoir convaincre tout le réseau.',
          },
          {
            question: "Le Bitcoin passe de 60 000 $ à 54 000 $ en une journée. C'est…",
            choices: ['Impossible', 'Une baisse de 10 %, fréquente en crypto', 'Une baisse de 6 %', 'La preuve que c\'est fini'],
            answer: 1,
            explanation: '6 000 ÷ 60 000 = 10 %. Ce genre de mouvement arrive régulièrement : c\'est la volatilité.',
          },
          {
            question: "Laquelle de ces cryptos a une quantité maximale fixée à l'avance ?",
            choices: ['Bitcoin', 'Ethereum', 'Solana', 'Aucune'],
            answer: 0,
            explanation: 'Il n\'existera jamais plus de 21 millions de bitcoins.',
          },
          {
            question: 'Tu as 1 000 € d\'économies pour tes études. Combien mettre en crypto ?',
            choices: ['Tout, pour maximiser les gains', 'Seulement ce que tu peux te permettre de perdre', 'Emprunter en plus', 'Tout sur la crypto la plus récente'],
            answer: 1,
            explanation: 'La règle d\'or : n\'investir que l\'argent dont tu n\'as pas besoin, parce que tu peux le perdre.',
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
      {
        id: 'trading-exam',
        kind: 'exam',
        title: "Défi de l'unité : trader sans paniquer",
        minutes: 4,
        xp: 30,
        cards: [],
        questions: [
          {
            question: 'Une crypto a pris +80 % cette semaine et tout TikTok en parle. Le piège ?',
            choices: ['Le FOMO : acheter tout en haut', 'La vente panique', 'Le DCA', 'Il n\'y a aucun piège'],
            answer: 0,
            explanation: 'Acheter parce que tout le monde en parle, souvent après la hausse, c\'est le FOMO.',
          },
          {
            question: 'Tu achètes 500 $ de BTC à 50 000 $, puis 500 $ à 25 000 $. Ton prix moyen ?',
            choices: ['37 500 $', 'Environ 33 333 $', '25 000 $', '50 000 $'],
            answer: 1,
            explanation: '0,01 + 0,02 = 0,03 BTC pour 1 000 $. 1 000 ÷ 0,03 ≈ 33 333 $ : tu as acheté plus quand c\'était bas.',
          },
          {
            question: 'Ton plan : « Je garde mon ETH au moins 1 an. » Il baisse de 20 % en 2 jours. Tu…',
            choices: ['Vends tout pour limiter la casse', 'Relis ton plan : rien n\'a changé, tu gardes', 'Achètes une autre crypto en panique', 'Supprimes l\'appli'],
            answer: 1,
            explanation: 'Si ta raison d\'investir n\'a pas changé, une baisse ne suffit pas à vendre. C\'est pour ça qu\'on fixe son plan avant.',
          },
          {
            question: 'Laquelle de ces stratégies est du DCA ?',
            choices: ['Mettre 1 200 $ d\'un coup en janvier', 'Mettre 100 $ le 1er de chaque mois', 'Acheter uniquement quand un influenceur le dit', 'Vendre dès que ça baisse'],
            answer: 1,
            explanation: 'Même somme, à intervalles réguliers : c\'est exactement le DCA.',
          },
          {
            question: 'Tu revends à 40 000 $ un BTC acheté 50 000 $ en moyenne. Résultat ?',
            choices: ['Un gain de 20 %', 'Une perte de 20 %', 'Une perte de 10 %', 'Ni gain ni perte'],
            answer: 1,
            explanation: '40 000 ÷ 50 000 − 1 = −20 %. En vendant, la perte devient définitive.',
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
      {
        id: 'safety-exam',
        kind: 'exam',
        title: "Défi de l'unité : rester en sécurité",
        minutes: 4,
        xp: 30,
        cards: [],
        questions: [
          {
            question: 'Un compte « officiel » annonce : « Envoie 1 ETH, on t\'en renvoie 2 ! » C\'est…',
            choices: ['Un cadeau promotionnel', 'Une arnaque classique', 'Un airdrop normal', 'Une erreur de frappe'],
            answer: 1,
            explanation: 'Personne ne double ton argent. Ces faux « giveaways » sont l\'arnaque crypto la plus répandue.',
          },
          {
            question: 'Tu reçois un mail : « Ton compte va être bloqué, connecte-toi ici. » Le bon réflexe ?',
            choices: ['Cliquer vite pour éviter le blocage', 'Ouvrir toi-même l\'appli officielle, sans cliquer sur le lien', 'Répondre avec ton mot de passe', 'Transférer le mail à tes amis'],
            answer: 1,
            explanation: 'C\'est du phishing : les faux liens copient le vrai site pour voler tes identifiants.',
          },
          {
            question: 'Où garder ta phrase secrète de 12 mots ?',
            choices: ['En photo dans ta galerie', 'Écrite sur papier, rangée en lieu sûr', 'Dans tes notes partagées', 'Envoyée à toi-même par mail'],
            answer: 1,
            explanation: 'Hors ligne, c\'est le plus sûr : une photo ou un mail peuvent être piratés.',
          },
          {
            question: 'Quel est le signal d\'alarme n°1 d\'une arnaque ?',
            choices: ['Un gain « garanti »', 'Un site en anglais', 'Des frais de transaction', 'Un prix qui bouge'],
            answer: 0,
            explanation: 'Aucun investissement réel ne peut garantir un gain.',
          },
          {
            question: 'Ton mot de passe a fuité, mais tu as activé la 2FA. Que se passe-t-il ?',
            choices: ['Le pirate entre quand même', 'Le pirate est bloqué sans ton deuxième code', 'Ton compte est supprimé', 'Rien ne change'],
            answer: 1,
            explanation: 'Avec la 2FA, le mot de passe seul ne suffit plus : c\'est ta deuxième barrière.',
          },
        ],
      },
    ],
  },
];

/** All lessons in the order they must be completed. */
export const ALL_LESSONS: Lesson[] = UNITS.flatMap((unit) => unit.lessons);

/** To pass: 2 right answers out of 3 for a lesson, 4 out of 5 for a unit challenge. */
export function passRatio(lesson: Lesson): number {
  return lesson.kind === 'exam' ? 0.8 : 2 / 3;
}

/** Virtual dollars added to the portfolio the first time a lesson is passed. */
export function cashReward(lesson: Lesson): number {
  return lesson.kind === 'exam' ? 1000 : 500;
}
