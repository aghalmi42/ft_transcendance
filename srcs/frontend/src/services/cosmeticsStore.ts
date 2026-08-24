import type { HeroRole } from '../games/pong/types';
import {
  STORAGE_KEYS,
  DEFAULT_WALLET,
  DEFAULT_STARTER_INVENTORY,
  ALL_EFFECTS_ITEMS,
  getRequiredFusionCopies,
  getFortniteRarityTheme,
  type SupportedGameId,
  type StoredInventoryItem,
  type UserWalletState,
} from '../config/cosmeticsConfig';

export type { SupportedGameId, StoredInventoryItem, UserWalletState };
export { getRequiredFusionCopies, getFortniteRarityTheme, DEFAULT_STARTER_INVENTORY, ALL_EFFECTS_ITEMS };

class CosmeticsStore {
  private listeners: Array<() => void> = [];

  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.WALLET)) {
      this.saveWallet(DEFAULT_WALLET);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.saveInventory(DEFAULT_STARTER_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAMPIONS)) {
      this.saveUnlockedChampions(['SHOOTER']);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
    window.dispatchEvent(new CustomEvent('cosmetics_store_updated'));
  }

  public getWallet(): UserWalletState {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return { ...DEFAULT_WALLET };
  }

  public saveWallet(wallet: UserWalletState) {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    this.notify();
  }

  public updateWallet(partial: Partial<UserWalletState>) {
    const current = this.getWallet();
    const updated = { ...current, ...partial };
    this.saveWallet(updated);
  }

  public addCredits(amount: number) {
    const current = this.getWallet();
    this.updateWallet({ credits: Math.max(0, current.credits + amount) });
  }

  public getInventory(): StoredInventoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [...DEFAULT_STARTER_INVENTORY];
  }

  public saveInventory(inventory: StoredInventoryItem[]) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    this.notify();
  }

  public equipItem(
    itemId: string,
    _role?: HeroRole,
    _kind?: any,
    willEquip = true,
    _target?: any
  ) {
    if (!willEquip) {
      this.unequipItem(itemId);
      return;
    }
    const items = this.getInventory();
    const target = items.find(it => it.id === itemId);
    if (!target) return;

    const resolvedRole = target.characterRole;
    const resolvedGame = target.gameId;
    const resolvedKind = target.kind;

    const updated = items.map(it => {
      if (it.id === itemId) return { ...it, isEquipped: true };
      if (resolvedRole && it.characterRole === resolvedRole && it.kind === resolvedKind) {
        return { ...it, isEquipped: false };
      }
      if (!resolvedRole && it.gameId === resolvedGame && it.kind === resolvedKind) {
        return { ...it, isEquipped: false };
      }
      return it;
    });

    this.saveInventory(updated);
  }

  public unequipItem(itemId: string) {
    const items = this.getInventory();
    const updated = items.map(it => it.id === itemId ? { ...it, isEquipped: false } : it);
    this.saveInventory(updated);
  }

  public fuseItem(itemId: string): { success: boolean; updatedItem?: StoredInventoryItem; fromLevel: number; toLevel: number; cost: number } {
    const items = this.getInventory();
    const target = items.find(it => it.id === itemId);
    if (!target || target.level >= 5) return { success: false, fromLevel: 1, toLevel: 1, cost: 0 };

    const cost = getRequiredFusionCopies(target.level);
    if (target.duplicates < cost) return { success: false, fromLevel: target.level, toLevel: target.level, cost };

    const fromLevel = target.level;
    const toLevel = target.level + 1;
    const updatedItem: StoredInventoryItem = {
      ...target,
      level: toLevel,
      duplicates: target.duplicates - cost,
    };

    const updatedList = items.map(it => it.id === itemId ? updatedItem : it);
    this.saveInventory(updatedList);

    return {
      success: true,
      updatedItem,
      fromLevel,
      toLevel,
      cost,
    };
  }

  public autoFuseAll(characterRole: HeroRole): { totalFusions: number; highestItem?: StoredInventoryItem; fromLvl: number; toLvl: number; totalCost: number } {
    const items = this.getInventory();
    let totalFusions = 0;
    let highestItem: StoredInventoryItem | undefined;
    let fromLvl = 1;
    let toLvl = 2;
    let totalCost = 0;

    const updatedList = items.map(it => {
      if (it.characterRole !== characterRole) return it;

      let curLvl = it.level;
      let curDup = it.duplicates;
      let upgraded = false;

      while (curLvl < 5 && curDup >= getRequiredFusionCopies(curLvl)) {
        const cost = getRequiredFusionCopies(curLvl);
        curDup -= cost;
        totalCost += cost;
        fromLvl = curLvl;
        curLvl += 1;
        toLvl = curLvl;
        upgraded = true;
        totalFusions++;
      }

      if (upgraded) {
        highestItem = { ...it, level: curLvl, duplicates: curDup };
        return highestItem;
      }
      return it;
    });

    if (totalFusions > 0) {
      this.saveInventory(updatedList);
    }

    return { totalFusions, highestItem, fromLvl, toLvl, totalCost };
  }

  public getUnlockedChampions(): HeroRole[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAMPIONS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return ['SHOOTER'];
  }

  public saveUnlockedChampions(champions: HeroRole[]) {
    localStorage.setItem(STORAGE_KEYS.CHAMPIONS, JSON.stringify(champions));
    this.notify();
  }

  public unlockChampion(role: HeroRole, price: number): boolean {
    const wallet = this.getWallet();
    if (wallet.stardust < price) return false;

    const champs = this.getUnlockedChampions();
    if (!champs.includes(role)) {
      this.saveUnlockedChampions([...champs, role]);
    }

    this.updateWallet({ stardust: wallet.stardust - price });
    return true;
  }
}

export const cosmeticsStore = new CosmeticsStore();
export default cosmeticsStore;
