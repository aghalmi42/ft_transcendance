import type { HeroRole, HeroConfig, MapTheme, MapConfig, ChampionSkin, ChampionVisualPreset } from './types';

export const MAP_CONFIGS: Record<MapTheme, MapConfig> = {
  CYBER: {
    id: 'CYBER',
    name: 'Faille Cyber-Néon',
    subtitle: 'Arène Standard Compétitive',
    icon: '🌌',
    bgGradient: '#020617',
    gridColor: '#1e1b4b',
    ambientColor: '#8b5cf6',
    hazardDesc: 'Terrain neutre sans obstacles. Précision et vitesse pures.',
    friction: 0.98
  },
  MAGMA: {
    id: 'MAGMA',
    name: 'Fonderie Magmatique',
    subtitle: 'Chaleur Volcanique & Éruptions',
    icon: '🌋',
    bgGradient: '#1c0505',
    gridColor: '#450a0a',
    ambientColor: '#f97316',
    hazardDesc: 'Geysers de lave au centre propulsant la balle et brûlant les intrus.',
    friction: 0.97
  },
  GLACIER: {
    id: 'GLACIER',
    name: 'Glacier Cryogénique',
    subtitle: 'Surfaces Glacées & Blizzard',
    icon: '❄️',
    bgGradient: '#031a24',
    gridColor: '#083344',
    ambientColor: '#06b6d4',
    hazardDesc: 'Sol ultra-glissant augmentant l élan et la vitesse de sprint.',
    friction: 0.998
  },
  REACTOR: {
    id: 'REACTOR',
    name: 'Centrale Quantum Plasma',
    subtitle: 'Noyau Électromagnétique',
    icon: '⚡',
    bgGradient: '#0a0d1a',
    gridColor: '#1e293b',
    ambientColor: '#38bdf8',
    hazardDesc: 'Bobine Tesla centrale attirant magnétiquement la balle !',
    friction: 0.98
  },
  SANCTUARY: {
    id: 'SANCTUARY',
    name: 'Sanctuaire d Ombre Sylvan',
    subtitle: 'Brouillard & Pierres Runiques',
    icon: '🌲',
    bgGradient: '#03140d',
    gridColor: '#064e3b',
    ambientColor: '#10b981',
    hazardDesc: 'Zones de buissons d ombre conférant une invisibilité temporaire.',
    friction: 0.98
  },
  PACMAN_MAZE: {
    id: 'PACMAN_MAZE',
    name: 'Labyrinthe Pacman Duel',
    subtitle: 'Pièces au Sol & Cage de But Néon',
    icon: '🟡',
    bgGradient: '#020617',
    gridColor: '#1e293b',
    ambientColor: '#facc15',
    hazardDesc: 'Pacman grandit en mangeant les pièces et la balle. Cage de but sur la droite.',
    friction: 0.98
  }
};

export const HERO_CONFIGS: Record<HeroRole, HeroConfig> = {
  SHOOTER: {
    role: 'SHOOTER',
    title: 'Tireur d Élite / Shooter',
    subtitle: 'Seul à Tirer des Projectiles à Distance',
    icon: '🎯',
    color: '#06b6d4',
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    paletteName: 'Cyan Électrique & Bleu Cobalt',
    badgeBg: 'bg-cyan-950/90 border-cyan-500/80 text-cyan-300',
    borderGlow: 'border-cyan-500 ring-cyan-500/50 shadow-cyan-500/30',
    cardGlow: 'hover:border-cyan-500 hover:shadow-cyan-500/20',
    description: 'Combattant à distance capable de harceler les ennemis et de lancer des salves meurtrières sans jamais s approcher.',
    maxHp: 90,
    initialShield: 10,
    speed: 8.2,
    paddleWidth: 14,
    paddleHeight: 65,
    attackTypeDesc: '🔫 Tirs de Projectiles [ESPACE] (Micro impact ±0.3 spd sur la balle)',
    canCrossBorderNormally: false,
    spells: {
      a: {
        id: 'SHOOTER_DOUBLE',
        key: 'A',
        name: 'Double Shot (2x Projectiles)',
        icon: '🔫',
        color: '#06b6d4',
        desc: 'Tire le double de vos projectiles actuels (2x vos cumuls Marksman) !',
        cooldownMs: 2000,
        bannerText: '🔫 DOUBLE SHOT (2X PROJECTILES) !'
      },
      z: {
        id: 'SHOOTER_PRECISION',
        key: 'Z',
        name: 'Magnet Aim (10s)',
        icon: '🎯',
        color: '#3b82f6',
        desc: 'Pendant 10s, tous vos tirs traquent magnétiquement votre cible. Appuyez sur [TAB] pour changer de cible !',
        cooldownMs: 4500,
        bannerText: '🎯 MAGNET AIM ACTIF (10s) — [TAB] POUR CHANGER DE CIBLE !'
      },
      e: {
        id: 'SHOOTER_STACKS',
        key: 'E',
        name: 'Marksman (Cumul jusqu\'à 5)',
        icon: '⚡',
        color: '#0284c7',
        desc: 'Activable (5s recharge) : Ajoute +1 projectile (jusqu\'à 5 max). Tant qu\'au moins 1 tir de la salve touche, vous gardez vos cumuls !',
        cooldownMs: 5000,
        bannerText: '⚡ MARKSMAN : +1 PROJECTILE (MAX 5) !'
      },
      r: {
        id: 'SHOOTER_CULLING',
        key: 'R',
        name: 'The Culling (Ultime)',
        icon: '🔥',
        color: '#38bdf8',
        desc: 'Barrage continu de lasers à cadence infernale. Si Magnet Aim est actif, tous les lasers traquent la cible !',
        cooldownMs: 8000,
        bannerText: '🔥 THE CULLING DÉVERSÉ !'
      }
    }
  },

  SLAYER: {
    role: 'SLAYER',
    title: 'Pourfendeur / Slayer',
    subtitle: 'Mêlée Circulaire 360° & Backstab Critique',
    icon: '🗡️',
    color: '#a855f7',
    primaryColor: '#a855f7',
    secondaryColor: '#f43f5e',
    paletteName: 'Pourpre Néant & Rouge Écarlate',
    badgeBg: 'bg-purple-950/90 border-purple-500/80 text-purple-300',
    borderGlow: 'border-purple-500 ring-purple-500/50 shadow-purple-500/30',
    cardGlow: 'hover:border-purple-500 hover:shadow-purple-500/20',
    description: 'Assassin ultra-rapide capable de traverser les lignes pour assassiner les cibles par derrière et smasher violemment la balle.',
    maxHp: 80,
    initialShield: 10,
    speed: 9.6,
    paddleWidth: 12,
    paddleHeight: 60,
    attackTypeDesc: '🗡️ Entaille en Cercle 360° [ESPACE] (Backstab Critique + Smash Balle)',
    canCrossBorderNormally: true,
    spells: {
      a: {
        id: 'SLAYER_BACKSTAB',
        key: 'A',
        name: 'Téléportation dans le Dos',
        icon: '🗡️',
        color: '#f43f5e',
        desc: 'Téléportation dans le dos d un ennemi à portée (Max 500u) + Coup critique de -55 PV ! (Ne s active pas si > 500u)',
        cooldownMs: 3800,
        bannerText: '🗡️ ASSAUT CRITIQUE DANS LE DOS (-55 PV) !'
      },
      z: {
        id: 'SLAYER_STEALTH',
        key: 'Z',
        name: 'Fumigène Furtif',
        icon: '👤',
        color: '#9333ea',
        desc: 'Devient invisible et intouchable aux tirs pendant 3.5s (+50% vitesse).',
        cooldownMs: 4500,
        bannerText: '👤 MODE FURTIF INVISIBLE ACTIVÉ !'
      },
      e: {
        id: 'SLAYER_DASH',
        key: 'E',
        name: 'Sweep Éclair & Poison',
        icon: '🌪️',
        color: '#c026d3',
        desc: 'Sweep fulgurant qui découpe les ennemis et balaye la balle en smash à 24.0 spd !',
        cooldownMs: 3500,
        bannerText: '🌪️ SWEEP FULGURANT & BALAYAGE BALLE !'
      },
      r: {
        id: 'SLAYER_ULTI',
        key: 'R',
        name: 'Danse des Lames Spectrale',
        icon: '🩸',
        color: '#e11d48',
        desc: 'Traque spectrale (8s) : invisibilité, super-vitesse et Backstab à -95 PV !',
        cooldownMs: 8500,
        bannerText: '🩸 ULTIME DANSE SPECTRALE DÉCLENCHÉE (8s) !'
      }
    }
  },

  SUPPORT: {
    role: 'SUPPORT',
    title: 'Enchanteur / Support',
    subtitle: 'Maître Gravitationnel & Guérisseur Céleste',
    icon: '🔮',
    color: '#10b981',
    primaryColor: '#10b981',
    secondaryColor: '#f59e0b',
    paletteName: 'Vert Émeraude & Or Céleste',
    badgeBg: 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300',
    borderGlow: 'border-emerald-500 ring-emerald-500/50 shadow-emerald-500/30',
    cardGlow: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
    description: 'Mage utilitaire capable de ralentir balle et ennemis, soigner ses alliés en zone et d invoquer un Trou Noir qui réanime les fantômes alliés.',
    maxHp: 110,
    initialShield: 35,
    speed: 7.6,
    paddleWidth: 15,
    paddleHeight: 74,
    attackTypeDesc: '💖 Onde Apaisante [ESPACE] (Ralentit tout ce qu elle touche & Soigne les alliés)',
    canCrossBorderNormally: true,
    spells: {
      a: {
        id: 'SUPP_GRAVITY_FIELD',
        key: 'A',
        name: 'Champ Gravitationnel',
        icon: '🌌',
        color: '#059669',
        desc: 'Crée un champ gravitationnel qui ralentit fortement les ennemis, la balle et les tirs adverses !',
        cooldownMs: 3200,
        bannerText: '🌌 CHAMP GRAVITATIONNEL DÉPLOYÉ (RALENTISSEMENT GÉNÉRAL) !'
      },
      z: {
        id: 'SUPP_DISPERSION',
        key: 'Z',
        name: 'Onde de Dispersion',
        icon: '💫',
        color: '#f59e0b',
        desc: 'Déflagration circulaire repoussant violemment tous les ennemis et la balle en 360° !',
        cooldownMs: 3000,
        bannerText: '💫 DISPERSION CIRCULAIRE EXPULSÉE !'
      },
      e: {
        id: 'SUPP_HEALING_ZONE',
        key: 'E',
        name: 'Sanctuaire de Soin',
        icon: '💖',
        color: '#10b981',
        desc: 'Canalisation de 1.0s créant une zone de soin intense pour tous les alliés !',
        cooldownMs: 4000,
        bannerText: '💖 SANCTUAIRE DE SOIN DÉPLOYÉ (SOIN CONTINU EN ZONE) !'
      },
      r: {
        id: 'SUPP_BLACK_HOLE',
        key: 'R',
        name: 'Trou Noir Cosmique (Ultime)',
        icon: '🕳️',
        color: '#fbbf24',
        desc: 'Trou Noir aspirant tout : double l efficacité des zones de soin et réanime les fantômes alliés aspirés !',
        cooldownMs: 8000,
        bannerText: '🕳️ TROU NOIR COSMIQUE : ASPIRATION & RÉANIMATION DES FANTÔMES ALLIÉS !'
      }
    }
  },

  TANK: {
    role: 'TANK',
    title: 'Colosse / Tank',
    subtitle: 'Mêlée Frontale Lourde & Dégâts Massifs',
    icon: '🛡️',
    color: '#f97316',
    primaryColor: '#f97316',
    secondaryColor: '#ef4444',
    paletteName: 'Orange Magmatique & Rouge Volcanique',
    badgeBg: 'bg-orange-950/90 border-orange-500/80 text-orange-300',
    borderGlow: 'border-orange-500 ring-orange-500/50 shadow-orange-500/30',
    cardGlow: 'hover:border-orange-500 hover:shadow-orange-500/20',
    description: 'Mur infranchissable capable de provoquer les ennemis et d absorber des milliers de points de dégâts pour son équipe.',
    maxHp: 240,
    initialShield: 80,
    speed: 4.9,
    paddleWidth: 22,
    paddleHeight: 100,
    attackTypeDesc: '🛡️ Frappe Lourde Frontale [ESPACE] (Lente, Dévastatrice -75 PV + Smash Directionnel)',
    canCrossBorderNormally: false,
    spells: {
      a: {
        id: 'TANK_TAUNT',
        key: 'A',
        name: 'Provocation Magnétique',
        icon: '💢',
        color: '#ef4444',
        desc: 'Attire violemment tous les ennemis, les projectiles et la balle vers le Tank !',
        cooldownMs: 3800,
        bannerText: '💢 PROVOCATION : ATTIRANCE DES ENNEMIS, BALLE ET TIRS !'
      },
      z: {
        id: 'TANK_WARCRY',
        key: 'Z',
        name: 'Cri de Guerre',
        icon: '🎺',
        color: '#f97316',
        desc: 'Octroie +100 Bouclier à toute l équipe (se dissipe sur 3 secondes).',
        cooldownMs: 4500,
        bannerText: '🎺 CRI DE GUERRE : +100 BOUCLIER D ÉQUIPE !'
      },
      e: {
        id: 'TANK_HARDEN',
        key: 'E',
        name: 'Durcissement Titanesque',
        icon: '🛡️',
        color: '#ea580c',
        desc: 'Ralenti la vitesse de déplacement mais confère +1000 PV de bouclier (disparaît en 3s) !',
        cooldownMs: 5500,
        bannerText: '🛡️ DURCISSEMENT : +1000 BOUCLIER & HYPER-ARMURE (3s) !'
      },
      r: {
        id: 'TANK_TITAN',
        key: 'R',
        name: 'Extension Titanesque (Ultime)',
        icon: '🗿',
        color: '#dc2626',
        desc: 'Grossit énormément (+80% taille) et augmente la portée et l effet de tous les sorts !',
        cooldownMs: 8000,
        bannerText: '🗿 EXTENSION TITANIQUE : TAILLE GÉANTE & SORTS DÉCUPLÉS (8s) !'
      }

    }
  }
};

type RawSkinTuple = [
  id: string,
  role: HeroRole,
  name: string,
  subtitle: string,
  rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE' | 'MYTHIQUE',
  c1: string,
  c2: string,
  icon: string,
  desc: string,
  bgType: 'matrix' | 'void' | 'inferno' | 'frost' | 'nebula' | 'gold'
];

const RAW_SKINS: RawSkinTuple[] = [

  ['skin-shooter-default', 'SHOOTER', 'Tireur Cyber-Prophète', 'Skin Par Défaut • Nuance Cyan Pur', 'COMMUN', '#06b6d4', '#22d3ee', '🎯', 'Châssis en titane anodisé cyan électrique avec visée laser.', 'matrix'],
  ['skin-shooter-infernal-forge', 'SHOOTER', 'Tireur Saphir Abyssal', 'Variante Nuance Cobalt Nuit', 'ÉPIQUE', '#1d4ed8', '#3b82f6', '💎', 'Châssis saphir sombre concentrant des tirs cobalt.', 'void'],
  ['skin-shooter-void-hunter', 'SHOOTER', 'Tireur Prisme Cryogénique', 'Variante Nuance Cyan Arctique', 'LÉGENDAIRE', '#67e8f9', '#0ea5e9', '❄️', 'Cristaux photoniques et projectiles sous-zéro cyan cristallin.', 'frost'],
  ['skin-shooter-lucian-prestige', 'SHOOTER', 'Tireur Éclipse Plasma Suprême', 'Gradient Bicolore Cyan ➔ Cobalt', 'MYTHIQUE', '#06b6d4', '#3b82f6', '🌟', 'Fusion bicolore active Cyan Électrique vers Bleu Cobalt.', 'nebula'],

  ['skin-slayer-default', 'SLAYER', 'Pourfendeur Lame Sanglante', 'Skin Par Défaut • Nuance Pourpre Pur', 'COMMUN', '#9333ea', '#c026d3', '🗡️', 'Lames forgées dans le néant pourpre pour attaques furtives.', 'inferno'],
  ['skin-slayer-cyber-ninja', 'SLAYER', 'Faucheur des Ombres Améthyste', 'Variante Nuance Pourpre Obscur', 'ÉPIQUE', '#6b21a8', '#7c3aed', '🥷', 'Silhouette ténébreuse tissée de brumes furtives.', 'void'],
  ['skin-slayer-kayn-shadow', 'SLAYER', 'Assassin Crimson Sang-Pur', 'Variante Nuance Rouge Écarlate', 'LÉGENDAIRE', '#e11d48', '#fb7185', '🩸', 'Armure d assassin imprégnée d énergie rouge écarlate.', 'inferno'],
  ['skin-slayer-void-prestige', 'SLAYER', 'Pourfendeur Néant-Écarlate Suprême', 'Gradient Bicolore Pourpre ➔ Rouge', 'MYTHIQUE', '#a855f7', '#f43f5e', '👑', 'Fusion bicolore active Pourpre Obscur vers Rouge Sang.', 'nebula'],

  ['skin-support-default', 'SUPPORT', 'Gardien Émeraude Quantique', 'Skin Par Défaut • Nuance Émeraude Pur', 'COMMUN', '#10b981', '#34d399', '🔮', 'Châssis émeraude émettant des ondes réparatrices.', 'matrix'],
  ['skin-support-arcane-sage', 'SUPPORT', 'Sage Jade Boréal', 'Variante Nuance Émeraude Boréale', 'ÉPIQUE', '#059669', '#10b981', '🌿', 'Armure protectrice entourée de runes bienveillantes.', 'frost'],
  ['skin-support-celestial-priest', 'SUPPORT', 'Oracle Ambre Solaire', 'Variante Nuance Or Solaire', 'LÉGENDAIRE', '#f59e0b', '#fbbf24', '☀️', 'Luminescence solaire dorée et orbes de soin.', 'gold'],
  ['skin-support-chrono-prestige', 'SUPPORT', 'Gardien Émeraude-Or Suprême', 'Gradient Bicolore Émeraude ➔ Or', 'MYTHIQUE', '#10b981', '#f59e0b', '⏳', 'Fusion bicolore active Vert Émeraude vers Or Solaire.', 'nebula'],

  ['skin-tank-default', 'TANK', 'Colosse Mécha-Titane', 'Skin Par Défaut • Nuance Orange Magma', 'COMMUN', '#f97316', '#fb923c', '🛡️', 'Blindage épais forgé en titane lourd orange magmatique.', 'inferno'],
  ['skin-tank-magma-behemoth', 'TANK', 'Titan Cuivre Tellurique', 'Variante Nuance Cuivre Tellurique', 'ÉPIQUE', '#ea580c', '#c2410c', '🌋', 'Cuirasse renforcée d alliages volcaniques denses.', 'void'],
  ['skin-tank-dreadnought', 'TANK', 'Bastion Cœur de Lave', 'Variante Nuance Rouge Volcanique', 'LÉGENDAIRE', '#dc2626', '#ea580c', '🔥', 'Forteresse mobile irradiant une chaleur magmatique.', 'inferno'],
  ['skin-tank-infernal-prestige', 'TANK', 'Colosse Magma-Volcan Suprême', 'Gradient Bicolore Orange ➔ Rouge', 'MYTHIQUE', '#f97316', '#ef4444', '👹', 'Fusion bicolore active Orange Magmatique vers Rouge Volcanique.', 'nebula'],
];

const makeSkin = (t: RawSkinTuple): ChampionSkin => ({
  id: t[0],
  role: t[1],
  name: t[2],
  subtitle: t[3],
  rarity: t[4],
  primaryColor: t[5],
  secondaryColor: t[6],
  glowColor: t[5],
  trailColor: `${t[5]}99`,
  icon: t[7],
  description: t[8],
  bgType: t[9],
  borderGradient: `from-[${t[5]}] to-[${t[6]}]`,
  bgGradient: `from-slate-950 via-slate-900 to-slate-950`,
});

export const CHAMPION_SKINS: Record<HeroRole, ChampionSkin[]> = {
  SHOOTER: RAW_SKINS.filter(s => s[1] === 'SHOOTER').map(makeSkin),
  SLAYER: RAW_SKINS.filter(s => s[1] === 'SLAYER').map(makeSkin),
  SUPPORT: RAW_SKINS.filter(s => s[1] === 'SUPPORT').map(makeSkin),
  TANK: RAW_SKINS.filter(s => s[1] === 'TANK').map(makeSkin),
};

export const CHAMPION_VISUAL_PRESETS: Record<HeroRole, ChampionVisualPreset[]> = {
  SHOOTER: [
    {
      id: 'preset-shooter-mythic-solar',
      role: 'SHOOTER',
      name: 'Tireur Éclipse Plasma Suprême',
      subtitle: 'Blaster Hyper-Prisme & Nébuleuse',
      rarity: 'MYTHIQUE',
      icon: '🌟',
      description: 'Fusion bicolore suprême avec faisceaux lasers holographiques.',
      primaryColor: '#06b6d4',
      secondaryColor: '#3b82f6',
      glowColor: '#38bdf8',
      trailColor: '#06b6d4',
      bgType: 'nebula',
      paddleSkinId: 'skin-shooter-lucian-prestige',
      paddleSkinName: 'Tireur Éclipse Plasma Suprême',
      weaponId: 'weapon-shooter-nebula-prism',
      weaponName: 'Blaster Hyper-Prisme Nébuleuse',
      weaponIcon: '🌌',
      weaponColor1: '#ec4899',
      weaponColor2: '#06b6d4',
      weaponGlow: '#f43f5e',
      auraName: 'Visée Holographique Céleste (Niv. 4)',
      glowName: 'Néon Cyber-Cyan 2099 (Niv. 5)',
      trailName: 'Comète Stellaire Cyan (Niv. 3)',
    }
  ],
  SLAYER: [
    {
      id: 'preset-slayer-mythic-void',
      role: 'SLAYER',
      name: 'Pourfendeur Nécro-Crimson Suprême',
      subtitle: 'Lames Jumelles Spectre & Vortex',
      rarity: 'MYTHIQUE',
      icon: '👑',
      description: 'Fusion bicolore suprême avec brumes spectrales de sang.',
      primaryColor: '#a855f7',
      secondaryColor: '#f43f5e',
      glowColor: '#e11d48',
      trailColor: '#f43f5e',
      bgType: 'nebula',
      paddleSkinId: 'skin-slayer-gold-reaper',
      paddleSkinName: 'Pourfendeur Nécro-Crimson Suprême',
      weaponId: 'weapon-slayer-chroma-void',
      weaponName: 'Lames Jumelles Spectre Cosmique',
      weaponIcon: '💠',
      weaponColor1: '#7c3aed',
      weaponColor2: '#f43f5e',
      weaponGlow: '#a855f7',
      auraName: 'Vortex Néant Obscur (Niv. 2)',
      glowName: 'Lame Démoniaque Incandescente (Niv. 5)',
      trailName: 'Brume Sanglante d Assassin (Niv. 3)',
    }
  ],
  SUPPORT: [
    {
      id: 'preset-support-mythic-aurora',
      role: 'SUPPORT',
      name: 'Archange Temporel Aurique Suprême',
      subtitle: 'Sceptre Aurore Boréale & Anneaux Quantiques',
      rarity: 'MYTHIQUE',
      icon: '⏳',
      description: 'Fusion bicolore suprême avec résonances temporelles.',
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      glowColor: '#fbbf24',
      trailColor: '#10b981',
      bgType: 'nebula',
      paddleSkinId: 'skin-support-chronos',
      paddleSkinName: 'Archange Temporel Aurique Suprême',
      weaponId: 'weapon-support-aurora-borealis',
      weaponName: 'Sceptre Aurore Boréale Stellaire',
      weaponIcon: '🌟',
      weaponColor1: '#14b8a6',
      weaponColor2: '#8b5cf6',
      weaponGlow: '#38bdf8',
      auraName: 'Anneaux Quantiques Orbitaux (Niv. 2)',
      glowName: 'Matrice Cyber-Émeraude (Niv. 3)',
      trailName: 'Ondes Réparatrices Célestes (Niv. 3)',
    }
  ],
  TANK: [
    {
      id: 'preset-tank-mythic-supernova',
      role: 'TANK',
      name: 'Titan Forteresse Volcanique Suprême',
      subtitle: 'Espadon Supernova & Bouclier Gravitationnel',
      rarity: 'MYTHIQUE',
      icon: '👹',
      description: 'Fusion bicolore suprême avec ondes sismiques telluriques.',
      primaryColor: '#f97316',
      secondaryColor: '#ef4444',
      glowColor: '#ef4444',
      trailColor: '#f97316',
      bgType: 'nebula',
      paddleSkinId: 'skin-tank-infernal-demon',
      paddleSkinName: 'Titan Forteresse Volcanique Suprême',
      weaponId: 'weapon-tank-supernova-blade',
      weaponName: 'Espadon Supernova Cosmique',
      weaponIcon: '⚡',
      weaponColor1: '#fbbf24',
      weaponColor2: '#9333ea',
      weaponGlow: '#fb923c',
      auraName: 'Bouclier Magnétique Renforcé (Niv. 1)',
      glowName: 'Lueur Or Impérial Prestige (Niv. 5)',
      trailName: 'Coulée de Lave Volcanique (Niv. 3)',
    },
  ],
};
