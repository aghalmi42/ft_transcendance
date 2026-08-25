import type { HeroRole, EffectKind, EffectTarget, VisualEffectItem } from '../games/pong/types';

export type SupportedGameId = 'pong' | 'bricktris' | 'all';

export interface StoredInventoryItem extends VisualEffectItem {
  gameId?: SupportedGameId;
  gameTitle?: string;
  isEquipped?: boolean;
}

export interface UserWalletState {
  credits: number;
  stardust: number;
  pityCounter: number;
}

export const STORAGE_KEYS = {
  WALLET: 'transcendence_cosmetics_wallet_v1',
  INVENTORY: 'transcendence_cosmetics_inventory_v1',
  CHAMPIONS: 'transcendence_unlocked_champions_v1',
} as const;

export const DEFAULT_WALLET: UserWalletState = {
  credits: 3850,
  stardust: 180,
  pityCounter: 18,
};

export const getRequiredFusionCopies = (currentLevel: number): number => {
  if (currentLevel >= 5) return 0;
  return Math.pow(2, currentLevel);
};

export type RawItemTuple = [
  id: string,
  name: string,
  role: HeroRole,
  kind: EffectKind,
  rarity: 'COMMUN' | 'RARE' | 'ÉPIQUE' | 'LÉGENDAIRE' | 'MYTHIQUE',
  icon: string,
  desc: string,
  c1: string,
  c2?: string,
  dups?: number,
  isEquipped?: boolean,
  lvl?: number,
  isOwned?: boolean
];

export const RAW_ITEMS_DATA: RawItemTuple[] = [
  ['skin-shooter-default', 'Skin : Tireur Cyber-Prophète', 'SHOOTER', 'SKIN', 'COMMUN', '🎯', 'Châssis en titane anodisé cyan électrique avec visée laser.', '#06b6d4', '#22d3ee', 2, true, 1, true],
  ['skin-shooter-infernal-forge', 'Skin : Tireur Saphir Abyssal', 'SHOOTER', 'SKIN', 'ÉPIQUE', '💎', 'Châssis saphir sombre concentrant des tirs cobalt.', '#1d4ed8', '#3b82f6', 5, false, 2, true],
  ['skin-shooter-void-hunter', 'Skin : Tireur Prisme Cryogénique', 'SHOOTER', 'SKIN', 'LÉGENDAIRE', '❄️', 'Cristaux photoniques et tirs sous-zéro cyan cristallin.', '#67e8f9', '#0ea5e9', 3, false, 5, true],
  ['skin-shooter-lucian-prestige', 'Skin : Tireur Éclipse Plasma Suprême', 'SHOOTER', 'SKIN', 'MYTHIQUE', '🌟', 'Fusion bicolore active Cyan Électrique vers Bleu Cobalt.', '#06b6d4', '#3b82f6', 0, false, 3, false],

  ['weapon-shooter-blaster', 'Arme : Blaster Photonique MK-1', 'SHOOTER', 'WEAPON', 'COMMUN', '🔫', 'Pistolet blaster à verrouillage laser ultra-rapide.', '#06b6d4', '#22d3ee', 2, true, 1, true],
  ['weapon-shooter-dual-plasma', 'Arme : Dual Pistols Plasma Cobalt', 'SHOOTER', 'WEAPON', 'ÉPIQUE', '⚡', 'Paire de pistolets lasers à tir en rafale supersonique.', '#3b82f6', '#1d4ed8', 4, false, 2, true],
  ['weapon-shooter-laser-cannon', 'Arme : Canon à Particules Cryo-Néon', 'SHOOTER', 'WEAPON', 'LÉGENDAIRE', '💫', 'Canon lourd projetant des faisceaux de plasma réfrigérant.', '#0ea5e9', '#67e8f9', 2, false, 4, true],
  ['weapon-shooter-hyper-railgun', 'Arme : Railgun Stellaire Hypercharge', 'SHOOTER', 'WEAPON', 'MYTHIQUE', '🔥', 'Fusil magnétique tirant des éclairs d hyper-plasma pur.', '#38bdf8', '#0284c7', 0, false, 1, false],

  ['trail-shooter-cyan-pulse', 'Traînée : Faisceau Laser Cyan Pulsé', 'SHOOTER', 'TRAIL', 'COMMUN', '💫', 'Traînée d énergie cyan suivant fidèlement chaque projectile.', '#06b6d4', '#22d3ee', 2, true, 1, true],
  ['trail-shooter-cobalt-stream', 'Traînée : Flux Saphir Cobalt Luminescent', 'SHOOTER', 'TRAIL', 'ÉPIQUE', '✨', 'Flux énergétique dense laissant des traînées de plasma.', '#3b82f6', '#1d4ed8', 3, false, 3, true],
  ['trail-shooter-cryo-freeze', 'Traînée : Blizzard Cryogénique Céleste', 'SHOOTER', 'TRAIL', 'LÉGENDAIRE', '❄️', 'Givre instantané et cristaux polaires s effritant dans l espace.', '#67e8f9', '#0ea5e9', 1, false, 4, true],
  ['trail-shooter-hyper-laser', 'Traînée : Prisme Dual Hyper-Spectre', 'SHOOTER', 'TRAIL', 'MYTHIQUE', '🌈', 'Dégradé spectral dynamique Cyan et Bleu intense.', '#06b6d4', '#3b82f6', 0, false, 2, false],

  ['aura-shooter-matrix-holo', 'Aura : Viseur Holographique Tactique', 'SHOOTER', 'AURA', 'COMMUN', '🎯', 'Anneau de ciblage holographique tournoyant sous la raquette.', '#06b6d4', '#22d3ee', 2, true, 1, true],
  ['aura-shooter-pulse-ring', 'Aura : Onde de Focalisation Saphir', 'SHOOTER', 'AURA', 'ÉPIQUE', '🌀', 'Impulsions énergétiques régulières renforçant le champ de force.', '#3b82f6', '#1d4ed8', 3, false, 2, true],
  ['aura-shooter-supernova-field', 'Aura : Champ de Confinement Cryo', 'SHOOTER', 'AURA', 'LÉGENDAIRE', '🌌', 'Barrière subatomique émettant des vagues de froid néon.', '#67e8f9', '#0ea5e9', 2, false, 5, true],
  ['aura-shooter-singularity', 'Aura : Singularité Photonique Suprême', 'SHOOTER', 'AURA', 'MYTHIQUE', '👑', 'Pulsar stellaire bicolore déformant l espace environnant.', '#06b6d4', '#3b82f6', 0, false, 1, false],

  ['impact-shooter-spark-cyan', 'Impact : Gerbe d Étincelles Cyan', 'SHOOTER', 'IMPACT', 'COMMUN', '💥', 'Micro-détonations cyan éclatant à chaque contact de balle.', '#06b6d4', '#22d3ee', 2, true, 1, true],
  ['impact-shooter-burst-cobalt', 'Impact : Déflagration Saphir Électrique', 'SHOOTER', 'IMPACT', 'ÉPIQUE', '⚡', 'Arbres d éclairs bleus jaillissant au point d impact.', '#3b82f6', '#1d4ed8', 4, false, 3, true],
  ['impact-shooter-shatter-ice', 'Impact : Explosion de Glace Cryogénique', 'SHOOTER', 'IMPACT', 'LÉGENDAIRE', '💎', 'Éclats cristallins se dispersant avec onde de choc polaire.', '#67e8f9', '#0ea5e9', 1, false, 5, true],
  ['impact-shooter-plasma-nova', 'Impact : Supernova Photonique Ultime', 'SHOOTER', 'IMPACT', 'MYTHIQUE', '🌟', 'Mini-trou noir photonique implosant en flash bicolore.', '#06b6d4', '#3b82f6', 0, false, 2, false],

  ['skin-slayer-default', 'Skin : Pourfendeur Lame Sanglante', 'SLAYER', 'SKIN', 'COMMUN', '🗡️', 'Lames forgées dans le néant pourpre pour attaques furtives.', '#9333ea', '#c026d3', 2, true, 1, true],
  ['skin-slayer-cyber-ninja', 'Skin : Faucheur des Ombres Améthyste', 'SLAYER', 'SKIN', 'ÉPIQUE', '🥷', 'Silhouette ténébreuse tissée de brumes furtives.', '#6b21a8', '#7c3aed', 4, false, 2, true],
  ['skin-slayer-kayn-shadow', 'Skin : Assassin Crimson Sang-Pur', 'SLAYER', 'SKIN', 'LÉGENDAIRE', '🩸', 'Armure d assassin imprégnée d énergie rouge écarlate.', '#e11d48', '#fb7185', 3, false, 5, true],
  ['skin-slayer-void-prestige', 'Skin : Pourfendeur Néant-Écarlate Suprême', 'SLAYER', 'SKIN', 'MYTHIQUE', '👑', 'Fusion bicolore active Pourpre Obscur vers Rouge Sang.', '#a855f7', '#f43f5e', 0, false, 3, false],

  ['weapon-slayer-scythe-void', 'Arme : Faux Faucheuse d Âmes', 'SLAYER', 'WEAPON', 'COMMUN', '⚔️', 'Faux courbée imprégnée d énergie sombre.', '#9333ea', '#c026d3', 2, true, 1, true],
  ['weapon-slayer-twin-daggers', 'Arme : Dagues Jumelles Améthyste', 'SLAYER', 'WEAPON', 'ÉPIQUE', '🗡️', 'Paire de dagues rapides tranchant les défenses.', '#7c3aed', '#6b21a8', 3, false, 3, true],
  ['weapon-slayer-blood-katana', 'Arme : Katana Maudit Crimson Blood', 'SLAYER', 'WEAPON', 'LÉGENDAIRE', '🩸', 'Sabre tranchant libérant des lames d énergie rouge.', '#e11d48', '#f43f5e', 2, false, 4, true],
  ['weapon-slayer-abyssal-reaper', 'Arme : Grande Faux Exilée de l Abîme', 'SLAYER', 'WEAPON', 'MYTHIQUE', '💀', 'Faux géante déchirant la matière en éclairs pourpres.', '#a855f7', '#e11d48', 0, false, 2, false],

  ['skin-support-default', 'Skin : Gardien Émeraude Quantique', 'SUPPORT', 'SKIN', 'COMMUN', '🔮', 'Châssis émeraude émettant des ondes réparatrices.', '#10b981', '#34d399', 2, true, 1, true],
  ['skin-support-arcane-sage', 'Skin : Sage Jade Boréal', 'SUPPORT', 'SKIN', 'ÉPIQUE', '🌿', 'Armure protectrice entourée de runes bienveillantes.', '#059669', '#10b981', 4, false, 2, true],
  ['skin-support-celestial-priest', 'Skin : Oracle Ambre Solaire', 'SUPPORT', 'SKIN', 'LÉGENDAIRE', '☀️', 'Luminescence solaire dorée et orbes de soin.', '#f59e0b', '#fbbf24', 3, false, 5, true],
  ['skin-support-chrono-prestige', 'Skin : Gardien Émeraude-Or Suprême', 'SUPPORT', 'SKIN', 'MYTHIQUE', '⏳', 'Fusion bicolore active Vert Émeraude vers Or Solaire.', '#10b981', '#f59e0b', 0, false, 3, false],

  ['skin-tank-default', 'Skin : Colosse Mécha-Titane', 'TANK', 'SKIN', 'COMMUN', '🛡️', 'Blindage épais forgé en titane lourd orange magmatique.', '#f97316', '#fb923c', 2, true, 1, true],
  ['skin-tank-magma-behemoth', 'Skin : Titan Cuivre Tellurique', 'TANK', 'SKIN', 'ÉPIQUE', '🌋', 'Cuirasse renforcée d alliages volcaniques denses.', '#ea580c', '#c2410c', 5, false, 2, true],
  ['skin-tank-dreadnought', 'Skin : Bastion Cœur de Lave', 'TANK', 'SKIN', 'LÉGENDAIRE', '🔥', 'Forteresse mobile irradiant une chaleur magmatique.', '#dc2626', '#ea580c', 3, false, 5, true],
  ['skin-tank-infernal-prestige', 'Skin : Colosse Magma-Volcan Suprême', 'TANK', 'SKIN', 'MYTHIQUE', '👹', 'Fusion bicolore active Orange Magmatique vers Rouge Volcanique.', '#f97316', '#ef4444', 0, false, 3, false],

  ['weapon-tank-greatsword-titan', 'Arme : Claymore Mécha-Titane', 'TANK', 'WEAPON', 'COMMUN', '🗡️', 'Épée géante à double tranchant forgée en titane blindé.', '#f97316', '#fb923c', 2, true, 1, true],
  ['weapon-tank-blade-golden', 'Arme : Lame Sismique Cuivre Tellurique', 'TANK', 'WEAPON', 'ÉPIQUE', '⚔️', 'Espadon tellurique fracassant le sol et déstabilisant les balles.', '#ea580c', '#c2410c', 4, false, 2, true],
  ['weapon-tank-frost-broadsword', 'Arme : Espadon Cœur de Lave Volcanique', 'TANK', 'WEAPON', 'LÉGENDAIRE', '🌋', 'Lame incandescente irradiant une chaleur magmatique.', '#dc2626', '#ea580c', 3, false, 5, true],
  ['weapon-tank-infernal-blade', 'Arme : Lame Démoniaque Flammes d Enfer', 'TANK', 'WEAPON', 'MYTHIQUE', '🔥', 'Grande épée maudite consumant l énergie en flammes dorées.', '#f59e0b', '#ef4444', 0, false, 3, false],
];

export const buildItem = (t: RawItemTuple): StoredInventoryItem => {
  const starsMap = { COMMUN: 3, RARE: 3, ÉPIQUE: 4, LÉGENDAIRE: 5, MYTHIQUE: 6 };
  const priceMap = { COMMUN: 500, RARE: 700, ÉPIQUE: 950, LÉGENDAIRE: 1800, MYTHIQUE: 3200 };
  const target: EffectTarget = t[3] === 'TRAIL' || t[3] === 'IMPACT' ? 'BALL' : 'PADDLE';
  const c2 = t[8] || t[7];

  return {
    id: t[0],
    name: t[1],
    characterRole: t[2],
    target,
    kind: t[3],
    rarity: t[4],
    stars: starsMap[t[4]],
    level: t[11] ?? 1,
    duplicates: t[9] ?? 0,
    price: priceMap[t[4]],
    icon: t[5],
    description: t[6],
    primaryColor: t[7],
    secondaryColor: c2,
    glowColor: t[7],
    borderGradient: `from-[${t[7]}] to-[${c2}]`,
    previewBg: `bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950`,
    isOwned: t[12] ?? true,
    isEquipped: t[10] ?? false,
  };
};

export const DEFAULT_STARTER_INVENTORY: StoredInventoryItem[] = RAW_ITEMS_DATA.map(buildItem);
export const ALL_EFFECTS_ITEMS = DEFAULT_STARTER_INVENTORY;

export const getFortniteRarityTheme = (rarity: string) => {
  switch (rarity) {
    case 'MYTHIQUE':
      return {
        name: 'MYTHIQUE',
        border: 'border-yellow-400',
        borderGlow: 'shadow-[0_0_22px_rgba(250,204,21,0.45)]',
        cardBg: 'bg-gradient-to-b from-yellow-950/40 via-slate-950 to-slate-950',
        badgeBg: 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 font-black',
        accentText: 'text-yellow-400',
        tag: '👑 MYTHIQUE',
      };
    case 'LÉGENDAIRE':
      return {
        name: 'LÉGENDAIRE',
        border: 'border-amber-500',
        borderGlow: 'shadow-[0_0_18px_rgba(245,158,11,0.35)]',
        cardBg: 'bg-gradient-to-b from-amber-950/35 via-slate-950 to-slate-950',
        badgeBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black',
        accentText: 'text-amber-400',
        tag: '⚡ LÉGENDAIRE',
      };
    case 'ÉPIQUE':
      return {
        name: 'ÉPIQUE',
        border: 'border-purple-500',
        borderGlow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)]',
        cardBg: 'bg-gradient-to-b from-purple-950/35 via-slate-950 to-slate-950',
        badgeBg: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 text-white font-black',
        accentText: 'text-purple-400',
        tag: '🔮 ÉPIQUE',
      };
    case 'RARE':
      return {
        name: 'RARE',
        border: 'border-cyan-500',
        borderGlow: 'shadow-[0_0_16px_rgba(6,182,212,0.3)]',
        cardBg: 'bg-gradient-to-b from-cyan-950/30 via-slate-950 to-slate-950',
        badgeBg: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-black',
        accentText: 'text-cyan-400',
        tag: '💎 RARE',
      };
    case 'COMMUN':
    default:
      return {
        name: 'COMMUN',
        border: 'border-slate-600',
        borderGlow: 'shadow-[0_0_10px_rgba(148,163,184,0.12)]',
        cardBg: 'bg-slate-950/80',
        badgeBg: 'bg-slate-700 text-slate-200 font-bold',
        accentText: 'text-slate-300',
        tag: '⚪ COMMUN',
      };
  }
};
