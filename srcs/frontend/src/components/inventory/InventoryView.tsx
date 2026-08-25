import React, { useState, useRef, useEffect } from 'react';
import { soundEffects } from '../../services/audio';
import type { HeroRole, EffectKind, EffectTarget, VisualEffectItem } from '../../games/pong/types';
import { cosmeticsStore, getRequiredFusionCopies, getFortniteRarityTheme, DEFAULT_STARTER_INVENTORY } from '../../services/cosmeticsStore';
import type { StoredInventoryItem } from '../../services/cosmeticsStore';
import { drawUnifiedPaddle, DEFAULT_ROLE_COLORS } from '../../games/pong/renderers/PaddleRenderer';
import type { PaddleVisualLoadout } from '../../games/pong/renderers/PaddleRenderer';

export type InventoryItem = StoredInventoryItem;
export { getRequiredFusionCopies, getFortniteRarityTheme };

export const COMPLETE_CHARACTER_BOUND_INVENTORY: InventoryItem[] = DEFAULT_STARTER_INVENTORY;

interface FusionCinematicModalProps {
  data: {
    item: InventoryItem;
    fromLevel: number;
    toLevel: number;
    consumedCopies: number;
  };
  onClose: () => void;
  onNavigateToGame?: () => void;
}

export const FusionCinematicModal: React.FC<FusionCinematicModalProps> = ({
  data,
  onClose,
  onNavigateToGame,
}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'CHARGING' | 'VORTEX' | 'REVEAL'>('CHARGING');

  useEffect(() => {
    soundEffects.playPowerUp();

    const t1 = setTimeout(() => {
      setPhase('VORTEX');
      soundEffects.playLaserShoot();
    }, 1100);

    const t2 = setTimeout(() => {
      setPhase('REVEAL');
      soundEffects.playVictory();
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = 600;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }> = [];

    const spawnSparks = (x: number, y: number, color: string, count = 8, spd = 5) => {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const s = (Math.random() * 0.8 + 0.2) * spd;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * s,
          vy: Math.sin(ang) * s,
          color,
          size: Math.random() * 3 + 1.5,
          life: 1.0,
        });
      }
    };

    const render = () => {
      time += 0.04;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      if (time < 1.1) {
        const progress = time / 1.1;
        const distance = (1 - progress) * 160;

        const x1 = centerX - distance;
        const x2 = centerX + distance;

        ctx.save();
        ctx.shadowColor = data.item.glowColor;
        ctx.shadowBlur = 25;
        ctx.fillStyle = data.item.glowColor;

        ctx.beginPath();
        ctx.arc(x1, centerY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x2, centerY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, centerY);
        ctx.lineTo(x2, centerY);
        ctx.stroke();
        ctx.restore();

        if (Math.random() < 0.6) {
          spawnSparks(x1, centerY, data.item.glowColor, 2, 3);
          spawnSparks(x2, centerY, data.item.glowColor, 2, 3);
        }
      }
      else if (time < 2.3) {
        const vortexProgress = (time - 1.1) / 1.2;
        const spinSpeed = 8 + vortexProgress * 15;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * spinSpeed);

        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2;
          const r = (1 - vortexProgress) * 90;
          ctx.strokeStyle = data.item.glowColor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * r, Math.sin(ang) * r, 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 16 + Math.sin(time * 20) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (Math.random() < 0.8) {
          spawnSparks(centerX, centerY, data.item.glowColor, 4, 6);
        }
      }
      else {
        const revealTime = time - 2.3;

        const radius = Math.min(260, revealTime * 320);
        ctx.save();
        ctx.strokeStyle = data.item.glowColor;
        ctx.shadowColor = data.item.glowColor;
        ctx.shadowBlur = 30;
        ctx.lineWidth = Math.max(1, (1 - revealTime * 0.7) * 14);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        const starCount = data.toLevel;
        for (let s = 0; s < starCount; s++) {
          const ang = (s * Math.PI * 2) / starCount + revealTime * 0.8;
          const starDist = 58;
          const sx = centerX + Math.cos(ang) * starDist;
          const sy = centerY + Math.sin(ang) * starDist;

          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }

        const coreScale = data.toLevel * 0.2 + 0.8;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 24 * coreScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (revealTime < 0.4) {
          spawnSparks(centerX, centerY, '#fbbf24', 5, 8);
          spawnSparks(centerX, centerY, data.item.glowColor, 4, 6);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;
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
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
        {}
        <div className="space-y-1">
          <span className="text-amber-400 font-mono text-xs font-black uppercase tracking-wider">
            ⚡ CÉRÉMONIE DE FUSION $2^n$ STELLAIRE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {phase === 'REVEAL' ? '👑 FUSION ACCOMPLIE AVEC SUCCÈS !' : 'FUSION DES MATRICES EN COURS...'}
          </h2>
        </div>

        {}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-80 block"
            style={{ width: '100%', height: '320px' }}
          />

          {}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
            {phase === 'CHARGING' && `⚡ 1. Consommation de ${data.consumedCopies} doublons...`}
            {phase === 'VORTEX' && '🌀 2. Vortex d\'Accélération Singulière...'}
            {phase === 'REVEAL' && `👑 3. Éclosion : NIVEAU ${data.toLevel} DÉVERROUILLÉ !`}
          </div>
        </div>

        {}
        {phase === 'REVEAL' && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 flex items-center justify-between animate-fade-in">
            <div className="text-left space-y-0.5">
              <h4 className="text-sm font-black text-white">{data.item.name}</h4>
              <span className="text-xs font-mono text-teal-400 block">
                Exclusif : {data.item.characterRole} • Intensité Visuelle : {data.toLevel * 20}%
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-slate-400 block line-through">Niveau {data.fromLevel}</span>
              <span className="text-base font-black text-amber-400">
                ➔ NIVEAU {data.toLevel} {data.toLevel === 5 ? '(IDÉAL ULTIME)' : ''}
              </span>
            </div>
          </div>
        )}

        {}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>Fermer & Continuer</span>
          </button>

          {onNavigateToGame && (
            <button
              onClick={() => {
                onClose();
                onNavigateToGame();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>🎮 Tester en Partie 🏓</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

const LoadoutVisualizerStage: React.FC<{
  characterRole: HeroRole;
  equippedPaddleSkin?: InventoryItem;
  equippedPaddleWeapon?: InventoryItem;
  equippedPaddleTrail?: InventoryItem;
  equippedPaddleAura?: InventoryItem;
  equippedPaddleGlow?: InventoryItem;
}> = ({
  characterRole,
  equippedPaddleSkin,
  equippedPaddleWeapon,
  equippedPaddleTrail,
  equippedPaddleAura,
  equippedPaddleGlow,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const trailPoints: Array<{ x: number; y: number; alpha: number }> = [];

    const def = DEFAULT_ROLE_COLORS[characterRole] || DEFAULT_ROLE_COLORS.SHOOTER;
    const loadout: PaddleVisualLoadout = {
      role: characterRole,
      skinPrimary: equippedPaddleSkin?.primaryColor || def.primary,
      skinSecondary: equippedPaddleSkin?.secondaryColor || equippedPaddleSkin?.primaryColor || def.secondary,
      skinRarity: equippedPaddleSkin?.rarity,
      skinStars: equippedPaddleSkin?.stars,
      glowColor: equippedPaddleGlow?.glowColor || equippedPaddleSkin?.primaryColor || def.glow,

      auraColor: equippedPaddleAura?.glowColor,
      trailColor: equippedPaddleTrail?.glowColor || equippedPaddleSkin?.primaryColor || def.glow,
      weaponPrimary: equippedPaddleWeapon?.primaryColor || def.primary,
      weaponSecondary: equippedPaddleWeapon?.secondaryColor || equippedPaddleWeapon?.primaryColor || def.secondary,
      weaponGlow: equippedPaddleWeapon?.glowColor || equippedPaddleWeapon?.primaryColor || def.glow,
      weaponRarity: equippedPaddleWeapon?.rarity,
      weaponStars: equippedPaddleWeapon?.stars,
      glowScale: equippedPaddleGlow ? (equippedPaddleGlow.level || 1) * 0.2 : 0.8,
      auraScale: equippedPaddleAura ? (equippedPaddleAura.level || 1) * 0.2 : 0,
      trailScale: equippedPaddleTrail ? (equippedPaddleTrail.level || 1) * 0.2 : 0.8,
    };

    const render = () => {
      t += 0.035;
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const pX = width / 2 + Math.cos(t * 1.5) * 85;
      const pY = height / 2;
      const floatY = pY + Math.sin(t * 3) * 12;

      trailPoints.push({ x: pX, y: floatY, alpha: 1.0 });
      if (trailPoints.length > 25) trailPoints.shift();

      if (loadout.trailScale > 0) {
        ctx.save();
        for (let i = 0; i < trailPoints.length; i++) {
          const pt = trailPoints[i];
          pt.alpha -= 0.035;
          if (pt.alpha > 0) {
            const rad = ((i + 1) / trailPoints.length) * 14 * loadout.trailScale;
            ctx.fillStyle = loadout.trailColor || loadout.glowColor;
            ctx.globalAlpha = pt.alpha * 0.7;
            ctx.shadowColor = loadout.trailColor || loadout.glowColor;
            ctx.shadowBlur = 15 * loadout.trailScale;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      drawUnifiedPaddle(ctx, {
        x: pX - 10,
        y: floatY - 37.5,
        width: 20,
        height: 75,
        loadout,
        facingDir: 1,
        time: t,
        showAura: true,
        showWeapon: true,
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [
    characterRole,
    equippedPaddleSkin,
    equippedPaddleWeapon,
    equippedPaddleTrail,
    equippedPaddleAura,
    equippedPaddleGlow,
  ]);

  return (
    <div className="w-full aspect-[4/3] max-h-56 mx-auto overflow-hidden rounded-2xl border border-slate-700 shadow-2xl bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

interface InventoryViewProps {
  onNavigate?: (tab: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onNavigate }) => {

  const [selectedCharacter, setSelectedCharacter] = useState<HeroRole>('SHOOTER');

  const [activeMainTab, setActiveMainTab] = useState<'LOCKER' | 'FUSION'>('LOCKER');

  const [selectedKind, setSelectedKind] = useState<'ALL' | EffectKind>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'OWNED' | 'LOCKED'>('ALL');
  const [previewOverrideItem, setPreviewOverrideItem] = useState<StoredInventoryItem | null>(null);
  const [items, setItems] = useState<StoredInventoryItem[]>(cosmeticsStore.getInventory());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = cosmeticsStore.subscribe(() => {
      setItems(cosmeticsStore.getInventory());
    });
    return unsub;
  }, []);

  const [fusionSelectedItem, setFusionSelectedItem] = useState<InventoryItem | null>(null);
  const [isFusing, setIsFusing] = useState<boolean>(false);

  const [fusionModalData, setFusionModalData] = useState<{
    item: InventoryItem;
    fromLevel: number;
    toLevel: number;
    consumedCopies: number;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEquip = (item: InventoryItem) => {
    const willEquip = !item.isEquipped;
    cosmeticsStore.equipItem(item.id, item.characterRole, item.kind, willEquip, item.target);
    setItems(cosmeticsStore.getInventory());

    if (willEquip) {
      soundEffects.playScore();
      showToast(`✨ « ${item.name} » équipé sur votre ${item.characterRole} !`);
    } else {
      soundEffects.playClick();
      showToast(`🚫 « ${item.name} » a été retiré.`);
    }
  };

  const handleBuy = (item: InventoryItem) => {
    const wallet = cosmeticsStore.getWallet();
    if (wallet.credits < item.price) {
      soundEffects.playDefeat();
      showToast(`❌ Crédits insuffisants ! Il vous manque ${item.price - wallet.credits} 💎 Crédits.`);
      return;
    }

    cosmeticsStore.updateWallet({ credits: wallet.credits - item.price });
    const allInv = cosmeticsStore.getInventory();
    const updated = allInv.map(it => it.id === item.id ? { ...it, isOwned: true } : it);
    cosmeticsStore.saveInventory(updated);
    setItems(cosmeticsStore.getInventory());

    soundEffects.playScore();
    showToast(`🎉 « ${item.name} » déverrouillé avec succès !`);
  };

  const handleFuse = (item: InventoryItem) => {
    if (item.level >= 5) {
      showToast(`👑 Cet effet est déjà au Niveau 5 Maximum (Idéal Ultime) !`);
      return;
    }

    const requiredCopies = getRequiredFusionCopies(item.level);
    if (item.duplicates < requiredCopies) {
      soundEffects.playCooldownWarning();
      showToast(`⚠️ Il vous manque ${requiredCopies - item.duplicates} doublons (Requis: ${requiredCopies} pour passer Niv. ${item.level + 1}) !`);
      return;
    }

    const res = cosmeticsStore.fuseItem(item.id);
    if (res.success && res.updatedItem) {
      setFusionSelectedItem(res.updatedItem);
      setFusionModalData({
        item: res.updatedItem,
        fromLevel: res.fromLevel,
        toLevel: res.toLevel,
        consumedCopies: res.cost,
      });
      setItems(cosmeticsStore.getInventory());
    }
  };

  const handleAutoFuseAll = () => {
    setIsFusing(true);
    soundEffects.playPowerUp();

    setTimeout(() => {
      const res = cosmeticsStore.autoFuseAll(selectedCharacter);
      setIsFusing(false);
      setItems(cosmeticsStore.getInventory());

      if (res.totalFusions > 0 && res.highestItem) {
        setFusionModalData({
          item: res.highestItem,
          fromLevel: res.fromLvl,
          toLevel: res.toLvl,
          consumedCopies: res.totalCost,
        });
      } else {
        soundEffects.playVictory();
        showToast('ℹ️ Aucun doublon supplémentaire éligible à la fusion pour ce champion.');
      }
    }, 450);
  };

  const [selectedGameTab, setSelectedGameTab] = useState<'pong' | 'bricktris'>('pong');

  const characterItems = items.filter(it => it.characterRole === selectedCharacter);

  const equippedPaddleSkin = characterItems.find(it => it.kind === 'SKIN' && it.isEquipped);
  const equippedPaddleWeapon = characterItems.find(it => it.kind === 'WEAPON' && it.isEquipped);
  const equippedPaddleTrail = characterItems.find(it => it.kind === 'TRAIL' && it.isEquipped && (it.target === 'PADDLE' || !it.target));
  const equippedPaddleAura = characterItems.find(it => it.kind === 'AURA' && it.isEquipped && (it.target === 'PADDLE' || !it.target));
  const equippedPaddleGlow = characterItems.find(it => it.kind === 'GLOW' && it.isEquipped && (it.target === 'PADDLE' || !it.target));

  const activeVisualizerSkin = (previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'SKIN' ? previewOverrideItem : equippedPaddleSkin);
  const activeVisualizerWeapon = (previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'WEAPON' ? previewOverrideItem : equippedPaddleWeapon);
  const activeVisualizerTrail = (previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'TRAIL' && (previewOverrideItem.target === 'PADDLE' || !previewOverrideItem.target) ? previewOverrideItem : equippedPaddleTrail);
  const activeVisualizerAura = (previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'AURA' ? previewOverrideItem : equippedPaddleAura);
  const activeVisualizerGlow = (previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'GLOW' ? previewOverrideItem : equippedPaddleGlow);

  const gameScopedItems = items.filter(it => {
    if (selectedGameTab === 'bricktris') return it.gameId === 'bricktris';
    return it.gameId !== 'bricktris' && it.characterRole === selectedCharacter;
  });

  const totalCount = gameScopedItems.length;
  const ownedCount = gameScopedItems.filter(it => it.isOwned).length;
  const lockedCount = gameScopedItems.filter(it => !it.isOwned).length;

  const filteredItems = gameScopedItems.filter(it => {
    if (selectedKind !== 'ALL' && it.kind !== selectedKind) return false;
    if (ownershipFilter === 'OWNED' && !it.isOwned) return false;
    if (ownershipFilter === 'LOCKED' && it.isOwned) return false;
    return true;
  });

  const fusionTargetItem = items.find(it => it.id === (fusionSelectedItem?.id || characterItems[0]?.id)) || characterItems[0];

  const characterBadges: Record<HeroRole, { name: string; icon: string; color: string }> = {
    SHOOTER: { name: 'Tireur d\'Élite (Marksman)', icon: '🎯', color: 'from-cyan-500 to-blue-600' },
    SLAYER: { name: 'Pourfendeur (Assassin)', icon: '🗡️', color: 'from-rose-500 to-red-600' },
    SUPPORT: { name: 'Support Quantique (Gardien)', icon: '✨', color: 'from-emerald-500 to-teal-600' },
    TANK: { name: 'Colosse Titan (Juggernaut)', icon: '🛡️', color: 'from-amber-500 to-yellow-600' },
  };

  const targetRequiredCopies = fusionTargetItem ? getRequiredFusionCopies(fusionTargetItem.level) : 2;
  const targetCanFuse = fusionTargetItem && fusionTargetItem.level < 5 && fusionTargetItem.duplicates >= targetRequiredCopies;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 my-4 text-left font-sans animate-fade-in pb-16">

      {}
      {fusionModalData && (
        <FusionCinematicModal
          data={fusionModalData}
          onClose={() => setFusionModalData(null)}
          onNavigateToGame={() => onNavigate && onNavigate('game')}
        />
      )}

      {}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="z-10 space-y-1">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-black uppercase tracking-wider">
            <span>✨ CASIER & FUSION $2^n$ (5 NIVEAUX D'INTENSITÉ)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Atelier de Personnalisation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Améliorez vos effets visuels jusqu'au <strong>Niveau 5 (Idéal Ultime)</strong> en fusionnant simplement <strong>$2^n$ doublons</strong> ($2, 4, 8, 16$).
          </p>
        </div>

        {}
        {onNavigate && (
          <button
            onClick={() => onNavigate('game')}
            className="z-10 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>🏓</span>
            <span>JOUER UNE PARTIE 🚀</span>
          </button>
        )}
      </div>

      {}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
          🕹️ SÉLECTION DU CASIER DE JEU :
        </span>
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          {[
            { id: 'pong' as const, label: '🏓 Pong RPG 2D (Par Champion)', count: characterItems.length, icon: '🏓' },
            { id: 'bricktris' as const, label: '🧱 BrickTris 2v2', count: items.filter(it => it.gameId === 'bricktris').length, icon: '🧱' },
          ].map(g => (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGameTab(g.id);
                soundEffects.playClick();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedGameTab === g.id
                  ? 'bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span className="text-base">{g.icon}</span>
              <span>{g.label}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px] text-cyan-400 font-mono border border-slate-800">
                {g.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {}
      {selectedGameTab !== 'bricktris' && (
        <div className="space-y-2 my-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            1. SÉLECTION DU CHAMPION PONG (EFFETS NON-TRANSFÉRABLES) :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(characterBadges) as HeroRole[]).map(role => {
              const isSelected = selectedCharacter === role;
              const badge = characterBadges[role];
              return (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedCharacter(role);
                    setFusionSelectedItem(null);
                    soundEffects.playClick();
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-900/90 to-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{badge.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-white truncate">{badge.name}</h4>
                    <span className="text-[9px] text-amber-400 block font-mono">Stock Exclusif</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedGameTab === 'bricktris' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 border border-orange-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧱</span>
            <div>
              <h3 className="text-sm font-black text-white">Casier Exclusif BrickTris 2v2</h3>
              <p className="text-xs text-slate-300">
                Équipez vos Raquettes Magmatiques, Thèmes de Tétrominos et Traînées Météores pour vos parties 2v2 et Solo.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-600/30 text-orange-300 text-[10px] font-mono font-bold border border-orange-400/30">
            {items.filter(it => it.gameId === 'bricktris').length} Objets Disponibles
          </span>
        </div>
      )}

      {}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setActiveMainTab('LOCKER');
              soundEffects.playClick();
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 border ${
              activeMainTab === 'LOCKER'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 border-cyan-400 text-white shadow-xl shadow-cyan-600/30 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎒 1. Casier & Équipement ({characterItems.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveMainTab('FUSION');
              soundEffects.playClick();
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-2 border ${
              activeMainTab === 'FUSION'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 border-amber-400 text-white shadow-xl shadow-amber-600/30 scale-[1.02]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ 2. Atelier de Fusion $2^n$ (5 Niveaux)</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Règle : <strong className="text-white">1 seul effet de chaque catégorie équipé max</strong>
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
      {activeMainTab === 'LOCKER' && (
        <div className="space-y-6 animate-fade-in">
          {}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-950/90 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    VISUALISATION 60 FPS DE VOTRE BARRE (EN DIRECT)
                  </span>
                  {previewOverrideItem && (
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse">
                      👁️ Aperçu : {previewOverrideItem.name}
                    </span>
                  )}
                </div>

                {previewOverrideItem ? (
                  <button
                    onClick={() => {
                      setPreviewOverrideItem(null);
                      soundEffects.playClick();
                    }}
                    className="text-[11px] font-mono text-rose-400 hover:text-rose-300 font-bold cursor-pointer underline flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span>Réinitialiser prévisu</span>
                  </button>
                ) : (
                  <span className="text-xs font-mono text-slate-400">5 Slots Personnalisés</span>
                )}
              </div>

              <LoadoutVisualizerStage
                characterRole={selectedCharacter}
                equippedPaddleSkin={activeVisualizerSkin}
                equippedPaddleWeapon={activeVisualizerWeapon}
                equippedPaddleTrail={activeVisualizerTrail}
                equippedPaddleAura={activeVisualizerAura}
                equippedPaddleGlow={activeVisualizerGlow}
              />
            </div>

            {}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-black text-slate-400 uppercase">
                  {previewOverrideItem ? 'APERÇU DU LOADOUT EN DIRECT :' : `LOADOUT ÉQUIPÉ (${selectedCharacter}) :`}
                </h3>
                {previewOverrideItem && (
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">1 slot modifié</span>
                )}
              </div>

              <div className="space-y-1.5">
                {[
                  { label: '🎨 SKIN DE BARRE', item: activeVisualizerSkin, isPreview: previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'SKIN', kind: 'SKIN' },
                  { label: '⚔️ ARME DE COMBAT', item: activeVisualizerWeapon, isPreview: previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'WEAPON', kind: 'WEAPON' },
                  { label: '💫 TRAÎNÉE', item: activeVisualizerTrail, isPreview: previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'TRAIL', kind: 'TRAIL' },
                  { label: '🕊️ AURA & HALO', item: activeVisualizerAura, isPreview: previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'AURA', kind: 'AURA' },
                  { label: '💡 GLOW & LUEUR', item: activeVisualizerGlow, isPreview: previewOverrideItem?.characterRole === selectedCharacter && previewOverrideItem?.kind === 'GLOW', kind: 'GLOW' },
                ].map(slot => (
                  <div
                    key={slot.kind}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      slot.isPreview
                        ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                        : slot.item
                        ? 'bg-slate-900/90 border-slate-700 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-lg">{slot.item?.icon || '⚪'}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-400 block font-bold">{slot.label}</span>
                          {slot.isPreview && (
                            <span className="text-[9px] font-mono font-black text-cyan-300 bg-cyan-900/80 px-1.5 py-0.2 rounded border border-cyan-400/40">
                              APERÇU
                            </span>
                          )}
                        </div>
                        <h4 className={`text-xs font-black truncate ${slot.isPreview ? 'text-cyan-300' : slot.item ? 'text-white' : 'text-slate-500 italic'}`}>
                          {slot.item?.name || 'Aucun effet équipé'}
                        </h4>
                      </div>
                    </div>
                    {slot.item ? (
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border shrink-0 ${
                        slot.isPreview ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40' : 'bg-amber-400/20 text-amber-300 border-amber-500/40'
                      }`}>
                        Niv. {slot.item.level}/5
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                        Vide
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
            {}
            <div className="flex flex-wrap items-center gap-1.5">
              {[

                { id: 'ALL' as const, label: 'Tous les Effets', icon: '✨', count: gameScopedItems.length },
                { id: 'SKIN' as const, label: 'Skins de Barre', icon: '🎨', count: gameScopedItems.filter(i => i.kind === 'SKIN').length },
                { id: 'WEAPON' as const, label: 'Armes', icon: '⚔️', count: gameScopedItems.filter(i => i.kind === 'WEAPON').length },
                { id: 'TRAIL' as const, label: 'Traînées', icon: '💫', count: gameScopedItems.filter(i => i.kind === 'TRAIL').length },
                { id: 'AURA' as const, label: 'Auras & Halos', icon: '🕊️', count: gameScopedItems.filter(i => i.kind === 'AURA').length },
                { id: 'GLOW' as const, label: 'Glows', icon: '💡', count: gameScopedItems.filter(i => i.kind === 'GLOW').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedKind(tab.id);
                    soundEffects.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                    selectedKind === tab.id
                      ? 'bg-slate-900 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">({tab.count})</span>
                </button>
              ))}

            </div>

            {}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => {
                  setOwnershipFilter('ALL');
                  soundEffects.playClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  ownershipFilter === 'ALL'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ✨ Tous ({totalCount})
              </button>

              <button
                onClick={() => {
                  setOwnershipFilter('OWNED');
                  soundEffects.playClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  ownershipFilter === 'OWNED'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔓 Possédés ({ownedCount})</span>
              </button>

              <button
                onClick={() => {
                  setOwnershipFilter('LOCKED');
                  soundEffects.playClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  ownershipFilter === 'LOCKED'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔒 Verrouillés ({lockedCount})</span>
              </button>
            </div>
          </div>

          {}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl text-[11px] font-mono shadow-lg">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 CODE COULEUR DE RARETÉ (STYLE FORTNITE) :</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full border border-slate-600 bg-slate-800/80 text-slate-300 font-bold">
                ⚪ Commun
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-cyan-500 bg-cyan-950/80 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                💎 Rare
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-purple-500 bg-purple-950/80 text-purple-300 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                🔮 Épique
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-amber-500 bg-amber-950/80 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                ⚡ Légendaire
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-yellow-400 bg-yellow-950/90 text-yellow-300 font-black shadow-[0_0_12px_rgba(250,204,21,0.45)] animate-pulse">
                👑 Mythique
              </span>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const isMaxLevel = item.level === 5;
              const requiredCopies = getRequiredFusionCopies(item.level);
              const canFuse = !isMaxLevel && item.duplicates >= requiredCopies;
              const isPreviewing = previewOverrideItem?.id === item.id;
              const rTheme = getFortniteRarityTheme(item.rarity);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setPreviewOverrideItem(item);
                    soundEffects.playClick();
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 shadow-xl group cursor-pointer ${
                    rTheme.border
                  } ${rTheme.borderGlow} ${rTheme.cardBg} ${
                    isPreviewing
                      ? 'ring-4 ring-cyan-400 shadow-cyan-500/40 scale-[1.02]'
                      : item.isEquipped
                      ? 'ring-2 ring-emerald-500 shadow-emerald-500/30'
                      : 'hover:scale-[1.01]'
                  } ${!item.isOwned ? 'opacity-85 hover:opacity-100' : ''}`}
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
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-violet-950/80 text-violet-300 border border-violet-500/40">
                            {item.gameTitle || (item.gameId === 'bricktris' ? '🧱 BrickTris' : '🏓 Pong')}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-slate-200">
                            {item.kind}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border shadow-md ${rTheme.badgeBg}`}>
                            {rTheme.tag}
                          </span>

                          {isPreviewing && (
                            <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 animate-pulse font-bold">
                              👁️ PRÉVISU
                            </span>
                          )}

                          {!item.isOwned ? (
                            <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/50">
                              🔒 VERROUILLÉ
                            </span>
                          ) : (
                            <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full border shadow-md ${
                              isMaxLevel
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
                            }`}>
                              {isMaxLevel ? '👑 NIV. 5 MAX' : `⚡ NIV. ${item.level}/5`}
                            </span>
                          )}
                        </div>
                      </div>

                      {}
                      <div className="relative z-10 flex items-center justify-center my-auto">
                        <span className="text-5xl sm:text-6xl filter drop-shadow-xl group-hover:scale-115 transition-transform duration-300">
                          {item.icon}
                        </span>
                      </div>

                      {}
                      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                        <span className={rTheme.accentText}>{'★'.repeat(item.stars)} {item.rarity}</span>
                        {item.isOwned ? (
                          <span className="text-teal-300">Intensité : {item.level * 20}%</span>
                        ) : (
                          <span className="text-cyan-300 font-bold">💎 {item.price} Gems</span>
                        )}
                      </div>
                    </div>

                    {}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.name}
                        </h4>
                      </div>

                      {}
                      {item.isOwned && !isMaxLevel && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] font-mono text-slate-400">
                            <span>Progression $2^n$ :</span>
                            <span className={canFuse ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                              {item.duplicates} / {requiredCopies} doublons
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                canFuse ? 'bg-emerald-400 shadow-sm' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${Math.min(100, (item.duplicates / requiredCopies) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
                    {item.isOwned ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item);
                          }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            item.isEquipped
                              ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 shadow-md'
                              : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-md'
                          }`}
                        >
                          {item.isEquipped ? 'Déséquiper ✕' : 'Équiper ✓'}
                        </button>

                        {canFuse && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFuse(item);
                            }}
                            className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg cursor-pointer flex items-center gap-1 animate-pulse"
                          >
                            <span>⚡</span>
                            <span>Fusion</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(item);
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-600/20 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <span>💎</span>
                        <span>Débloquer ({item.price} Gems)</span>
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
      {activeMainTab === 'FUSION' && (
        <div className="space-y-6 animate-fade-in">
          {}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/40 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <span>⚡</span> RÈGLE DE FUSION SIMPLE $2^n$ (5 NIVEAUX)
              </span>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Chaque tirage de doublon incrémente votre stock. Pour passer au niveau supérieur, fusionnez simplement <strong>$2^n$ doublons</strong> :
                <br />
                <span className="text-amber-300 font-mono font-bold">
                  Niv 1➔2 : 2 doublons | Niv 2➔3 : 4 doublons | Niv 3➔4 : 8 doublons | Niv 4➔5 : 16 doublons
                </span>
              </p>
            </div>

            <button
              onClick={handleAutoFuseAll}
              disabled={isFusing}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl cursor-pointer flex items-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <span>⚡ AUTO-FUSIONNER : {selectedCharacter}</span>
            </button>
          </div>

          {}
          <div className="bg-slate-950/90 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                <span>🔮</span> AUTEL DE FUSION : {fusionTargetItem?.name}
              </h3>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Niveau Actuel : {fusionTargetItem?.level}/5 (Intensité : {fusionTargetItem ? fusionTargetItem.level * 20 : 20}%)
              </span>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  NIVEAU ACTUEL ({fusionTargetItem?.level}/5)
                </span>
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-500/50 flex items-center justify-center text-3xl shadow-lg">
                  {fusionTargetItem?.icon}
                </div>
                <span className="text-xs font-bold text-white">
                  Stock de Doublons : <strong className="text-amber-300">{fusionTargetItem?.duplicates || 0}</strong>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {fusionTargetItem?.level === 5 ? 'Niveau Max Atteint' : `Requis pour Niv. ${fusionTargetItem ? fusionTargetItem.level + 1 : 2} : ${targetRequiredCopies} doublons`}
                </span>
              </div>

              {}
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl shadow-2xl transition-all ${
                  isFusing
                    ? 'border-amber-400 bg-amber-500/30 scale-110 animate-spin'
                    : 'border-slate-700 bg-slate-900'
                }`}>
                  <span>⚡</span>
                </div>

                <span className="text-xs font-mono font-bold text-slate-300">
                  {fusionTargetItem?.level === 5
                    ? '👑 NIVEAU 5 MAX ATTEINT'
                    : targetCanFuse
                    ? `✓ Prêt : Consomme ${targetRequiredCopies} doublons ($2^n$)`
                    : `Manque ${targetRequiredCopies - (fusionTargetItem?.duplicates || 0)} doublons`}
                </span>

                <button
                  onClick={() => fusionTargetItem && handleFuse(fusionTargetItem)}
                  disabled={!targetCanFuse || isFusing}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    targetCanFuse
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-xl shadow-amber-500/30 scale-105 animate-pulse'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <span>
                    {fusionTargetItem?.level === 5
                      ? 'Niveau 5 Maximum'
                      : `Fusionner ($2^n$) ➔ Niv. ${fusionTargetItem ? fusionTargetItem.level + 1 : 2}`}
                  </span>
                </button>
              </div>

              {}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/60 flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  {fusionTargetItem?.level === 5 ? 'APOGÉE ULTIME' : `PROCHAIN NIVEAU (NIV. ${Math.min(5, (fusionTargetItem?.level || 1) + 1)})`}
                </span>
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-amber-500/20 shadow-xl">
                  {fusionTargetItem?.icon}
                </div>
                <span className="text-xs font-black text-amber-300">
                  {(fusionTargetItem?.level || 1) + 1 === 5 ? '👑 NIV. 5 IDÉAL ULTIME' : `⚡ NIV. ${Math.min(5, (fusionTargetItem?.level || 1) + 1)} AMPLIFIÉ`}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Intensité Visuelle : {Math.min(100, ((fusionTargetItem?.level || 1) + 1) * 20)}%
                </span>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  GRILLE DES EFFETS & PROGRESSION DU {selectedCharacter.toUpperCase()} :
                </span>
                <h3 className="text-lg font-black text-white">
                  Tous les Effets Débloqués & Doublons $2^n$ (Niv. 1 à 5)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {characterItems.length} effets disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {characterItems.map(item => {
                const isSelected = fusionTargetItem?.id === item.id;
                const isMaxLevel = item.level === 5;
                const reqCopies = getRequiredFusionCopies(item.level);
                const canFuse = !isMaxLevel && item.duplicates >= reqCopies;
                const rTheme = getFortniteRarityTheme(item.rarity);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFusionSelectedItem(item);
                      soundEffects.playClick();
                    }}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xl group ${
                      rTheme.border
                    } ${rTheme.borderGlow} ${rTheme.cardBg} ${
                      isSelected
                        ? 'ring-4 ring-amber-400 shadow-amber-500/30 scale-[1.02]'
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
                            {item.kind} • {item.target}
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
                        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-white font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                          <span className={rTheme.accentText}>{'★'.repeat(item.stars)} {item.rarity}</span>
                          <span className="text-teal-300">Intensité : {item.level * 20}%</span>
                        </div>
                      </div>

                      {}
                      <div className="space-y-2">
                        <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
                          {item.name}
                        </h4>

                        {}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">Réserve Doublons :</span>
                            <span className={canFuse ? 'text-emerald-300 font-black' : 'text-slate-300 font-bold'}>
                              {item.duplicates} / {isMaxLevel ? 'MAX' : `${reqCopies} ($2^n$)`}
                            </span>
                          </div>

                          {!isMaxLevel && (
                            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  canFuse ? 'bg-emerald-400 shadow-sm' : 'bg-amber-500/80'
                                }`}
                                style={{ width: `${Math.min(100, (item.duplicates / reqCopies) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="pt-2 border-t border-slate-800/80">
                      {canFuse ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFuse(item);
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs uppercase font-mono shadow-lg cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <span>⚡</span>
                          <span>FUSIONNER ➔ NIV. {item.level + 1}</span>
                        </button>
                      ) : isMaxLevel ? (
                        <div className="py-2.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 font-bold text-xs text-center font-mono">
                          👑 Niveau 5 Ultime Atteint
                        </div>
                      ) : (
                        <div className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs text-center font-mono">
                          Manque {reqCopies - item.duplicates} doublons
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
