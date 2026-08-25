export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type ItemCategory = 'CHAMPION' | 'PADDLE_SKIN' | 'BALL_TRAIL' | 'TITLE' | 'AVATAR_AURA';

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string;
  description: string;
  previewUrl?: string;
  themeColor: string;
  dropRatePercent: number;
}

export interface MysteryBoxBanner {
  id: string;
  title: string;
  subtitle: string;
  costCoins: number;
  costTickets: number;
  featuredItem: ShopItem;
  pool: ShopItem[];
}

export const SHOP_ITEMS_POOL: ShopItem[] = [

  {
    id: 'kaelen_cyber_striker',
    name: 'Kaelen Cyber-Samouraï',
    category: 'CHAMPION',
    rarity: 'LEGENDARY',
    icon: '⚔️',
    description: 'Héros Légendaire : Débloque la classe Pourfendeur et ses smashs foudroyants.',
    themeColor: '#ef4444',
    dropRatePercent: 2.5,
  },
  {
    id: 'aurelia_cosmic_support',
    name: 'Aurelia Stellaire',
    category: 'CHAMPION',
    rarity: 'LEGENDARY',
    icon: '⏳',
    description: 'Héros Légendaire : Débloque la classe Chronomancienne et le Vortex cosmique.',
    themeColor: '#a855f7',
    dropRatePercent: 2.5,
  },
  {
    id: 'skin_neon_dragon',
    name: 'Raquette Dragon Cybernétique',
    category: 'PADDLE_SKIN',
    rarity: 'LEGENDARY',
    icon: '🐉',
    description: 'Skin de raquette avec bordure dorée scintillante et aura draconique.',
    themeColor: '#eab308',
    dropRatePercent: 3.0,
  },

  {
    id: 'boran_aegis_tank',
    name: 'Boran le Rempart',
    category: 'CHAMPION',
    rarity: 'EPIC',
    icon: '🛡️',
    description: 'Héros Épique : Débloque la classe Défenseur avec bouclier électrostatique.',
    themeColor: '#3b82f6',
    dropRatePercent: 12.0,
  },
  {
    id: 'vespera_sniper',
    name: 'Vespera Tireuse d\'Élite',
    category: 'CHAMPION',
    rarity: 'EPIC',
    icon: '🎯',
    description: 'Héros Épique : Débloque la classe Tireuse avec lasers de guidage vert émeraude.',
    themeColor: '#10b981',
    dropRatePercent: 12.0,
  },
  {
    id: 'trail_rainbow_neon',
    name: 'Traînée Comète Arc-en-ciel',
    category: 'BALL_TRAIL',
    rarity: 'EPIC',
    icon: '🌈',
    description: 'Laisse une traînée polychrome lumineuse derrière chaque tir de balle.',
    themeColor: '#ec4899',
    dropRatePercent: 15.0,
  },

  {
    id: 'paddle_synthwave',
    name: 'Raquette Synthwave 80s',
    category: 'PADDLE_SKIN',
    rarity: 'RARE',
    icon: '🏓',
    description: 'Palette aux teintes violettes et roses rétro-futuristes.',
    themeColor: '#c084fc',
    dropRatePercent: 25.0,
  },
  {
    id: 'title_pong_god',
    name: 'Titre : Maître des Arènes',
    category: 'TITLE',
    rarity: 'RARE',
    icon: '👑',
    description: 'Affiche un badge de prestige sous votre pseudonyme en jeu.',
    themeColor: '#38bdf8',
    dropRatePercent: 28.0,
  },

  {
    id: 'paddle_matrix_green',
    name: 'Raquette Matrix Classique',
    category: 'PADDLE_SKIN',
    rarity: 'COMMON',
    icon: '🟩',
    description: 'Skin vert émeraude minimaliste rétro.',
    themeColor: '#22c55e',
    dropRatePercent: 50.0,
  },
  {
    id: 'trail_cyan_spark',
    name: 'Étincelles Cyan',
    category: 'BALL_TRAIL',
    rarity: 'COMMON',
    icon: '✨',
    description: 'Effet de petites particules bleutées lors des rebonds.',
    themeColor: '#06b6d4',
    dropRatePercent: 50.0,
  },
];

export const MYSTERY_BANNERS: MysteryBoxBanner[] = [
  {
    id: 'banner_champions',
    title: '⚔️ Coffre des Héros & Combattants',
    subtitle: 'Taux augmenté pour Kaelen (Pourfendeur) et Aurelia (Support) !',
    costCoins: 250,
    costTickets: 1,
    featuredItem: SHOP_ITEMS_POOL[0],
    pool: SHOP_ITEMS_POOL,
  },
  {
    id: 'banner_cosmetics',
    title: '✨ Coffre d\'Auras & Skins Cyber',
    subtitle: 'Skins de raquettes animées, particules de balle et titres rares.',
    costCoins: 150,
    costTickets: 1,
    featuredItem: SHOP_ITEMS_POOL[2],
    pool: SHOP_ITEMS_POOL.filter((i) => i.category !== 'CHAMPION'),
  },
];
