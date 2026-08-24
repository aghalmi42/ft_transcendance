export type ChampionClass = 'STRIKER' | 'DEFENDER' | 'SHOOTER' | 'SUPPORT';

export interface ChampionSkill {
  id: string;
  name: string;
  key: 'Q' | 'E';
  description: string;
  cooldownMs: number;
  icon: string;
  color: string;
}

export interface Champion {
  id: string;
  name: string;
  title: string;
  classType: ChampionClass;
  icon: string;
  avatar: string;
  color: string;
  themeGlow: string;
  description: string;
  paddleColor: string;
  paddleSizeMultiplier: number;
  passive: {
    name: string;
    description: string;
  };
  skills: ChampionSkill[];
  stats: {
    speed: number;
    power: number;
    defense: number;
    control: number;
  };
}

export const CHAMPIONS_LIST: Champion[] = [
  {
    id: 'striker',
    name: 'Kaelen le Pourfendeur',
    title: 'Lame du Néon',
    classType: 'STRIKER',
    icon: '⚔️',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KaelenStriker',
    color: '#ef4444',
    themeGlow: 'rgba(239, 68, 68, 0.7)',
    paddleColor: '#f87171',
    paddleSizeMultiplier: 1.0,
    description: 'Combattant agressif axé sur la vitesse extrême et les smashs dévastateurs.',
    passive: {
      name: 'Frappe Furieuse',
      description: 'Chaque renvoi augmente la vitesse de la balle de +15%.',
    },
    skills: [
      {
        id: 'smash',
        name: 'Smash Éclair',
        key: 'Q',
        description: 'Propulse la balle à 200% de vitesse avec une trajectoire foudroyante.',
        cooldownMs: 6000,
        icon: '⚡',
        color: '#ef4444',
      },
      {
        id: 'blade_tempest',
        name: 'Tempête de Lames',
        key: 'E',
        description: 'Ultime : Clone la balle en 3 projectiles fantômes imprévisibles !',
        cooldownMs: 14000,
        icon: '🌪️',
        color: '#f97316',
      },
    ],
    stats: { speed: 90, power: 95, defense: 40, control: 60 },
  },
  {
    id: 'defender',
    name: 'Boran le Gardien',
    title: 'Rempart d’Aegis',
    classType: 'DEFENDER',
    icon: '🛡️',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BoranGuardian',
    color: '#3b82f6',
    themeGlow: 'rgba(59, 130, 246, 0.7)',
    paddleColor: '#60a5fa',
    paddleSizeMultiplier: 1.35,
    description: 'Mur défensif colossal capable de dresser des barrières infranchissables.',
    passive: {
      name: 'Blindage Renforcé',
      description: 'Raquette 35% plus large absorbant la puissance adverse.',
    },
    skills: [
      {
        id: 'barrier',
        name: 'Barrière Cyber',
        key: 'Q',
        description: 'Génère un bouclier d\'énergie en avant de la raquette pendant 3 secondes.',
        cooldownMs: 7000,
        icon: '🛡️',
        color: '#3b82f6',
      },
      {
        id: 'fortress',
        name: 'Forteresse Totale',
        key: 'E',
        description: 'Ultime : Érige un mur magnétique couvrant 100% du but pendant 4s.',
        cooldownMs: 16000,
        icon: '🏰',
        color: '#06b6d4',
      },
    ],
    stats: { speed: 50, power: 55, defense: 100, control: 75 },
  },
  {
    id: 'shooter',
    name: 'Vespera la Tireuse',
    title: 'Sniper Orbital',
    classType: 'SHOOTER',
    icon: '🎯',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VesperaShooter',
    color: '#10b981',
    themeGlow: 'rgba(16, 185, 129, 0.7)',
    paddleColor: '#34d399',
    paddleSizeMultiplier: 0.95,
    description: 'Tireuse de précision envoyant des lasers et guidant les trajectoires.',
    passive: {
      name: 'Viseur Holographique',
      description: 'Affiche la trajectoire prédictive exacte du rebond de balle.',
    },
    skills: [
      {
        id: 'laser_blast',
        name: 'Tir Laser',
        key: 'Q',
        description: 'Tire un rayon laser vers l\'adversaire pour désorienter sa position.',
        cooldownMs: 5000,
        icon: '🔫',
        color: '#10b981',
      },
      {
        id: 'orbital_cannon',
        name: 'Canon Orbital',
        key: 'E',
        description: 'Ultime : Fait tournoyer la balle dans une spirale électromagnétique.',
        cooldownMs: 13000,
        icon: '💥',
        color: '#14b8a6',
      },
    ],
    stats: { speed: 80, power: 85, defense: 45, control: 95 },
  },
  {
    id: 'support',
    name: 'Aurelia la Chronomancienne',
    title: 'Tisseuse du Temps',
    classType: 'SUPPORT',
    icon: '⏳',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AureliaSupport',
    color: '#a855f7',
    themeGlow: 'rgba(168, 85, 247, 0.7)',
    paddleColor: '#c084fc',
    paddleSizeMultiplier: 1.05,
    description: 'Mage temporelle contrôlant la physique, la vitesse et le gel adverse.',
    passive: {
      name: 'Dilatation Temporelle',
      description: 'Ralentit la balle de 30% lorsqu\'elle approche de votre raquette.',
    },
    skills: [
      {
        id: 'cryo_freeze',
        name: 'Gel Cryo',
        key: 'Q',
        description: 'Gèle la raquette ennemie pendant 1.5 seconde sur place.',
        cooldownMs: 8000,
        icon: '❄️',
        color: '#a855f7',
      },
      {
        id: 'gravity_vortex',
        name: 'Trou Noir Gravitationnel',
        key: 'E',
        description: 'Ultime : Attire la balle au centre de l\'arène puis la catapulte.',
        cooldownMs: 15000,
        icon: '🌌',
        color: '#ec4899',
      },
    ],
    stats: { speed: 70, power: 60, defense: 70, control: 100 },
  },
];
