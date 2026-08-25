import React, { useState, useRef, useEffect } from 'react';
import { soundEffects } from '../../services/audio';
import type { HeroRole, EffectKind, EffectTarget } from '../../games/pong/types';
import { cosmeticsStore, DEFAULT_STARTER_INVENTORY, ALL_EFFECTS_ITEMS, getFortniteRarityTheme } from '../../services/cosmeticsStore';
import type { StoredInventoryItem } from '../../services/cosmeticsStore';

export type CosmeticEffectItem = StoredInventoryItem;

export interface GachaPullResult {
  type: 'EFFECT' | 'STARDUST';
  item?: CosmeticEffectItem;
  stardustAmount?: number;
  stardustTierName?: string;
  isNew?: boolean;
}

export interface GachaBanner {
  id: string;
  title: string;
  subtitle: string;
  gameId?: 'pong' | 'shootactoe' | 'all';
  gameTitle?: string;
  characterRole?: HeroRole;
  featuredItem?: CosmeticEffectItem;
  featuredItems?: CosmeticEffectItem[];
  bannerGradient: string;
  accentColor: string;
  tag: string;
  endsInDays: number;
}

export interface ChampionRecruitSpell {
  key: string;
  name: string;
  desc: string;
  icon: string;
}

export interface ChampionRecruitInfo {
  role: HeroRole;
  title: string;
  subtitle: string;
  icon: string;
  badgeBg: string;
  stardustPrice: number;
  description: string;
  spells: ChampionRecruitSpell[];
}

const RECRUITABLE_CHAMPIONS: ChampionRecruitInfo[] = [
  {
    role: 'SHOOTER',
    title: "Tireur d'Élite",
    subtitle: 'Canonnier Plasma & Laser',
    icon: '🎯',
    badgeBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
    stardustPrice: 50,
    description: 'Combattant à distance tirant des lasers et guidant ses balles à distance.',
    spells: [
      { key: 'A', name: 'Laser Plasma', desc: 'Tir laser fulgurant qui traverse les obstacles', icon: '⚡' },
      { key: 'Z', name: 'Tir Guidé', desc: 'Balle guidée par impulsion électromagnétique', icon: '🎯' },
      { key: 'E', name: 'Balise de Détection', desc: 'Zone révélant les angles de rebond idéaux', icon: '📡' },
      { key: 'R', name: 'Barrage Orbital', desc: 'Pluie de micro-projectiles destructeurs', icon: '☄️' },
    ],
  },
  {
    role: 'SLAYER',
    title: 'Pourfendeur Lame-Ombre',
    subtitle: 'Assassin & Frappe Critique',
    icon: '🗡️',
    badgeBg: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
    stardustPrice: 100,
    description: 'Assassin ultra-rapide se téléportant et assénant des frappes critiques.',
    spells: [
      { key: 'A', name: 'Frappe Fulgurante', desc: 'Smash accéléré instantané +200% vitesse', icon: '⚡' },
      { key: 'Z', name: 'Pas Ténébreux', desc: 'Téléportation instantanée vers la balle', icon: '🥷' },
      { key: 'E', name: 'Danse des Lames', desc: 'Tourbillon repoussant tous les tirs', icon: '🌀' },
      { key: 'R', name: 'Exécution du Néant', desc: 'Dédoublement d\'orbes fantômes mortels', icon: '🩸' },
    ],
  },
  {
    role: 'SUPPORT',
    title: 'Support Quantique',
    subtitle: 'Gardien & Soins Stellaires',
    icon: '✨',
    badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
    stardustPrice: 100,
    description: 'Protecteur créant des puits de gravité et régénérant les boucliers.',
    spells: [
      { key: 'A', name: 'Gel Cryogénique', desc: 'Ralentit la balle et gèle l\'adversaire', icon: '❄️' },
      { key: 'Z', name: 'Puits de Gravité', desc: 'Attire les balles vers le centre du terrain', icon: '🌌' },
      { key: 'E', name: 'Barrière Stellaire', desc: 'Bouclier énergétique bloquant un tir', icon: '🛡️' },
      { key: 'R', name: 'Aurore Boréale', desc: 'Zone de régénération massive de points', icon: '🌟' },
    ],
  },
  {
    role: 'TANK',
    title: 'Colosse Titan',
    subtitle: 'Rempart & Onde Sismique',
    icon: '🛡️',
    badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
    stardustPrice: 150,
    description: 'Titan indestructible repoussant les assauts et créant des forteresses.',
    spells: [
      { key: 'A', name: 'Mur d\'Adamantium', desc: 'Élève un mur solide impénétrable sur la ligne', icon: '🧱' },
      { key: 'Z', name: 'Onde Sismique', desc: 'Onde de choc déviant toutes les trajectoires', icon: '💥' },
      { key: 'E', name: 'Forteresse Blindée', desc: 'Agrandit la raquette de +50% pendant 6s', icon: '🛡️' },
      { key: 'R', name: 'Supernova', desc: 'Explosion dévastatrice couvrant tout le demi-terrain', icon: '🌋' },
    ],
  },
];

const GACHA_BANNERS: GachaBanner[] = [
  {
    id: 'pack-multiverse',
    title: '🌌 BANNIÈRE MULTIVERS (TIRAGE TOUS JEUX)',
    subtitle: 'Tirage aléatoire mondial mélangeant skins et effets de Pong RPG, BrickTris 2v2 et de toute la plateforme !',
    gameId: 'all',
    gameTitle: 'Multi-Jeux Universel',
    featuredItem: ALL_EFFECTS_ITEMS[0],
    featuredItems: [ALL_EFFECTS_ITEMS[0], ALL_EFFECTS_ITEMS[5], ALL_EFFECTS_ITEMS[9], ALL_EFFECTS_ITEMS[13]],
    bannerGradient: 'from-violet-950 via-slate-950 to-cyan-950',
    accentColor: '#38bdf8',
    tag: '🌌 TOUS LES JEUX MÉLANGÉS',
    endsInDays: 30,
  },
  {
    id: 'pack-shooter',
    title: '🎯 PACK EFFETS : TIREUR D\'ÉLITE (MARKSMAN)',
    subtitle: 'Tirage d\'effets exclusifs au Tireur ou de Poussière Céleste (pour débloquer les Champions)',
    gameId: 'pong',
    gameTitle: 'Pong RPG',
    characterRole: 'SHOOTER',
    featuredItem: ALL_EFFECTS_ITEMS[0],
    featuredItems: [ALL_EFFECTS_ITEMS[0], ALL_EFFECTS_ITEMS[1], ALL_EFFECTS_ITEMS[2], ALL_EFFECTS_ITEMS[4]],
    bannerGradient: 'from-cyan-950 via-slate-950 to-indigo-950',
    accentColor: '#38bdf8',
    tag: '🎯 EXCLUSIF PONG • TIREUR',
    endsInDays: 14,
  },
  {
    id: 'pack-slayer',
    title: '🗡️ PACK EFFETS : POURFENDEUR (ASSASSIN)',
    subtitle: 'Tirage d\'effets exclusifs au Pourfendeur ou de Poussière Céleste (pour débloquer les Champions)',
    gameId: 'pong',
    gameTitle: 'Pong RPG',
    characterRole: 'SLAYER',
    featuredItem: ALL_EFFECTS_ITEMS[5],
    featuredItems: [ALL_EFFECTS_ITEMS[5], ALL_EFFECTS_ITEMS[6], ALL_EFFECTS_ITEMS[7], ALL_EFFECTS_ITEMS[8]],
    bannerGradient: 'from-rose-950 via-slate-950 to-purple-950',
    accentColor: '#f43f5e',
    tag: '🗡️ EXCLUSIF PONG • POURFENDEUR',
    endsInDays: 14,
  },
  {
    id: 'pack-support',
    title: '✨ PACK EFFETS : SUPPORT QUANTIQUE (GARDIEN)',
    subtitle: 'Tirage d\'effets exclusifs au Support ou de Poussière Céleste (pour débloquer les Champions)',
    gameId: 'pong',
    gameTitle: 'Pong RPG',
    characterRole: 'SUPPORT',
    featuredItem: ALL_EFFECTS_ITEMS[9],
    featuredItems: [ALL_EFFECTS_ITEMS[9], ALL_EFFECTS_ITEMS[10], ALL_EFFECTS_ITEMS[11], ALL_EFFECTS_ITEMS[12]],
    bannerGradient: 'from-emerald-950 via-slate-950 to-teal-950',
    accentColor: '#10b981',
    tag: '✨ EXCLUSIF PONG • SUPPORT',
    endsInDays: 14,
  },
  {
    id: 'pack-tank',
    title: '🛡️ PACK EFFETS : COLOSSE TITAN (JUGGERNAUT)',
    subtitle: 'Tirage d\'effets exclusifs au Titan ou de Poussière Céleste (pour débloquer les Champions)',
    gameId: 'pong',
    gameTitle: 'Pong RPG',
    characterRole: 'TANK',
    featuredItem: ALL_EFFECTS_ITEMS[13],
    featuredItems: [ALL_EFFECTS_ITEMS[13], ALL_EFFECTS_ITEMS[14], ALL_EFFECTS_ITEMS[15], ALL_EFFECTS_ITEMS[16]],
    bannerGradient: 'from-amber-950 via-slate-950 to-yellow-950',
    accentColor: '#eab308',
    tag: '🛡️ EXCLUSIF PONG • TITAN',
    endsInDays: 14,
  },
];

interface ShopViewProps {
  onNavigate?: (tab: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onNavigate }) => {

  const [mainVolet, setMainVolet] = useState<'GACHA' | 'BOUTIQUE' | 'CHAMPIONS'>('GACHA');

  const [selectedEffectKind, setSelectedEffectKind] = useState<'ALL' | EffectKind>('ALL');
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<'ALL' | HeroRole>('ALL');

  const [wallet, setWallet] = useState(cosmeticsStore.getWallet());
  const [unlockedChampions, setUnlockedChampions] = useState<HeroRole[]>(cosmeticsStore.getUnlockedChampions());
  const [inventory, setInventory] = useState<StoredInventoryItem[]>(cosmeticsStore.getInventory());

  useEffect(() => {
    const unsub = cosmeticsStore.subscribe(() => {
      setWallet(cosmeticsStore.getWallet());
      setUnlockedChampions(cosmeticsStore.getUnlockedChampions());
      setInventory(cosmeticsStore.getInventory());
    });
    return unsub;
  }, []);

  const credits = wallet.credits;
  const stardust = wallet.stardust;
  const pityCounter = wallet.pityCounter;

  const [selectedGameShop, setSelectedGameShop] = useState<'pong' | 'shootactoe' | 'snakeouttheflag'>('pong');
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);

  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [summonStage, setSummonStage] = useState<'METEOR' | 'REVEAL' | 'DONE'>('DONE');
  const [pulledResults, setPulledResults] = useState<GachaPullResult[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [highestRarityPulled, setHighestRarityPulled] = useState<'MYTHIQUE' | 'LÉGENDAIRE' | 'ÉPIQUE' | 'RARE'>('RARE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [previewItem, setPreviewItem] = useState<CosmeticEffectItem>(ALL_EFFECTS_ITEMS[0]);
  const [cheatGemsAmount, setCheatGemsAmount] = useState<number>(1000);

  const activeBanner = GACHA_BANNERS[activeBannerIndex];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuyCheatGems = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = Number(cheatGemsAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('❌ Veuillez entrer un montant valide supérieur à 0.');
      return;
    }
    cosmeticsStore.addCredits(amount);
    soundEffects.playPowerUp();
    showToast(`💎 +${amount.toLocaleString()} Gems ajoutées à votre compte !`);
  };

  const executePull = (pullCount: number) => {
    const cost = pullCount === 1 ? 160 : 1440;

    if (credits < cost) {
      soundEffects.playDefeat();
      showToast(`❌ Crédits insuffisants ! Il vous manque ${cost - credits} 💎 Crédits.`);
      return;
    }

    soundEffects.playPowerUp();

    const bannerItems = activeBanner.gameId === 'all'
      ? inventory.filter(it => (it.kind as string) !== 'PULSE')
      : (activeBanner.gameId as string) === 'shootactoe'
      ? inventory.filter(it => (it.gameId as string) === 'shootactoe')
      : inventory.filter(it => it.characterRole === activeBanner.characterRole);

    const results: GachaPullResult[] = [];
    let currentPity = pityCounter + pullCount;
    let highestRarity: 'MYTHIQUE' | 'LÉGENDAIRE' | 'ÉPIQUE' | 'RARE' = 'RARE';
    let totalGainedStardust = 0;
    let updatedInventory = [...inventory];

    for (let i = 0; i < pullCount; i++) {

      const isGuaranteedEffect = pullCount === 10 && i === pullCount - 1;
      const isStardustDrop = Math.random() < 0.50 && !isGuaranteedEffect && currentPity < 50;

      if (isStardustDrop) {

        const randStardust = Math.random() * 100;
        let amount = 25;
        let tierName = 'Fragment Stellaire (+25 🌟)';

        if (randStardust < 10) {
          amount = 100;
          tierName = 'Prisme Céleste (+100 🌟)';
          if (highestRarity === 'RARE') highestRarity = 'ÉPIQUE';
        } else if (randStardust < 35) {
          amount = 50;
          tierName = 'Amas d\'Éther (+50 🌟)';
        }

        totalGainedStardust += amount;
        results.push({
          type: 'STARDUST',
          stardustAmount: amount,
          stardustTierName: tierName,
        });
      } else {

        const rand = Math.random() * 100;
        let chosenRarity: 'MYTHIQUE' | 'LÉGENDAIRE' | 'ÉPIQUE' | 'RARE' = 'RARE';

        if (currentPity >= 50) {
          chosenRarity = 'MYTHIQUE';
          currentPity = 0;
        } else if (rand < 3.5) {
          chosenRarity = 'MYTHIQUE';
          currentPity = 0;
        } else if (rand < 15.0) {
          chosenRarity = 'LÉGENDAIRE';
        } else if (rand < 45.0 || isGuaranteedEffect) {
          chosenRarity = 'ÉPIQUE';
        } else {
          chosenRarity = 'RARE';
        }

        const candidates = bannerItems.filter(it => it.rarity === chosenRarity);
        const selectedItem = candidates[Math.floor(Math.random() * candidates.length)] || bannerItems[Math.floor(Math.random() * bannerItems.length)] || inventory[0];

        if (chosenRarity === 'MYTHIQUE') highestRarity = 'MYTHIQUE';
        else if (chosenRarity === 'LÉGENDAIRE' && highestRarity !== 'MYTHIQUE') highestRarity = 'LÉGENDAIRE';
        else if (chosenRarity === 'ÉPIQUE' && highestRarity === 'RARE') highestRarity = 'ÉPIQUE';

        const existingIdx = updatedInventory.findIndex(it => it.id === selectedItem.id);
        if (existingIdx !== -1 && updatedInventory[existingIdx].isOwned) {

          updatedInventory[existingIdx] = {
            ...updatedInventory[existingIdx],
            duplicates: (updatedInventory[existingIdx].duplicates || 0) + 1,
          };
          results.push({ type: 'EFFECT', item: selectedItem, isNew: false });
        } else {

          if (existingIdx !== -1) {
            updatedInventory[existingIdx] = {
              ...updatedInventory[existingIdx],
              isOwned: true,
              level: 1,
              duplicates: 0,
            };
          }
          results.push({ type: 'EFFECT', item: selectedItem, isNew: true });
        }
      }
    }

    cosmeticsStore.updateWallet({
      credits: credits - cost,
      stardust: stardust + totalGainedStardust,
      pityCounter: currentPity,
    });
    cosmeticsStore.saveInventory(updatedInventory);

    setPulledResults(results);
    setHighestRarityPulled(highestRarity);
    setRevealedIndices([]);
    setIsSummoning(true);
    setSummonStage('METEOR');

    setTimeout(() => {
      setSummonStage('REVEAL');
      soundEffects.playVictory();
    }, 2400);
  };

  const handleBuy = (item: CosmeticEffectItem) => {
    if (credits < item.price) {
      soundEffects.playDefeat();
      showToast(`❌ Crédits insuffisants ! Il vous manque ${item.price - credits} 💎 Crédits.`);
      return;
    }

    cosmeticsStore.updateWallet({ credits: credits - item.price });
    const updated = inventory.map(it => it.id === item.id ? { ...it, isOwned: true, isEquipped: true } : it);
    cosmeticsStore.saveInventory(updated);

    soundEffects.playScore();
    showToast(`🎉 Effet « ${item.name} » débloqué pour votre ${item.characterRole} !`);
  };

  const handleEquip = (item: CosmeticEffectItem) => {
    const willEquip = !item.isEquipped;
    cosmeticsStore.equipItem(item.id, item.characterRole, item.kind, willEquip, item.target);
    setInventory(cosmeticsStore.getInventory());
    if (willEquip) {
      soundEffects.playScore();
      showToast(`✨ « ${item.name} » équipé sur votre ${item.characterRole} !`);
    } else {
      soundEffects.playClick();
      showToast(`🚫 « ${item.name} » retiré.`);
    }
  };

  const handleUnlockChampion = (champ: ChampionRecruitInfo) => {
    if (unlockedChampions.includes(champ.role)) return;

    if (stardust < champ.stardustPrice) {
      soundEffects.playDefeat();
      showToast(`❌ Poussière d'étoiles insuffisante ! Il vous manque ${champ.stardustPrice - stardust} 🌟.`);
      return;
    }

    const ok = cosmeticsStore.unlockChampion(champ.role, champ.stardustPrice);
    if (ok) {
      soundEffects.playVictory();
      showToast(`👑 Champion « ${champ.title} » débloqué avec succès ! Vous pouvez désormais l'incarner !`);
    }
  };

  const [shopOwnershipFilter, setShopOwnershipFilter] = useState<'ALL' | 'OWNED' | 'LOCKED'>('ALL');

  const boutiqueFilteredItems = inventory.filter(it => {
    if (selectedEffectKind !== 'ALL' && it.kind !== selectedEffectKind) return false;
    if (selectedCharacterFilter !== 'ALL' && it.characterRole !== selectedCharacterFilter) return false;
    if (shopOwnershipFilter === 'OWNED' && !it.isOwned) return false;
    if (shopOwnershipFilter === 'LOCKED' && it.isOwned) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 my-4 text-left font-sans animate-fade-in pb-16">

      {}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="z-10 space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-black uppercase tracking-wider">
            <span>🛍️ MAGASIN & BOUTIQUE COSMÉTIQUE 🌟</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Magasin
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Obtenez des <strong>Effets Visuels</strong> ou de la <strong>Poussière d'Étoiles (🌟)</strong> dans les packs pour débloquer les 4 Champions de l'arène !
          </p>
        </div>

        {}
        <div className="z-10 flex flex-wrap items-center gap-2.5">
          {}
          <form
            onSubmit={handleBuyCheatGems}
            className="flex items-center gap-1.5 bg-slate-950/90 border border-violet-500/50 p-1 rounded-xl shadow-md"
          >
            <input
              type="number"
              min="1"
              max="10000000"
              value={cheatGemsAmount}
              onChange={(e) => setCheatGemsAmount(Math.max(1, parseInt(e.target.value) || 0))}
              placeholder="1000"
              className="w-20 sm:w-24 bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-black text-xs px-2.5 py-1.5 rounded-xl text-center focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Ajouter instantanément les Gems à votre solde"
            >
              <span>⚡</span>
              <span>Acheter {cheatGemsAmount || 0} Gems</span>
            </button>
          </form>

          {}
          <div className="flex items-center space-x-2 bg-slate-950/80 border border-cyan-500/40 px-4 py-2 rounded-2xl shadow-inner">
            <span className="text-xl">💎</span>
            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-400 block font-bold">GEMS / CRÉDITS</span>
              <span className="text-sm font-black text-cyan-300">{credits.toLocaleString()}</span>
            </div>
          </div>

          <div
            onClick={() => setMainVolet('CHAMPIONS')}
            className="flex items-center space-x-2 bg-slate-950/80 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-inner cursor-pointer hover:border-amber-400 transition-colors"
          >
            <span className="text-xl animate-pulse">🌟</span>
            <div className="text-left font-mono">
              <span className="text-[10px] text-amber-400 block font-bold">POUSSIÈRE (CHAMPIONS)</span>
              <span className="text-sm font-black text-amber-300">{stardust} 🌟</span>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('inventory')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <span>🎒</span>
              <span>Mon Casier & Fusion</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase mr-2 hidden sm:inline">
          Boutique par Jeu :
        </span>
        {[
          { id: 'pong', label: '🏓 Pong RPG & Pacman Goal', isReady: true, badge: 'Disponible' },
          { id: 'shootactoe', label: '🚀 ShooTacToe', isReady: false, badge: 'En dév' },
          { id: 'snakeouttheflag', label: '🐍 Snake CTF', isReady: false, badge: 'En dév' },
        ].map((tab) => {
          const isSelected = selectedGameShop === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedGameShop(tab.id as any);
                soundEffects.playClick();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  tab.isReady
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {selectedGameShop !== 'pong' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl animate-fade-in my-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl shadow-inner animate-pulse">
            {selectedGameShop === 'shootactoe' ? '🚀' : '🐍'}
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/40 inline-block uppercase">
              ⚠️ Module en cours de développement
            </span>
            <h2 className="text-xl font-black text-white">
              Boutique {selectedGameShop === 'shootactoe' ? 'ShooTacToe Dominion' : 'Snake Out the Flag'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seule la boutique officielle de Pong RPG est actuellement disponible. Les cosmétiques et effets pour ce jeu sont en cours de création par l'équipe.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSelectedGameShop('pong');
                soundEffects.playClick();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              ← Revenir à la Boutique Pong RPG (Disponible)
            </button>
          </div>
        </div>
      ) : (
        <>
          {}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          {}
          <button
            onClick={() => {
              setMainVolet('GACHA');
              soundEffects.playClick();
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 border ${
              mainVolet === 'GACHA'
                ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 border-fuchsia-400 text-white shadow-xl shadow-fuchsia-600/30 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🎰 Volet 1 : Packs Gacha (Effets ou Poussière 🌟)</span>
          </button>

          {}
          <button
            onClick={() => {
              setMainVolet('BOUTIQUE');
              soundEffects.playClick();
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 border ${
              mainVolet === 'BOUTIQUE'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 border-cyan-400 text-white shadow-xl shadow-cyan-600/30 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>🛍️ Volet 2 : Boutique Directe d'Effets</span>
          </button>

          {}
          <button
            onClick={() => {
              setMainVolet('CHAMPIONS');
              soundEffects.playClick();
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 border ${
              mainVolet === 'CHAMPIONS'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 border-amber-300 text-slate-950 shadow-xl shadow-amber-500/30 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <span>👑 Volet 3 : Sanctuaire des Champions (🌟 {stardust})</span>
          </button>
        </div>

        {}
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-xl">
          <span className="text-amber-400">⚡ Pity Garantie :</span>
          <span className="font-bold text-white">{50 - pityCounter} tirages avant Mythique garanti !</span>
        </div>
      </div>

      {}
      {toastMessage && (
        <div className="bg-indigo-950/95 border border-indigo-500 text-indigo-200 px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center justify-between animate-bounce">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-3">✕</button>
        </div>
      )}

      {}
      {}
      {}
      {mainVolet === 'GACHA' && (
        <div className="space-y-6 animate-fade-in">
          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GACHA_BANNERS.map((banner, idx) => {
              const isSelected = activeBannerIndex === idx;
              return (
                <button
                  key={banner.id}
                  onClick={() => {
                    setActiveBannerIndex(idx);
                    soundEffects.playClick();
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900/90 border-fuchsia-500 ring-2 ring-fuchsia-500/50 shadow-xl shadow-fuchsia-600/20 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-3xl">{banner.featuredItem.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block truncate">
                      {banner.tag}
                    </span>
                    <h4 className="text-xs font-black text-white truncate">{banner.title.split(':')[1] || banner.title}</h4>
                    <span className="text-[10px] text-slate-400 block font-mono">Effets ou Poussière 🌟</span>
                  </div>
                </button>
              );
            })}
          </div>

          {}
          <div className={`p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative overflow-hidden bg-gradient-to-br ${activeBanner.bannerGradient}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/50 border border-white/20 text-[11px] font-mono font-bold text-amber-300">
                  <span>🌟</span>
                  <span>{activeBanner.tag}</span>
                  <span>•</span>
                  <span>Expire dans {activeBanner.endsInDays} jours</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {activeBanner.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                  {activeBanner.subtitle}
                </p>

                {}
                <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center space-x-3 text-xs">
                  <span className="text-2xl">🌟</span>
                  <div className="text-slate-300 font-mono text-[11px]">
                    <strong className="text-amber-400">Deux types de récompenses :</strong> Soit un <strong>Effet Visuel</strong> du pack, soit de la <strong>Poussière d'Étoiles (🌟)</strong> pour débloquer les 4 Champions dans le Sanctuaire !
                  </div>
                </div>

                {}
                <div className="pt-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">
                    EFFETS VEDETTES DU PACK :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {activeBanner.featuredItems.map(it => (
                      <div key={it.id} className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1 backdrop-blur-sm">
                        <span className="text-2xl block">{it.icon}</span>
                        <h5 className="text-[11px] font-bold text-white truncate">{it.name}</h5>
                        <span className="text-[9px] font-mono font-black text-amber-400 block">{it.rarity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => executePull(1)}
                    className="px-6 py-3.5 bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer flex items-center space-x-2"
                  >
                    <span>Invoquer 1x</span>
                    <span className="text-cyan-400 font-mono font-black">💎 160</span>
                  </button>

                  <button
                    onClick={() => executePull(10)}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-fuchsia-600 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl hover:scale-105 transition-transform cursor-pointer flex items-center space-x-2 border border-amber-400/50"
                  >
                    <span>⚡ INVOQUER 10x (4★ Garanti)</span>
                    <span className="text-amber-200 font-mono font-black">💎 1,440</span>
                  </button>
                </div>
              </div>

              {}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-spin" />
                  <div
                    className="w-44 h-44 rounded-full blur-3xl opacity-60 animate-pulse"
                    style={{ backgroundColor: activeBanner.accentColor }}
                  />
                  <div className="w-40 h-40 rounded-3xl bg-slate-950/80 border-2 border-amber-400/70 flex items-center justify-center text-6xl shadow-2xl relative z-10">
                    <span>{activeBanner.featuredItem.icon}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300">
                    {'★'.repeat(activeBanner.featuredItem.stars)} {activeBanner.featuredItem.rarity}
                  </span>
                  <h3 className="text-lg font-black text-white">{activeBanner.featuredItem.name}</h3>
                  <p className="text-xs text-slate-300 max-w-xs">{activeBanner.featuredItem.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {}
      {}
      {mainVolet === 'BOUTIQUE' && (
        <div className="space-y-6 animate-fade-in">
          {}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              FILTRER PAR CATÉGORIE D'EFFET :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: 'ALL' as const, label: 'Tous les Effets', icon: '✨' },
                { id: 'SKIN' as const, label: 'Skins de Barre', icon: '🎨' },
                { id: 'WEAPON' as const, label: 'Armes de Combat', icon: '⚔️' },
                { id: 'TRAIL' as const, label: 'Traînées (Trails)', icon: '💫' },
                { id: 'AURA' as const, label: 'Auras & Halos', icon: '🕊️' },
                { id: 'GLOW' as const, label: 'Glows & Lueurs', icon: '💡' },
              ].map(tab => {
                const isSelected = selectedEffectKind === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedEffectKind(tab.id);
                      soundEffects.playClick();
                    }}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {}
            <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">
                  HÉROS :
                </span>
                {[
                  { id: 'ALL' as const, label: 'Tous les Héros' },
                  { id: 'SHOOTER' as const, label: '🎯 Tireur d\'Élite' },
                  { id: 'SLAYER' as const, label: '🗡️ Pourfendeur' },
                  { id: 'SUPPORT' as const, label: '✨ Support' },
                  { id: 'TANK' as const, label: '🛡️ Colosse Titan' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCharacterFilter(c.id);
                      soundEffects.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      selectedCharacterFilter === c.id
                        ? 'bg-slate-800 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => {
                    setShopOwnershipFilter('ALL');
                    soundEffects.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    shopOwnershipFilter === 'ALL'
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✨ Tous
                </button>

                <button
                  onClick={() => {
                    setShopOwnershipFilter('OWNED');
                    soundEffects.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    shopOwnershipFilter === 'OWNED'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔓 Possédés
                </button>

                <button
                  onClick={() => {
                    setShopOwnershipFilter('LOCKED');
                    soundEffects.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    shopOwnershipFilter === 'LOCKED'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔒 À Débloquer
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boutiqueFilteredItems.map(item => {
              const isSelected = previewItem.id === item.id;
              const rTheme = getFortniteRarityTheme(item.rarity);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setPreviewItem(item);
                    soundEffects.playClick();
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xl group ${
                    rTheme.border
                  } ${rTheme.borderGlow} ${rTheme.cardBg} ${
                    isSelected
                      ? 'ring-4 ring-cyan-400 shadow-cyan-600/40 scale-[1.02]'
                      : 'hover:scale-[1.01]'
                  }`}
                >
                  <div className="space-y-4">
                    {}
                    <div
                      className={`w-full aspect-[4/3] rounded-2xl bg-gradient-to-tr ${item.previewBg || item.borderGradient || 'from-slate-900 to-slate-950'} relative overflow-hidden flex flex-col justify-between p-4 shadow-inner border border-white/10 group-hover:shadow-lg transition-all`}
                    >
                      {}
                      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] pointer-events-none" />

                      {}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-200">
                          {item.kind} • {item.characterRole}
                        </span>

                        <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border shadow-md ${rTheme.badgeBg}`}>
                          {rTheme.tag}
                        </span>
                      </div>

                      {}
                      <div className="relative z-10 flex items-center justify-center my-auto">
                        <span className="text-5xl sm:text-6xl filter drop-shadow-xl group-hover:scale-115 transition-transform duration-300">
                          {item.icon}
                        </span>
                      </div>

                      {}
                      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                        {item.isEquipped ? (
                          <span className="text-emerald-300">ÉQUIPÉ ✓</span>
                        ) : item.isOwned ? (
                          <span className="text-slate-300">DÉBLOQUÉ</span>
                        ) : (
                          <span className="text-cyan-300">💎 {item.price} Gems</span>
                        )}
                        <span className={rTheme.accentText}>{'★'.repeat(item.stars)} {item.rarity}</span>
                      </div>
                    </div>

                    {}
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {item.name}
                      </h4>
                      <span className="text-[11px] font-mono text-cyan-400 block font-semibold">
                        Exclusif au {item.characterRole}
                      </span>
                    </div>
                  </div>

                  {}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    {item.isOwned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(item);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          item.isEquipped
                            ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 shadow-md'
                            : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md'
                        }`}
                      >
                        {item.isEquipped ? 'Déséquiper ✕' : 'Équiper (Slot Unique)'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(item);
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md cursor-pointer uppercase tracking-wider"
                      >
                        Acheter pour 💎 {item.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {}
      {}
      {mainVolet === 'CHAMPIONS' && (
        <div className="space-y-6 animate-fade-in">
          {}
          <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/40 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <span>🌟</span> SANCTUAIRE DE RECRUTEMENT DES CHAMPIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Débloquez de Nouveaux Héros avec votre Poussière Céleste
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Obtenez de la <strong>Poussière d'Étoiles (🌟)</strong> dans les tirages Gacha et dépensez-la ici pour recruter définitivement le Pourfendeur, le Support Quantique ou le Colosse Titan !
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/50 flex items-center space-x-3 shrink-0 shadow-inner">
              <span className="text-3xl animate-pulse">🌟</span>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block font-bold">VOTRE POUSSIÈRE DISPONIBLE</span>
                <span className="text-xl font-black text-amber-300">{stardust} 🌟</span>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {RECRUITABLE_CHAMPIONS.map(champ => {
              const isUnlocked = unlockedChampions.includes(champ.role);
              const canAfford = stardust >= champ.stardustPrice;

              return (
                <div
                  key={champ.role}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 shadow-2xl relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-emerald-500/60 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/90 border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    {}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black px-3 py-1 rounded-full border ${champ.badgeBg}`}>
                        CLASSE : {champ.role}
                      </span>

                      {isUnlocked ? (
                        <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/50 flex items-center gap-1">
                          <span>✓</span> DÉBLOQUÉ
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-black text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/50 flex items-center gap-1">
                          <span>🌟</span> {champ.stardustPrice} Poussières
                        </span>
                      )}
                    </div>

                    {}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-4xl shadow-2xl relative shrink-0">
                        <span>{champ.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-white truncate">{champ.title}</h3>
                        <span className="text-xs font-mono text-cyan-400 block">{champ.subtitle}</span>
                        <p className="text-xs text-slate-300 mt-1">{champ.description}</p>
                      </div>
                    </div>

                    {}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                        SORTS & CAPACITÉS UNIQUES [A, Z, E, R] :
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {champ.spells.map(spell => (
                          <div key={spell.key} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2">
                            <span className="text-base">{spell.icon}</span>
                            <div className="min-w-0">
                              <span className="text-white font-bold block truncate">[{spell.key}] {spell.name}</span>
                              <span className="text-[9px] text-slate-400 block truncate">{spell.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="pt-3 border-t border-slate-800">
                    {isUnlocked ? (
                      <div className="py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-black text-xs uppercase font-mono text-center">
                        ✓ Champion Recruté & Jouable dans tous les modes
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUnlockChampion(champ)}
                        disabled={!canAfford}
                        className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-xl ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/30 scale-[1.01]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <span>🌟</span>
                        <span>
                          {canAfford
                            ? `Débloquer ce Champion (🌟 ${champ.stardustPrice} Poussières)`
                            : `Poussière Insuffisante (Manque ${champ.stardustPrice - stardust} 🌟)`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {}
      {}
      {isSummoning && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 text-center select-none animate-fade-in">
          {summonStage === 'METEOR' && (
            <div className="space-y-6 flex flex-col items-center justify-center max-w-2xl w-full">
              <GachaCosmicSummonCanvas
                highestRarity={highestRarityPulled}
                pullCount={pulledResults.length}
              />

              <div className="space-y-2 animate-fade-in">
                <span className="text-xs font-mono font-black tracking-widest text-amber-400 uppercase animate-pulse flex items-center justify-center gap-2">
                  <span>⚡</span>
                  <span>TRANSPOSITION STELLAIRE : {highestRarityPulled} DÉTECTÉ !</span>
                  <span>⚡</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Plongeon de la Météorite Cosmique...
                </h2>
              </div>
            </div>
          )}

          {summonStage === 'REVEAL' && (
            <div className="w-full max-w-5xl space-y-6 animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="text-left">
                  <span className="text-xs font-mono font-black text-amber-400 tracking-widest uppercase flex items-center gap-1.5">
                    <span>🌟</span> RÉSULTATS DU TIRAGE STELLAIRE
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {pulledResults.length} Récompense{pulledResults.length > 1 ? 's' : ''} Obtenue{pulledResults.length > 1 ? 's' : ''} !
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setRevealedIndices(pulledResults.map((_, i) => i));
                      soundEffects.playClick();
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Tout révéler (Skip)
                  </button>
                  <button
                    onClick={() => {
                      setIsSummoning(false);
                      setSummonStage('DONE');
                      setPulledResults([]);
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    Fermer ✓
                  </button>
                </div>
              </div>

              {}
              <div className={`grid gap-4 ${pulledResults.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'}`}>
                {pulledResults.map((pull, idx) => {
                  const isRevealed = revealedIndices.includes(idx) || revealedIndices.length === pulledResults.length;

                  if (pull.type === 'STARDUST') {
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isRevealed) {
                            setRevealedIndices(prev => [...prev, idx]);
                            soundEffects.playScore();
                          }
                        }}
                        className={`h-72 rounded-2xl border p-4 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-500 relative overflow-hidden shadow-2xl ${
                          isRevealed
                            ? 'border-amber-400 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 text-amber-300 ring-2 ring-amber-400/50 shadow-amber-500/30'
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-105'
                        }`}
                      >
                        {!isRevealed ? (
                          <div className="my-auto space-y-3">
                            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-700 mx-auto flex items-center justify-center text-3xl shadow-inner animate-pulse">
                              ❓
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                              Cliquer pour révéler
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-full flex items-center justify-between z-10">
                              <span className="text-[9px] font-mono font-black text-amber-400">POUSSIÈRE</span>
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase shadow-md font-bold">
                                RECRUTEMENT
                              </span>
                            </div>

                            <div className="my-auto space-y-2 z-10">
                              <div className="w-20 h-20 rounded-2xl bg-amber-950/60 border border-amber-400/60 mx-auto flex items-center justify-center text-5xl shadow-2xl scale-110 animate-pulse">
                                🌟
                              </div>
                              <div>
                                <h5 className="text-xs font-black text-white truncate max-w-[140px] mx-auto">{pull.stardustTierName}</h5>
                                <span className="text-[10px] font-mono text-amber-300 truncate block mt-0.5 font-bold">
                                  +{pull.stardustAmount} Poussières d'Étoiles
                                </span>
                              </div>
                            </div>

                            <div className="w-full pt-1.5 border-t border-slate-800/80 text-[9px] font-mono text-slate-300 flex items-center justify-center z-10">
                              <span>À dépenser dans le Sanctuaire 👑</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }

                  const item = pull.item!;
                  const rarityBadge =
                    item.rarity === 'MYTHIQUE' ? 'border-amber-400 bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 text-amber-300 ring-2 ring-amber-400/80 shadow-2xl shadow-amber-500/40' :
                    item.rarity === 'LÉGENDAIRE' ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/90 via-slate-900 to-slate-950 text-cyan-300 ring-2 ring-cyan-400/80 shadow-2xl shadow-cyan-500/40' :
                    item.rarity === 'ÉPIQUE' ? 'border-purple-400 bg-gradient-to-b from-purple-950/90 via-slate-900 to-slate-950 text-purple-300 shadow-xl shadow-purple-500/20' :
                    'border-slate-700 bg-slate-900 text-slate-300';

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!isRevealed) {
                          setRevealedIndices(prev => [...prev, idx]);
                          if (item.rarity === 'MYTHIQUE' || item.rarity === 'LÉGENDAIRE') {
                            soundEffects.playVictory();
                          } else {
                            soundEffects.playClick();
                          }
                        }
                      }}
                      className={`h-72 rounded-2xl border p-4 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-500 relative overflow-hidden shadow-2xl group ${
                        isRevealed ? rarityBadge : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-105'
                      }`}
                    >
                      {!isRevealed ? (
                        <div className="my-auto space-y-3">
                          <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-700 mx-auto flex items-center justify-center text-3xl shadow-inner animate-pulse">
                            ❓
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                            Cliquer pour révéler
                          </span>
                        </div>
                      ) : (
                        <>
                          {(item.rarity === 'MYTHIQUE' || item.rarity === 'LÉGENDAIRE') && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none animate-pulse" />
                          )}

                          <div className="w-full flex items-center justify-between z-10">
                            <span className="text-[9px] font-mono font-black text-amber-400">
                              {'★'.repeat(item.stars)}
                            </span>
                            {pull.isNew ? (
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 uppercase shadow-md animate-bounce">
                                NOUVEAU !
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-black text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/50">
                                +1 DOUBLON 2ⁿ
                              </span>
                            )}
                          </div>

                          <div className="my-auto space-y-2 z-10">
                            <div className="w-20 h-20 rounded-2xl bg-slate-950/80 border border-slate-800 mx-auto flex items-center justify-center text-5xl shadow-2xl scale-110">
                              {item.icon}
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white truncate max-w-[140px] mx-auto">{item.name}</h5>
                              <span className="text-[10px] font-mono text-teal-400 truncate block mt-0.5">
                                Exclusif {item.characterRole} • {item.kind === 'SKIN' ? 'SKIN DE BARRE' : item.kind}
                              </span>
                            </div>
                          </div>

                          <div className="w-full pt-1.5 border-t border-slate-800/80 text-[10px] font-mono font-black flex items-center justify-between z-10">
                            <span>{item.rarity}</span>
                            <span className="text-slate-400 text-[9px]">{pull.isNew ? 'Débloqué' : 'Doublon 2ⁿ'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => executePull(10)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl cursor-pointer flex items-center gap-2"
                >
                  <span>Réinvoquer 10x (1,440 💎)</span>
                </button>
                <button
                  onClick={() => {
                    setIsSummoning(false);
                    setSummonStage('DONE');
                    setPulledResults([]);
                  }}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase rounded-2xl cursor-pointer"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};

const GachaCosmicSummonCanvas: React.FC<{
  highestRarity: 'MYTHIQUE' | 'LÉGENDAIRE' | 'ÉPIQUE' | 'RARE';
  pullCount: number;
}> = ({ highestRarity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = 640;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const stars: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];
    const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }> = [];

    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1,
        speed: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    const themeColor =
      highestRarity === 'MYTHIQUE' ? '#fbbf24' :
      highestRarity === 'LÉGENDAIRE' ? '#38bdf8' :
      highestRarity === 'ÉPIQUE' ? '#c084fc' : '#94a3b8';

    const spawnSparks = (x: number, y: number, color: string, count = 10, spd = 6) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const s = (Math.random() * 0.8 + 0.2) * spd;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * s,
          vy: Math.sin(ang) * s,
          color,
          size: Math.random() * 3.5 + 2,
          life: 1.0,
        });
      }
    };

    const render = () => {
      time += 0.035;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const warpSpeed = time < 1.4 ? 1 + time * 3 : 9;
      for (const st of stars) {
        st.x -= st.speed * warpSpeed;
        if (st.x < 0) {
          st.x = width;
          st.y = Math.random() * height;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.fillRect(st.x, st.y, st.size * (warpSpeed > 3 ? 3.5 : 1), st.size);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      if (time < 1.5) {
        const progress = time / 1.5;
        const meteorX = progress * (centerX + 50) - 50;
        const meteorY = progress * (centerY + 50) - 50;

        ctx.save();
        const tailGrad = ctx.createLinearGradient(meteorX - 180, meteorY - 180, meteorX, meteorY);
        tailGrad.addColorStop(0, 'transparent');
        tailGrad.addColorStop(0.5, themeColor + '50');
        tailGrad.addColorStop(1, themeColor);
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(meteorX - 180, meteorY - 180);
        ctx.lineTo(meteorX, meteorY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(meteorX - 90, meteorY - 90);
        ctx.lineTo(meteorX, meteorY);
        ctx.stroke();

        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(meteorX, meteorY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (Math.random() < 0.8) {
          spawnSparks(meteorX, meteorY, themeColor, 3, 4);
        }
      } else {
        const impactTime = time - 1.5;
        const ringRadius = impactTime * 420;
        ctx.save();
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 30;
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = Math.max(1, (1 - impactTime * 0.8) * 18);
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        for (let r = 0; r < 12; r++) {
          const ang = impactTime * 0.6 + (r * Math.PI) / 6;
          const len = 180 + Math.sin(impactTime * 6 + r) * 45;
          ctx.strokeStyle = themeColor + '70';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(ang) * len, centerY + Math.sin(ang) * len);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, 38 - impactTime * 22), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (impactTime < 0.6) {
          spawnSparks(centerX, centerY, themeColor, 6, 8);
          spawnSparks(centerX, centerY, '#ffffff', 4, 6);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.025;
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [highestRarity]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-80 rounded-3xl border border-slate-700 shadow-2xl block"
      style={{ width: '100%', height: '320px' }}
    />
  );
};

export default ShopView;
